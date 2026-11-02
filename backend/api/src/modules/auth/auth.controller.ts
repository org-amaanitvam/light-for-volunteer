import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type {
  JwtAccessPayload,
  JwtRefreshPayload,
} from './interfaces/jwt-payload.interface';
import { AuthService } from './services/auth.service';
import { ExchangeService } from './services/exchange.service';
import type { User } from '../users/entities/user.entity';

/** Stricter per-route limits for credential endpoints (env-configurable). */
const authThrottle = {
  default: {
    ttl: (Number(process.env.THROTTLE_AUTH_TTL) || 60) * 1000,
    limit: Number(process.env.THROTTLE_AUTH_LIMIT) || 10,
  },
};

type RequestWithUser = Request & { user?: User };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly exchangeCodes: ExchangeService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('signup')
  @Throttle(authThrottle)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Local registration (volunteer | organisation | mentor)' })
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Public()
  @Post('login')
  @Throttle(authThrottle)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Email + password login' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @Throttle(authThrottle)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the token pair (60s grace replay, reuse detection)' })
  refresh(
    @CurrentUser() payload: JwtRefreshPayload,
    @Body() dto: RefreshTokenDto,
  ) {
    return this.auth.refresh(payload, dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the presented refresh token (idempotent)' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  @Public()
  @Get('google/enabled')
  googleEnabled() {
    return { enabled: this.config.get<boolean>('auth.google.enabled') ?? false };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Start the Google OAuth 2.0 handshake' })
  google(@Res() _res: Response): void {
    // The guard redirects to Google; nothing to do here.
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Google redirects here; issues an exchange code' })
  async googleCallback(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.redirect(`${this.webOrigin()}/auth/callback`);
      return;
    }
    const code = await this.exchangeCodes.issue(userId);
    res.redirect(
      `${this.webOrigin()}/auth/callback?code=${encodeURIComponent(code)}`,
    );
  }

  @Public()
  @Post('exchange')
  @Throttle(authThrottle)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consume the one-time OAuth code for a token pair (optional role choice)',
  })
  exchange(@Body() dto: ExchangeCodeDto) {
    return this.auth.exchange(dto.code, dto.role);
  }

  @Get('me')
  @ApiOperation({ summary: 'Sanitized profile of the authenticated user' })
  me(@CurrentUser() payload: JwtAccessPayload) {
    return this.auth.me(payload);
  }

  @Roles('admin')
  @Get('admin/ping')
  @ApiOperation({ summary: 'RBAC smoke target — admin role required' })
  adminPing() {
    return { ok: true, scope: 'admin' };
  }

  private webOrigin(): string {
    return (this.config.get<string>('app.webOrigin') ?? '').replace(/\/+$/, '');
  }
}

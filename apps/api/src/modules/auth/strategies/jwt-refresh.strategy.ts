import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtRefreshPayload } from '../interfaces/jwt-payload.interface';

/**
 * Validates the refresh token, which is sent in the **request body**
 * (`{ refreshToken }`) rather than the Authorization header.
 * Signature + expiry are checked here; rotation/reuse logic lives in
 * `AuthService.refresh()`.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('auth.refresh.secret')!,
    });
  }

  validate(payload: JwtRefreshPayload): JwtRefreshPayload {
    if (payload?.typ !== 'refresh' || !payload.sub || !payload.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      typ: 'refresh',
      jti: payload.jti,
    };
  }
}

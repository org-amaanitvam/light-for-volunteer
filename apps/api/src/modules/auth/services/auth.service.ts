import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthResponse, AuthRole, AuthUserResponse, TokenPair } from '@lfv/types';
import { DEFAULT_ROLE, isAuthRole } from '@lfv/types';
import * as argon2 from 'argon2';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import type { LoginDto } from '../dto/login.dto';
import type { SignupDto } from '../dto/signup.dto';
import type {
  JwtAccessPayload,
  JwtRefreshPayload,
} from '../interfaces/jwt-payload.interface';
import { SESSION_STORE, type SessionStore } from './session.store';
import { ExchangeService } from './exchange.service';
import { TokenService } from './token.service';
import { toAuthUserResponse } from '../utils/auth-user.mapper';

const isUniqueViolation = (error: unknown): boolean =>
  (error as { driverError?: { code?: string } })?.driverError?.code === '23505';

/**
 * Authentication business logic: password hashing, token pair issuance,
 * refresh rotation with reuse detection, logout, Google exchange and the
 * current-user profile.
 *
 * Storage rules live behind `SessionStore` (Redis primary / Postgres
 * fallback); signing rules live in `TokenService`.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /** Lazy argon2 hash used to equalize login timing for unknown emails. */
  private static timingHash: string | null = null;

  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
    private readonly exchangeCodes: ExchangeService,
    @Inject(SESSION_STORE) private readonly sessions: SessionStore,
  ) {}

  // ---------------------------------------------------------------- public

  async signup(dto: SignupDto): Promise<AuthResponse> {
    const role = this.resolveSelfAssignableRole(dto.role);

    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    let user: User;
    try {
      user = await this.users.create({
        email: dto.email,
        name: dto.name,
        passwordHash,
        role,
      });
    } catch (error) {
      // Two concurrent signups with the same email → unique index fires.
      if (isUniqueViolation(error)) {
        throw new ConflictException('An account with this email already exists');
      }
      throw error;
    }

    this.logger.log(`Signup: ${user.id} as ${user.role}`);
    return this.respond(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      // Spend the same time as a real verification so response timing does
      // not reveal whether the email exists (Google-only accounts included).
      await this.timingVerify(dto.password);
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.respond(user);
  }

  /**
   * Rotation with reuse detection:
   *
   * | state                              | action                              |
   * |------------------------------------|-------------------------------------|
   * | active hash matches                | rotate (new pair, old → grace)      |
   * | grace hash matches                 | idempotent replay → same pair       |
   * | hash mismatch (active/grace)       | revoke ALL sessions → 401           |
   * | valid signature, no record at all  | rotated beyond grace → revoke-all   |
   */
  async refresh(
    payload: JwtRefreshPayload,
    presentedToken: string,
  ): Promise<TokenPair> {
    const userId = payload.sub;
    const jti = payload.jti;
    const presentedHash = this.tokens.hash(presentedToken);

    const active = await this.sessions.getActive(userId, jti);
    if (active) {
      if (active !== presentedHash) {
        await this.sessions.revokeAll(userId);
        this.logger.warn(`Refresh reuse detected for user ${userId} (active)`);
        throw new UnauthorizedException('Refresh token reuse detected');
      }

      const user = await this.users.findById(userId);
      if (!user) {
        await this.sessions.revokeAll(userId);
        throw new UnauthorizedException('Account no longer exists');
      }

      const pair = await this.issueTokenPair(user);
      await this.sessions.promoteToGrace(userId, jti, active, pair);
      return pair;
    }

    const grace = await this.sessions.getGrace(userId, jti);
    if (grace) {
      if (grace.tokenHash !== presentedHash) {
        await this.sessions.revokeAll(userId);
        this.logger.warn(`Refresh reuse detected for user ${userId} (grace)`);
        throw new UnauthorizedException('Refresh token reuse detected');
      }
      // Second browser tab replaying the just-rotated token gets the pair
      // the first tab already received — both stay logged in.
      return grace.issued;
    }

    // Signature was valid but no record exists: rotated away long ago (or
    // evicted). Treat as stolen-token replay and kill every session.
    await this.sessions.revokeAll(userId);
    this.logger.warn(`Stale refresh token for user ${userId}; sessions revoked`);
    throw new UnauthorizedException('Refresh token is no longer valid');
  }

  /** Idempotent — invalid/garbage tokens still return 204. */
  async logout(presentedToken: string): Promise<void> {
    const payload = await this.tokens.tryVerifyRefresh(presentedToken);
    if (!payload) return;
    await this.sessions.revoke(payload.sub, payload.jti);
    this.logger.log(`Logout: user ${payload.sub}, session ${payload.jti}`);
  }

  async exchange(code: string, requestedRole?: string): Promise<AuthResponse> {
    const userId = await this.exchangeCodes.consume(code);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired exchange code');
    }

    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }

    if (requestedRole && requestedRole !== user.role) {
      if (!isAuthRole(requestedRole)) {
        throw new ForbiddenException(
          'Administrators are provisioned internally and cannot be self-assigned',
        );
      }
      if (user.role !== DEFAULT_ROLE) {
        throw new ForbiddenException(
          'Your role has already been chosen and can only be changed by an admin',
        );
      }
      await this.users.updateRole(user.id, requestedRole);
      user.role = requestedRole;
      this.logger.log(`Exchange: user ${user.id} chose role ${requestedRole}`);
    }

    return this.respond(user);
  }

  async me(payload: JwtAccessPayload): Promise<AuthUserResponse> {
    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }
    return toAuthUserResponse(user);
  }

  // --------------------------------------------------------------- private

  private resolveSelfAssignableRole(role: string | undefined): AuthRole {
    if (!role) return DEFAULT_ROLE;
    if (!isAuthRole(role)) {
      throw new ForbiddenException(
        'Administrators are provisioned internally and cannot self-sign-up',
      );
    }
    return role;
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const jti = this.tokens.newTokenId();
    const [accessToken, refreshToken] = await Promise.all([
      this.tokens.signAccessToken(user),
      this.tokens.signRefreshToken(user, jti),
    ]);
    await this.sessions.saveActive(user.id, jti, this.tokens.hash(refreshToken));
    return { accessToken, refreshToken };
  }

  private async respond(user: User): Promise<AuthResponse> {
    const pair = await this.issueTokenPair(user);
    return { ...pair, user: toAuthUserResponse(user) };
  }

  private async timingVerify(password: string): Promise<void> {
    AuthService.timingHash ??= await argon2.hash('timing-equalizer');
    await argon2.verify(AuthService.timingHash, password).catch(() => undefined);
  }
}

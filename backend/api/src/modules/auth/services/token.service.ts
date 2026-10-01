import { createHash, randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import type { Role } from '@lfv/types';
import type { JwtAccessPayload, JwtRefreshPayload } from '../interfaces/jwt-payload.interface';

interface SignableUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * All JWT signing/verification and token hashing lives here.
 *
 * - Access token  → 15m, `typ: 'access'`, HS256 with `JWT_ACCESS_SECRET`.
 * - Refresh token → 7d,  `typ: 'refresh'` + `jti` (rotation id),
 *   HS256 with `JWT_REFRESH_SECRET`.
 * - Stored value in Redis/Postgres is `sha256(token)` — the JWT signature
 *   already guarantees integrity, so a slow password KDF buys nothing here.
 */
@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly accessTtl: string;
  private readonly refreshSecret: string;
  private readonly refreshTtl: string;

  constructor(
    config: ConfigService,
    private readonly jwt: JwtService,
  ) {
    this.accessSecret = config.get<string>('auth.access.secret')!;
    this.accessTtl = config.get<string>('auth.access.ttl') ?? '15m';
    this.refreshSecret = config.get<string>('auth.refresh.secret')!;
    this.refreshTtl = config.get<string>('auth.refresh.ttl') ?? '7d';
  }

  signAccessToken(user: SignableUser): Promise<string> {
    const payload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      typ: 'access',
    };
    return this.jwt.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessTtl as JwtSignOptions['expiresIn'],
    });
  }

  signRefreshToken(user: SignableUser, jti: string): Promise<string> {
    const payload: JwtRefreshPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      typ: 'refresh',
      jti,
    };
    return this.jwt.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshTtl as JwtSignOptions['expiresIn'],
    });
  }

  /**
   * Signature check ignoring expiry — logout must be able to revoke a token
   * that just expired (and stays idempotent for garbage input).
   */
  async tryVerifyRefresh(token: string): Promise<JwtRefreshPayload | null> {
    try {
      const payload = await this.jwt.verifyAsync<JwtRefreshPayload>(token, {
        secret: this.refreshSecret,
        ignoreExpiration: true,
      });
      if (payload?.typ === 'refresh' && payload.sub && payload.jti) return payload;
      return null;
    } catch {
      return null;
    }
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  newTokenId(): string {
    return randomUUID();
  }
}

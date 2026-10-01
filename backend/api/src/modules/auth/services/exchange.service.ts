import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomUUID } from 'crypto';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './session.store';

const EXCHANGE_PREFIX = 'auth:excode:';
/** Codes minted without Redis are prefixed so `consume()` can tell them apart. */
const SIGNED_CODE_PREFIX = 'j.';

/**
 * One-time exchange codes for the Google OAuth handshake.
 *
 * 1. Callback → `issue(userId)` → 60s code (Redis `auth:excode:<code>`).
 * 2. Frontend → `POST /auth/exchange { code }` → `consume()` returns the user.
 *
 * Redis gives strict single-use (GETDEL). If Redis is unavailable the code
 * degrades to a signed JWT-style token (`j.` prefix) — still 60s and
 * signature-protected, but replayable inside that window (documented).
 */
@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);
  private readonly ttlSeconds: number;
  private readonly accessSecret: string;

  constructor(
    config: ConfigService,
    private readonly jwt: JwtService,
    @Optional() @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
  ) {
    this.ttlSeconds = config.get<number>('auth.exchangeCodeTtlSeconds') ?? 60;
    this.accessSecret = config.get<string>('auth.access.secret')!;
  }

  async issue(userId: string): Promise<string> {
    if (this.redis && this.redis.status === 'ready') {
      try {
        const code = randomBytes(32).toString('base64url');
        await this.redis.set(
          `${EXCHANGE_PREFIX}${code}`,
          JSON.stringify({ userId }),
          'EX',
          this.ttlSeconds,
        );
        return code;
      } catch (error) {
        this.logger.warn(
          `Redis exchange write failed (${(error as Error).message}); minting signed code instead`,
        );
      }
    }

    const token = await this.jwt.signAsync(
      { sub: userId, typ: 'exchange', jti: randomUUID() },
      { secret: this.accessSecret, expiresIn: `${this.ttlSeconds}s` },
    );
    return `${SIGNED_CODE_PREFIX}${token}`;
  }

  /** Returns the userId, or null when the code is unknown/expired/tampered. */
  async consume(code: string): Promise<string | null> {
    if (code.startsWith(SIGNED_CODE_PREFIX)) {
      try {
        const payload = await this.jwt.verifyAsync<{ sub?: string; typ?: string }>(
          code.slice(SIGNED_CODE_PREFIX.length),
          { secret: this.accessSecret },
        );
        return payload?.typ === 'exchange' && payload.sub ? payload.sub : null;
      } catch {
        return null;
      }
    }

    if (!this.redis) return null;
    try {
      const raw = await this.redis.getdel(`${EXCHANGE_PREFIX}${code}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { userId?: string };
      return parsed.userId ?? null;
    } catch {
      return null;
    }
  }
}

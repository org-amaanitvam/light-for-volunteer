import { Logger } from '@nestjs/common';
import type { TokenPair } from '@lfv/types';
import {
  type GraceRecord,
  type SessionStore,
} from './session.store';

/**
 * Redis-first wrapper with automatic Postgres fallback.
 *
 * The first Redis error opens a 15s circuit breaker (requests keep being
 * served from Postgres), after which Redis is probed again — recovery is
 * automatic, so auth never hard-fails when the cache layer is down.
 *
 * Boundary comment: Suryansh owns the Redis deployment; this class owns the
 * degraded-mode behaviour.
 */
export class FallbackSessionStore implements SessionStore {
  private readonly logger = new Logger(FallbackSessionStore.name);
  private downUntil = 0;
  private static readonly COOLDOWN_MS = 15_000;

  constructor(
    private readonly primary: SessionStore,
    private readonly secondary: SessionStore,
  ) {}

  get kind(): 'redis' | 'postgres' {
    return Date.now() < this.downUntil ? 'postgres' : this.primary.kind;
  }

  private async viaPrimary<T>(
    label: string,
    op: () => Promise<T>,
    fallback: () => Promise<T>,
  ): Promise<T> {
    if (Date.now() < this.downUntil) return fallback();
    try {
      return await op();
    } catch (error) {
      this.downUntil = Date.now() + FallbackSessionStore.COOLDOWN_MS;
      this.logger.warn(
        `Redis ${label} failed (${(error as Error).message}); using Postgres fallback for ${FallbackSessionStore.COOLDOWN_MS / 1000}s`,
      );
      return fallback();
    }
  }

  saveActive(userId: string, jti: string, tokenHash: string): Promise<void> {
    return this.viaPrimary(
      'saveActive',
      () => this.primary.saveActive(userId, jti, tokenHash),
      () => this.secondary.saveActive(userId, jti, tokenHash),
    );
  }

  getActive(userId: string, jti: string): Promise<string | null> {
    return this.viaPrimary(
      'getActive',
      () => this.primary.getActive(userId, jti),
      () => this.secondary.getActive(userId, jti),
    );
  }

  promoteToGrace(
    userId: string,
    jti: string,
    tokenHash: string,
    issued: TokenPair,
  ): Promise<void> {
    return this.viaPrimary(
      'promoteToGrace',
      () => this.primary.promoteToGrace(userId, jti, tokenHash, issued),
      () => this.secondary.promoteToGrace(userId, jti, tokenHash, issued),
    );
  }

  getGrace(userId: string, jti: string): Promise<GraceRecord | null> {
    return this.viaPrimary(
      'getGrace',
      () => this.primary.getGrace(userId, jti),
      () => this.secondary.getGrace(userId, jti),
    );
  }

  revoke(userId: string, jti: string): Promise<void> {
    return this.viaPrimary(
      'revoke',
      () => this.primary.revoke(userId, jti),
      () => this.secondary.revoke(userId, jti),
    );
  }

  revokeAll(userId: string): Promise<void> {
    return this.viaPrimary(
      'revokeAll',
      () => this.primary.revokeAll(userId),
      () => this.secondary.revokeAll(userId),
    );
  }
}

import type { TokenPair } from '@lfv/types';
import type Redis from 'ioredis';
import { UsersService } from '../../users/users.service';

/** DI tokens for the session store and the shared Redis client. */
export const SESSION_STORE = 'SESSION_STORE';
export const REDIS_CLIENT = 'REDIS_CLIENT';

export interface GraceRecord {
  tokenHash: string;
  issued: TokenPair;
}

/**
 * Persistence for refresh sessions.
 *
 * - `saveActive` / `getActive`      → current refresh token hash for (user, jti)
 * - `promoteToGrace` / `getGrace`   → short replay window so concurrent
 *   refreshes from two tabs return the SAME new pair instead of logging out
 * - `revoke` / `revokeAll`          → logout and reuse-detection kill switches
 */
export interface SessionStore {
  readonly kind: 'redis' | 'postgres';
  saveActive(userId: string, jti: string, tokenHash: string): Promise<void>;
  getActive(userId: string, jti: string): Promise<string | null>;
  promoteToGrace(
    userId: string,
    jti: string,
    tokenHash: string,
    issued: TokenPair,
  ): Promise<void>;
  getGrace(userId: string, jti: string): Promise<GraceRecord | null>;
  revoke(userId: string, jti: string): Promise<void>;
  revokeAll(userId: string): Promise<void>;
  close?(): Promise<void>;
}

const ACTIVE_PREFIX = 'auth:sess:';
const GRACE_PREFIX = 'auth:sessgrace:';
const INDEX_PREFIX = 'auth:sessidx:';

/**
 * Redis-backed store (primary).
 *
 * Keys (the contract with Suryansh's Redis deployment):
 *  - `auth:sess:<userId>:<jti>`      → sha256 of refresh token, TTL = 7d
 *  - `auth:sessgrace:<userId>:<jti>` → `{ tokenHash, issued }`, TTL = grace
 *  - `auth:sessidx:<userId>`         → SET of active jtis (for revoke-all)
 */
export class RedisSessionStore implements SessionStore {
  readonly kind = 'redis' as const;

  constructor(
    private readonly redis: Redis,
    private readonly ttlSeconds: number,
    private readonly graceSeconds: number,
  ) {}

  private activeKey(userId: string, jti: string): string {
    return `${ACTIVE_PREFIX}${userId}:${jti}`;
  }

  private graceKey(userId: string, jti: string): string {
    return `${GRACE_PREFIX}${userId}:${jti}`;
  }

  private indexKey(userId: string): string {
    return `${INDEX_PREFIX}${userId}`;
  }

  async saveActive(userId: string, jti: string, tokenHash: string): Promise<void> {
    const index = this.indexKey(userId);
    await this.redis.set(this.activeKey(userId, jti), tokenHash, 'EX', this.ttlSeconds);
    await this.redis.sadd(index, jti);
    await this.redis.expire(index, this.ttlSeconds);
  }

  async getActive(userId: string, jti: string): Promise<string | null> {
    return this.redis.get(this.activeKey(userId, jti));
  }

  async promoteToGrace(
    userId: string,
    jti: string,
    tokenHash: string,
    issued: TokenPair,
  ): Promise<void> {
    // NX keeps the first replay record when two tabs rotate concurrently.
    await this.redis.set(
      this.graceKey(userId, jti),
      JSON.stringify({ tokenHash, issued } satisfies GraceRecord),
      'EX',
      this.graceSeconds,
      'NX',
    );
    await this.redis.del(this.activeKey(userId, jti));
    await this.redis.srem(this.indexKey(userId), jti);
  }

  async getGrace(userId: string, jti: string): Promise<GraceRecord | null> {
    const raw = await this.redis.get(this.graceKey(userId, jti));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as GraceRecord;
    } catch {
      return null;
    }
  }

  async revoke(userId: string, jti: string): Promise<void> {
    await this.redis.del(this.activeKey(userId, jti), this.graceKey(userId, jti));
    await this.redis.srem(this.indexKey(userId), jti);
  }

  async revokeAll(userId: string): Promise<void> {
    const index = this.indexKey(userId);
    const members = await this.redis.smembers(index);
    const keys = members.flatMap((member) => [
      this.activeKey(userId, member),
      this.graceKey(userId, member),
    ]);
    if (keys.length > 0) await this.redis.del(...keys);
    await this.redis.del(index);
    // Grace records of already-rotated tokens self-expire within the grace
    // window and cannot resurrect a session — their active jti is gone.
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

/**
 * Postgres fallback (single active session, no grace window). Used when Redis
 * is disabled or unreachable — auth keeps working at the cost of multi-device
 * sessions and of the multi-tab refresh race during an outage.
 *
 * Sits on `users.refresh_token_hash`, the nullable column in the Auth schema.
 */
export class PostgresSessionStore implements SessionStore {
  readonly kind = 'postgres' as const;

  constructor(private readonly users: UsersService) {}

  async saveActive(userId: string, _jti: string, tokenHash: string): Promise<void> {
    await this.users.setRefreshTokenHash(userId, tokenHash);
  }

  async getActive(userId: string, _jti: string): Promise<string | null> {
    const user = await this.users.findById(userId);
    return user?.refreshTokenHash ?? null;
  }

  async promoteToGrace(): Promise<void> {
    // No grace in DB mode — the subsequent saveActive overwrite already
    // invalidates the old hash (documented limitation).
  }

  async getGrace(): Promise<GraceRecord | null> {
    return null;
  }

  async revoke(userId: string, _jti: string): Promise<void> {
    await this.users.setRefreshTokenHash(userId, null);
  }

  async revokeAll(userId: string): Promise<void> {
    await this.users.setRefreshTokenHash(userId, null);
  }
}

import { Inject, Injectable, Module, OnModuleDestroy, Optional } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type Redis from 'ioredis';
import { Redis as RedisClient } from 'ioredis';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { ExchangeService } from './services/exchange.service';
import { FallbackSessionStore } from './services/fallback-session.store';
import {
  PostgresSessionStore,
  REDIS_CLIENT,
  RedisSessionStore,
  SESSION_STORE,
  type SessionStore,
} from './services/session.store';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Shared Redis connection (null when `REDIS_URL` is empty).
 * Errors are swallowed here and handled by `FallbackSessionStore`, so a dead
 * Redis can never crash the process.
 */
const redisClientProvider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Redis | null => {
    const url = config.get<string | null>('redis.url');
    if (!url) return null;

    const client = new RedisClient(url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times: number) => Math.min(times * 500, 5000),
    });
    client.on('error', () => undefined);
    return client;
  },
};

/**
 * Session store selection:
 *  - `REDIS_URL` empty            → Postgres-only store
 *  - `REDIS_URL` set              → Redis store wrapped in the Postgres
 *                                   fallback (15s circuit breaker on errors)
 */
const sessionStoreProvider = {
  provide: SESSION_STORE,
  inject: [ConfigService, UsersService, REDIS_CLIENT],
  useFactory: (
    config: ConfigService,
    users: UsersService,
    redis: Redis | null,
  ): SessionStore => {
    const ttl = config.get<number>('auth.refresh.ttlSeconds') ?? 604800;
    const grace = config.get<number>('auth.refresh.graceSeconds') ?? 60;
    const dbStore = new PostgresSessionStore(users);
    if (!redis) return dbStore;
    return new FallbackSessionStore(
      new RedisSessionStore(redis, ttl, grace),
      dbStore,
    );
  },
};

/** Closes the shared Redis connection on shutdown. */
@Injectable()
class RedisLifecycle implements OnModuleDestroy {
  constructor(
    @Optional() @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
  ) {}

  async onModuleDestroy(): Promise<void> {
    if (this.redis) await this.redis.quit().catch(() => undefined);
  }
}

/**
 * Auth & RBAC module.
 *
 * Registers the two **global** guards:
 *   1. `JwtAuthGuard`   — bearer token required unless `@Public()`
 *   2. `RolesGuard`     — enforces `@Roles(...)`
 *
 * Exports the guards, the session store and `AuthService` so other feature
 * modules can use `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(...)`.
 */
@Module({
  imports: [UsersModule, JwtModule.register({ global: true })],
  controllers: [AuthController],
  providers: [
    redisClientProvider,
    sessionStoreProvider,
    RedisLifecycle,
    AuthService,
    TokenService,
    ExchangeService,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
    RolesGuard,
    GoogleAuthGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService, SESSION_STORE, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}

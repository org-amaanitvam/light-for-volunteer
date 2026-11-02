import './config/load-env';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AuthModule } from './modules/auth/auth.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { OrganisationsModule } from './modules/organisations/organisations.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SearchModule } from './modules/search/search.module';
import { StorageModule } from './modules/storage/storage.module';
import { UsersModule } from './modules/users/users.module';
import { VolunteersModule } from './modules/volunteers/volunteers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthController } from './modules/health/health.controller';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { MentorsModule } from './modules/mentors/mentors.module';
/**
 * Global guard order: JWT auth → RBAC roles (registered inside AuthModule),
 * then throttling registered here. Route opt-outs: `@Public()`,
 * role restrictions: `@Roles(...)`.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
  isGlobal: true,
  load: [
    appConfig,
    authConfig,
    databaseConfig,
    redisConfig,
    storageConfig,
  ],
  validationSchema: envValidationSchema,
}),
    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: Number(process.env.THROTTLE_GLOBAL_LIMIT ?? 100) },
    ]),
    ScheduleModule.forRoot(), // Suraj: cron for deadline reminders & leaderboard recalc
    DatabaseModule,
    UsersModule,
    AuthModule,
    VolunteersModule,
    OrganisationsModule,
    OpportunitiesModule,
    ApplicationsModule,
    ReviewsModule,
    AdminModule,
    GamificationModule,
    MessagingModule,
    NotificationsModule,
    StorageModule,
    SearchModule,
    ReportsModule,
    LeaderboardModule, // Suraj: leaderboard recalculation
    CertificatesModule,
    MentorsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}

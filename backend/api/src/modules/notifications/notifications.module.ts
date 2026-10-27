import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { Application } from '../../database/entities/application.entity';
import { MessagingModule } from '../messaging/messaging.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsScheduler } from './notifications.scheduler';
import { NotificationsService } from './notifications.service';

/**
 * Notifications module — in-app notifications, deadline reminders,
 * and real-time push via the messaging gateway.
 *
 * Exports `NotificationsService` so any module can call `create()` to
 * generate a notification (e.g. after an application status change,
 * review submission, or badge award).
 *
 * Owner: Suraj.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Opportunity, Application]),
    MessagingModule, // for real-time push via MessagingGateway.emitToUser()
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}

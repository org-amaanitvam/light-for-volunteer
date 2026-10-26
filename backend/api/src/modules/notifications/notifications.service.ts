import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { NotificationType } from '../../database/enums/notification-type.enum';
import { MessagingGateway } from '../messaging/messaging.gateway';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  referenceId?: string | null;
  referenceType?: string | null;
}

/**
 * Notification service — CRUD for in-app notifications + real-time push.
 *
 * Other modules call `create()` to generate a notification; the service
 * persists it to Postgres and pushes it to the user via WebSocket if they
 * are connected.
 *
 * Owner: Suraj.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @Optional()
    private readonly gateway: MessagingGateway | null,
  ) {}

  // ── Create ─────────────────────────────────────────────────────

  /**
   * Create and persist a notification, then push it via WebSocket.
   * Safe to call from any module that imports `NotificationsModule`.
   */
  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification = this.notificationRepo.create({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      reference_id: input.referenceId ?? null,
      reference_type: input.referenceType ?? null,
    });

    const saved = await this.notificationRepo.save(notification);

    // Push real-time if the gateway is available.
    if (this.gateway) {
      this.gateway.emitToUser(input.userId, 'notification', saved);
    }

    this.logger.debug(
      `Notification [${input.type}] created for user ${input.userId}`,
    );

    return saved;
  }

  // ── Read ───────────────────────────────────────────────────────

  /**
   * Paginated list of notifications for a user (newest first).
   */
  async getForUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { notifications, total };
  }

  /** Count of unread notifications for a user. */
  async countUnread(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { user_id: userId, is_read: false },
    });
  }

  // ── Update ─────────────────────────────────────────────────────

  /** Mark a single notification as read. */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.is_read = true;
    return this.notificationRepo.save(notification);
  }

  /** Mark all notifications as read for a user. */
  async markAllAsRead(userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepo.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
    return { affected: result.affected ?? 0 };
  }

  // ── Delete ─────────────────────────────────────────────────────

  /** Delete a single notification (only the owning user can do this). */
  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepo.remove(notification);
  }
}

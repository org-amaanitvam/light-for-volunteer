import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { NotificationType } from '../enums/notification-type.enum';

/**
 * In-app notification delivered to a user. Can be triggered by any module
 * (applications, reviews, gamification, messaging, deadlines).
 *
 * Owner: Suraj (notifications module).
 */
@Entity('notifications')
@Index(['user_id', 'is_read'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  /** Optional FK to the related resource (opportunity, application, review, etc.). */
  @Column({ type: 'uuid', nullable: true })
  reference_id: string | null;

  /** Type of the referenced resource, e.g. 'opportunity', 'application'. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  reference_type: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}

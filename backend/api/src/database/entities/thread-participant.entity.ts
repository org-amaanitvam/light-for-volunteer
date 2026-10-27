import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Thread } from './thread.entity';

/**
 * Tracks which users belong to a thread. Using a join table allows
 * future group-chat support without schema changes.
 *
 * Owner: Suraj (messaging module).
 */
@Entity('thread_participants')
@Unique(['thread_id', 'user_id'])
export class ThreadParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Thread, (thread) => thread.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: Thread;

  @Column('uuid')
  thread_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joined_at: Date;
}

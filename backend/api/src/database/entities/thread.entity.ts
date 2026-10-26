import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ThreadParticipant } from './thread-participant.entity';

/**
 * A chat thread (conversation). Threads group messages and participants.
 *
 * Owner: Suraj (messaging module).
 */
@Entity('threads')
export class Thread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => ThreadParticipant, (tp) => tp.thread, { cascade: true })
  participants: ThreadParticipant[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}

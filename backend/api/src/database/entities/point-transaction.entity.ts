import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

@Entity('point_transactions')
@Index('UQ_point_transactions_event_key', ['event_key'], { unique: true })
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  event_type: string;

  // A stable key makes each achievement award idempotent.
  @Column({ type: 'varchar', length: 255 })
  event_key: string;

  @Column({ type: 'int' })
  points: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}

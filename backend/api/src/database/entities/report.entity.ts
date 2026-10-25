import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

export enum ReportTargetType {
  REVIEW = 'review',
  MESSAGE = 'message',
}

export enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum ReportAction {
  REMOVE_CONTENT = 'remove_content',
  ISSUE_WARNING = 'issue_warning',
  DISMISS_REPORT = 'dismiss_report',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({
    type: 'enum',
    enum: ReportTargetType,
    enumName: 'reports_target_type_enum',
  })
  target_type: ReportTargetType;

  @Column({ type: 'uuid' })
  target_id: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    enumName: 'reports_status_enum',
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportAction,
    enumName: 'reports_action_enum',
    nullable: true,
  })
  action: ReportAction | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolved_by' })
  resolved_by: User | null;

  @Column({ type: 'text', nullable: true })
  resolution_note: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date | null;
}

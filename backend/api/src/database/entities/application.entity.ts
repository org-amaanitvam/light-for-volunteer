import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn 
} from 'typeorm';
import { Opportunity } from './opportunity.entity';
import { User } from './user.entity';
import { ApplicationStatus } from '../enums/application-status.enum';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Opportunity, opportunity => opportunity.applications,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity: Opportunity;

  @ManyToOne(() => User,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'volunteer_id' })
  volunteer: User;

  @Column({ type: 'text' })
  pitch_text: string;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.APPLIED })
  status: ApplicationStatus;

  @CreateDateColumn()
  applied_at: Date;
}
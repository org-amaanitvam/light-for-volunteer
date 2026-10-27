import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Organisation } from './organisation.entity';
import { OpportunityType } from '../enums/opportunity-type.enum';
import { LocationType } from '../enums/location-type.enum';
import { OpportunityStatus } from '../enums/opportunity-status.enum';
import { Application } from './application.entity';

@Entity('opportunities')
@Index(['status'])
@Index(['category'])
@Index(['type'])
@Index(['location_type'])
@Index(['deadline'])
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organisation, (org) => org.opportunities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  organisation: Organisation;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: OpportunityType })
  type: OpportunityType;

  @Column({ nullable: true })
  category: string;

  @Column('simple-array', { nullable: true })
  skills_required: string[];

  @Column({ type: 'enum', enum: LocationType })
  location_type: LocationType;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  duration: string | null;

  @Column({ type: 'int', default: 0 })
  points_reward: number;

  @Column({ type: 'int', default: 1 })
  openings: number;

  @Column({ type: 'date', nullable: true })
  deadline: Date | null;

  @Column({ type: 'enum', enum: OpportunityStatus, default: OpportunityStatus.DRAFT })
  status: OpportunityStatus;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Application, (application) => application.opportunity)
  applications: Application[];
}

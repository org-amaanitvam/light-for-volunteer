import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
  OneToOne, OneToMany, ManyToOne, JoinColumn 
} from 'typeorm';
import { User } from './user.entity';
import { VerificationStatus } from '../enums/verification-status.enum';
import { Opportunity } from './opportunity.entity';

@Entity('organisations')
export class Organisation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.organisation,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  org_name: string;

  @Column({ type: 'text', nullable: true })
  about: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  registration_type: string;

  @Column({ nullable: true })
  registration_id: string;

  @Column({ nullable: true })
  verification_doc_url: string;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  verification_status: VerificationStatus;

  @Column({ type: 'float', default: 0.0 })
  rating_avg: number;

  @OneToMany(() => Opportunity, opportunity => opportunity.organisation)
  opportunities: Opportunity[];
}
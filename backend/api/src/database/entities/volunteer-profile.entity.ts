import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
  OneToOne, OneToMany, ManyToOne, JoinColumn 
} from 'typeorm';
import { User } from './user.entity';

@Entity('volunteer_profiles')
export class VolunteerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.volunteerProfile,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', nullable: true })
  headline: string;

  @Column({ type: 'text', nullable: true })
  about: string;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column({ nullable: true })
  resume_url: string;

  @Column('simple-array', { nullable: true })
  portfolio_links: string[];

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column('simple-array', { nullable: true })
  badges: string[];

  @Column({ type: 'float', default: 0.0 })
  rating_avg: number;
}
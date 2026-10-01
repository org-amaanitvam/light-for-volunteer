import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
  OneToOne, OneToMany, ManyToOne, JoinColumn 
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { VolunteerProfile } from './volunteer-profile.entity';
import { Organisation } from './organisation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  city: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => VolunteerProfile, profile => profile.user)
  volunteerProfile: VolunteerProfile;

  @OneToOne(() => Organisation, org => org.user)
  organisation: Organisation;
}
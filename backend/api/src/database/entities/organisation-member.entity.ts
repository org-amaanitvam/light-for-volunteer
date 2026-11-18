import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { OrganisationMemberRole } from '../enums/organisation-member-role.enum';
import { OrganisationMemberStatus } from '../enums/organisation-member-status.enum';
import { Organisation } from './organisation.entity';
import { User } from '../../modules/users/entities/user.entity';

@Entity('organisation_members')
@Unique(['organisation', 'user'])
@Index(['organisation', 'status'])
@Index(['user', 'status'])
export class OrganisationMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organisation_id' })
  organisation!: Organisation;

  @ManyToOne(() => User, (user) => user.organisationMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'enum',
    enum: OrganisationMemberRole,
    enumName: 'organisation_member_role_enum',
  })
  role!: OrganisationMemberRole;

  @Column({
    type: 'enum',
    enum: OrganisationMemberStatus,
    enumName: 'organisation_member_status_enum',
    default: OrganisationMemberStatus.PENDING,
  })
  status!: OrganisationMemberStatus;

  @Column({ name: 'job_title', type: 'varchar', length: 255, nullable: true })
  jobTitle!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'decided_by' })
  decidedBy!: User | null;

  @Column({ name: 'decided_at', type: 'timestamptz', nullable: true })
  decidedAt!: Date | null;
}

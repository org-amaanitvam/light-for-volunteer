import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VerificationStatus } from '../enums/verification-status.enum';
import { Opportunity } from './opportunity.entity';
import { OrganisationMember } from './organisation-member.entity';
import { OrganisationDocument } from './organisation-document.entity';

@Entity('organisations')
export class Organisation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @OneToMany(() => OrganisationMember, (member) => member.organisation)
  members: OrganisationMember[];

  @OneToMany(() => Opportunity, opportunity => opportunity.organisation)
  opportunities: Opportunity[];

  @OneToMany(() => OrganisationDocument, (document) => document.organisation)
  documents: OrganisationDocument[];
}
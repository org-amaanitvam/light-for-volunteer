import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Organisation } from './organisation.entity';
import { User } from '../../modules/users/entities/user.entity';
import { OrganisationDocumentStatus } from '../enums/organisation-document-status.enum';
import { OrganisationDocumentType } from '../enums/organisation-document-type.enum';
import { OrganisationMember } from './organisation-member.entity';

@Entity('organisation_documents')
@Unique(['organisation', 'documentType'])
@Index(['organisation', 'status'])
@Index(['documentType', 'status'])
@Index(['fileKey'], { unique: true })
export class OrganisationDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organisation_id' })
  organisation!: Organisation;

  @ManyToOne(() => OrganisationMember, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by_membership_id' })
  uploadedByMembership!: OrganisationMember | null;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: OrganisationDocumentType,
    enumName: 'organisation_document_type_enum',
  })
  documentType!: OrganisationDocumentType;

  @Column({ name: 'file_key', type: 'varchar', length: 1024 })
  fileKey!: string;

  @Column({ name: 'storage_provider', type: 'varchar', length: 32, default: 'r2' })
  storageProvider!: string;

  @Column({ name: 'original_file_name', type: 'varchar', length: 255 })
  originalFileName!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ name: 'file_size', type: 'integer' })
  fileSize!: number;

  @Column({
    type: 'enum',
    enum: OrganisationDocumentStatus,
    enumName: 'organisation_document_status_enum',
    default: OrganisationDocumentStatus.PENDING,
  })
  status!: OrganisationDocumentStatus;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired!: boolean;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy!: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy!: User | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

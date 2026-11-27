import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, type QueryDeepPartialEntity } from 'typeorm';
import { Organisation } from '../../database/entities/organisation.entity';
import { OrganisationMember } from '../../database/entities/organisation-member.entity';
import { OrganisationMemberRole } from '../../database/enums/organisation-member-role.enum';
import { OrganisationMemberStatus } from '../../database/enums/organisation-member-status.enum';
import { Review } from '../../database/entities/review.entity';
import { VerificationStatus } from '../../database/enums/verification-status.enum';
import { CreateOrganisationDto } from '../../dtos/organisation/create-organisation.dto';
import { UpdateOrganisationDto } from '../../dtos/organisation/update-organisation.dto';
import { OrganisationDocument } from '../../database/entities/organisation-document.entity';
import { OrganisationDocumentsService } from './organisation-documents.service';
import { OrganisationDocumentStatus } from '../../database/enums/organisation-document-status.enum';
import { OrganisationAccessService } from './organisation-access.service';
import { StorageService } from '../storage/storage.service';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';

type OrganisationOwnerResponse = {
  id: string;
  orgName: string;
  about: string | null;
  website: string | null;
  registrationType: string | null;
  registrationId: string | null;
  verificationDocUrl: string | null;
  hasVerificationDocument: boolean;
  verificationStatus: VerificationStatus;
  ratingAvg: number;
  reviewCount: number;
};

type OrganisationPublicResponse = {
  id: string;
  orgName: string;
  about: string | null;
  website: string | null;
  registrationType: string | null;
  verificationStatus: VerificationStatus;
  ratingAvg: number;
  reviewCount: number;
};

type OrganisationChanges = {
  org_name?: string;
  about?: string | null;
  website?: string | null;
  registration_type?: string | null;
  registration_id?: string | null;
  verification_doc_url?: string | null;
};

/**
 * Organisation profiles can request verification, but only the Admin module
 * may set verified or rejected status. Resubmission returns rejected profiles
 * to pending.
 */
@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisations: Repository<Organisation>,
    @InjectRepository(OrganisationMember)
    private readonly members: Repository<OrganisationMember>,
    @InjectRepository(Review)
    private readonly reviews: Repository<Review>,
    @InjectRepository(OrganisationDocument)
    private readonly organisationDocuments: Repository<OrganisationDocument>,
    private readonly organisationDocumentsService: OrganisationDocumentsService,
    private readonly dataSource: DataSource,
    private readonly organisationAccess: OrganisationAccessService,
    private readonly storage: StorageService,
  ) {}

  async create(
    userId: string,
    input: CreateOrganisationDto,
  ): Promise<OrganisationOwnerResponse> {
    const existing = await this.findByOwner(userId);
    if (existing) throw new ConflictException('Organisation profile already exists');

    const orgName = input.orgName.trim();
    if (!orgName) throw new BadRequestException('orgName must not be empty');
    this.assertVerificationDocumentOwner(userId, input.verificationDocUrl);

    const organisation = this.organisations.create();
    organisation.org_name = orgName;
    if (input.about !== undefined) organisation.about = input.about;
    if (input.website !== undefined) organisation.website = input.website;
    if (input.registrationType !== undefined) {
      organisation.registration_type = input.registrationType;
    }
    if (input.registrationId !== undefined) {
      organisation.registration_id = input.registrationId;
    }
    if (input.verificationDocUrl !== undefined) {
      organisation.verification_doc_url = input.verificationDocUrl;
    }
    organisation.verification_status = VerificationStatus.PENDING;

    try {
      const saved = await this.organisations.save(organisation);
      await this.members.save(
        this.members.create({
          organisation: saved,
          user: { id: userId },
          role: OrganisationMemberRole.OWNER,
          status: OrganisationMemberStatus.APPROVED,
          decidedBy: { id: userId },
          decidedAt: new Date(),
        }),
      );
      return this.toOwnerResponse(saved, userId);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Organisation profile already exists');
      }
      throw error;
    }
  }

  async getMe(userId: string): Promise<OrganisationOwnerResponse> {
    const membership = await this.organisationAccess.findApprovedMembership(userId);
    if (!membership?.organisation) throw new NotFoundException('Organisation profile has not been created');
    const organisation = membership.organisation;
    const ownerMembership =
      await this.organisationAccess.findApprovedOwnerMembershipForOrganisation(
        organisation.id,
      );
    return this.toOwnerResponse(
      organisation,
      ownerMembership?.user?.id ?? membership.user?.id ?? userId,
    );
  }

  async getMyVerificationDocumentDownloadUrl(user: JwtAccessPayload) {
    const membership = await this.organisationAccess.requireApprovedMembership(
      user.sub,
    );
    const reference = membership.organisation.verification_doc_url;
    if (!reference) {
      throw new NotFoundException('Organisation verification document not found');
    }

    if (reference.startsWith('https://')) {
      return { downloadUrl: reference, expiresIn: null };
    }

    const uploaderId = reference.match(
      /^verification-documents\/([0-9a-f-]{36})\//i,
    )?.[1];
    if (!uploaderId) {
      throw new NotFoundException('Organisation verification document not found');
    }

    return this.storage.createOrganisationDocumentDownloadUrl(
      user,
      reference,
      uploaderId,
    );
  }

  async updateMe(
    userId: string,
    input: UpdateOrganisationDto,
  ): Promise<OrganisationOwnerResponse> {
    const organisation = await this.findByOwner(userId);
    if (!organisation) throw new NotFoundException('Organisation profile not found');
    this.assertVerificationDocumentOwner(userId, input.verificationDocUrl);

    const changes: OrganisationChanges = {};
    if (input.orgName !== undefined) {
      const orgName = typeof input.orgName === 'string' ? input.orgName.trim() : '';
      if (!orgName) throw new BadRequestException('orgName must not be empty');
      changes.org_name = orgName;
    }
    if (input.about !== undefined) changes.about = input.about;
    if (input.website !== undefined) changes.website = input.website;
    if (input.registrationType !== undefined) {
      changes.registration_type = input.registrationType;
    }
    if (input.registrationId !== undefined) changes.registration_id = input.registrationId;
    if (input.verificationDocUrl !== undefined) {
      changes.verification_doc_url = input.verificationDocUrl;
    }

    const registrationDetailsChanged =
      (input.registrationType !== undefined &&
        input.registrationType !== organisation.registration_type) ||
      (input.registrationId !== undefined &&
        input.registrationId !== organisation.registration_id) ||
      (input.verificationDocUrl !== undefined &&
        input.verificationDocUrl !== organisation.verification_doc_url);

    if (
      organisation.verification_status === VerificationStatus.VERIFIED &&
      registrationDetailsChanged
    ) {
      throw new ConflictException(
        'Contact admin to change verified registration details',
      );
    }

    if (Object.keys(changes).length > 0) {
      await this.organisations.update(
        organisation.id,
        changes as QueryDeepPartialEntity<Organisation>,
      );
    }

    const updated = await this.organisations.findOne({ where: { id: organisation.id } });
    if (!updated) throw new NotFoundException('Organisation profile not found');
    return this.toOwnerResponse(updated, userId);
  }

  async resubmit(userId: string): Promise<OrganisationOwnerResponse> {
    const organisation = await this.findByOwner(userId);
    if (!organisation) throw new NotFoundException('Organisation profile not found');
    if (organisation.verification_status !== VerificationStatus.REJECTED) {
      throw new ConflictException('Only rejected organisations can be resubmitted');
    }

    const documents = await this.organisationDocuments.find({
      where: { organisation: { id: organisation.id } },
    });
    this.organisationDocumentsService.validateCompleteness(
      organisation.registration_type,
      documents,
    );

    await this.dataSource.transaction(async (manager) => {
      const result = await manager.update(
        Organisation,
        { id: organisation.id, verification_status: VerificationStatus.REJECTED },
        { verification_status: VerificationStatus.PENDING },
      );
      if (result.affected === 0) {
        throw new ConflictException('Only rejected organisations can be resubmitted');
      }

      await manager
        .getRepository(OrganisationDocument)
        .createQueryBuilder()
        .update()
        .set({
          status: OrganisationDocumentStatus.PENDING,
          rejectionReason: null,
        })
        .where('organisation_id = :organisationId', {
          organisationId: organisation.id,
        })
        .andWhere('status IN (:...statuses)', {
          statuses: [
            OrganisationDocumentStatus.REJECTED,
            OrganisationDocumentStatus.NEEDS_INFO,
          ],
        })
        .execute();
    });

    const updated = await this.organisations.findOne({ where: { id: organisation.id } });
    if (!updated) throw new NotFoundException('Organisation profile not found');
    return this.toOwnerResponse(updated, userId);
  }

  async getById(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<OrganisationOwnerResponse | OrganisationPublicResponse> {
    const organisation = await this.organisations.findOne({
      where: { id },
      relations: { members: { user: true } },
    });
    if (!organisation) throw new NotFoundException('Organisation not found');

    const isOwner = organisation.members?.some(
      (member) =>
        member.user?.id === userId &&
        member.role === OrganisationMemberRole.OWNER &&
        member.status === OrganisationMemberStatus.APPROVED,
    );
    const isAdmin = userRole === 'admin';
    if (
      organisation.verification_status !== VerificationStatus.VERIFIED &&
      !isOwner &&
      !isAdmin
    ) {
      throw new NotFoundException('Organisation not found');
    }

    const ownerId =
      organisation.members?.find(
        (member) =>
          member.role === OrganisationMemberRole.OWNER &&
          member.status === OrganisationMemberStatus.APPROVED,
      )?.user?.id ?? userId;

    if (isOwner || isAdmin) return this.toOwnerResponse(organisation, ownerId);
    return this.toPublicResponse(organisation, ownerId);
  }

  private async findByOwner(userId: string): Promise<Organisation | null> {
    const membership = await this.organisationAccess.findApprovedOwnerMembership(userId);
    return membership?.organisation ?? null;
  }

  private assertVerificationDocumentOwner(userId: string, document: string | undefined): void {
    if (
      document?.startsWith('verification-documents/') &&
      !document.startsWith(`verification-documents/${userId}/`)
    ) {
      throw new BadRequestException('Verification document must belong to this organisation');
    }
  }

  private async toOwnerResponse(organisation: Organisation, userId: string): Promise<OrganisationOwnerResponse> {
    return {
      id: organisation.id,
      orgName: organisation.org_name,
      about: organisation.about ?? null,
      website: organisation.website ?? null,
      registrationType: organisation.registration_type ?? null,
      registrationId: organisation.registration_id ?? null,
      verificationDocUrl: this.publicLegacyDocumentReference(
        organisation.verification_doc_url,
      ),
      hasVerificationDocument: Boolean(organisation.verification_doc_url),
      verificationStatus: organisation.verification_status,
      ratingAvg: organisation.rating_avg,
      reviewCount: await this.reviews.count({ where: { given_to: { id: userId } } }),
    };
  }

  private async toPublicResponse(organisation: Organisation, userId: string): Promise<OrganisationPublicResponse> {
    return {
      id: organisation.id,
      orgName: organisation.org_name,
      about: organisation.about ?? null,
      website: organisation.website ?? null,
      registrationType: organisation.registration_type ?? null,
      verificationStatus: organisation.verification_status,
      ratingAvg: organisation.rating_avg,
      reviewCount: await this.reviews.count({ where: { given_to: { id: userId } } }),
    };
  }

  private isUniqueViolation(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const queryError = error as { code?: string; driverError?: { code?: string } };
    return queryError.code === '23505' || queryError.driverError?.code === '23505';
  }

  private publicLegacyDocumentReference(value: string | null | undefined): string | null {
    if (!value || value.startsWith('verification-documents/')) return null;
    return value;
  }
}

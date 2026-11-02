import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type QueryDeepPartialEntity } from 'typeorm';
import { Organisation } from '../../database/entities/organisation.entity';
import { Review } from '../../database/entities/review.entity';
import { VerificationStatus } from '../../database/enums/verification-status.enum';
import { CreateOrganisationDto } from '../../dtos/organisation/create-organisation.dto';
import { UpdateOrganisationDto } from '../../dtos/organisation/update-organisation.dto';
import { User } from '../users/entities/user.entity';

type OrganisationOwnerResponse = {
  id: string;
  orgName: string;
  about: string | null;
  website: string | null;
  registrationType: string | null;
  registrationId: string | null;
  verificationDocUrl: string | null;
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
    @InjectRepository(Review)
    private readonly reviews: Repository<Review>,
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
    organisation.user = { id: userId } as User;
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
      return this.toOwnerResponse(saved, userId);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Organisation profile already exists');
      }
      throw error;
    }
  }

  async getMe(userId: string): Promise<OrganisationOwnerResponse> {
    const organisation = await this.findByOwner(userId);
    if (!organisation) throw new NotFoundException('Organisation profile has not been created');
    return this.toOwnerResponse(organisation, userId);
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

    const result = await this.organisations.update(
      { id: organisation.id, verification_status: VerificationStatus.REJECTED },
      { verification_status: VerificationStatus.PENDING },
    );
    if (result.affected === 0) {
      throw new ConflictException('Only rejected organisations can be resubmitted');
    }

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
      relations: { user: true },
    });
    if (!organisation) throw new NotFoundException('Organisation not found');

    const isOwner = organisation.user?.id === userId;
    const isAdmin = userRole === 'admin';
    if (
      organisation.verification_status !== VerificationStatus.VERIFIED &&
      !isOwner &&
      !isAdmin
    ) {
      throw new NotFoundException('Organisation not found');
    }

    if (isOwner || isAdmin) return this.toOwnerResponse(organisation, organisation.user.id);
    return this.toPublicResponse(organisation, organisation.user.id);
  }

  private findByOwner(userId: string): Promise<Organisation | null> {
    return this.organisations.findOne({ where: { user: { id: userId } } });
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
      verificationDocUrl: organisation.verification_doc_url ?? null,
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
}

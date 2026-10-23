import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organisation } from '../../database/entities/organisation.entity';
import { VerificationStatus } from '../../database/enums/verification-status.enum';
import { ReviewOrganisationDto } from '../../dtos/organisation/review-organisation.dto';

import { Opportunity } from '../../database/entities/opportunity.entity';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';
import { ReviewOpportunityDto } from '../../dtos/opportunity/review-opportunity.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,

    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
  ) { }

  //Implementation for Organisation Pending/Verification Service
  async getPendingOrganisations() {
    return this.organisationRepository.find({
      where: {
        verification_status: VerificationStatus.PENDING,
      },
      select: {
        id: true,
        org_name: true,
        about: true,
        website: true,
        registration_type: true,
        registration_id: true,
        verification_doc_url: true,
        verification_status: true,
        rating_avg: true,
      },
      order: {
        org_name: 'ASC',
      },
    });
  }

  async reviewOrganisation(
    id: string,
    dto: ReviewOrganisationDto,
  ) {
    const organisation = await this.organisationRepository.findOne({
      where: { id },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    if (
      organisation.verification_status !== VerificationStatus.PENDING
    ) {
      throw new NotFoundException(
        'Organisation is not awaiting verification',
      );
    }

    organisation.verification_status = dto.status;

    const updated = await this.organisationRepository.save(organisation);

    return {
      message:
        dto.status === VerificationStatus.VERIFIED
          ? 'Organisation approved successfully'
          : 'Organisation rejected successfully',
      organisation: {
        id: updated.id,
        org_name: updated.org_name,
        verification_status: updated.verification_status,
      },
    };
  }

  //Implementation for Opportunity Pending/Verification Service

  async getPendingOpportunities() {
    return this.opportunityRepository.find({
      where: {
        status: OpportunityStatus.PENDING_REVIEW,
      },
      relations: {
        organisation: {
          user: true,
        },
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async reviewOpportunity(
    id: string,
    dto: ReviewOpportunityDto,
  ) {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found.');
    }

    if (opportunity.status !== OpportunityStatus.PENDING_REVIEW) {
      throw new ConflictException(
        'Only opportunities pending review can be reviewed.',
      );
    }

    opportunity.status =
      dto.status === 'approved'
        ? OpportunityStatus.LIVE
        : OpportunityStatus.REJECTED;

    return this.opportunityRepository.save(opportunity);
  }
}
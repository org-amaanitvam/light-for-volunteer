import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organisation } from '../../database/entities/organisation.entity';
import { VerificationStatus } from '../../database/enums/verification-status.enum';
import { ReviewOrganisationDto } from '../../dtos/organisation/review-organisation.dto';

import { Opportunity } from '../../database/entities/opportunity.entity';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';
import { ReviewOpportunityDto } from '../../dtos/opportunity/review-opportunity.dto';
import { DataSource } from 'typeorm';
import { Report, ReportAction, ReportStatus, ReportTargetType } from '../../database/entities/report.entity';
import { Review } from '../../database/entities/review.entity';
import { Message } from '../../database/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { ResolveReportDto } from '../../dtos/report/resolve-report.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,

    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,

    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    private readonly dataSource: DataSource,
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


  //Implementation for Report Pending/Resolve Service
  async getPendingReports() {
    return this.reportRepository.find({
      where: { status: ReportStatus.PENDING },
      relations: { reporter: true },
      order: { created_at: 'ASC' },
    });
  }

  async resolveReport(
    id: string,
    adminId: string,
    dto: ResolveReportDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const reportRepo = manager.getRepository(Report);
      const report = await reportRepo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!report) {
        throw new NotFoundException('Report not found');
      }

      if (report.status !== ReportStatus.PENDING) {
        throw new ConflictException('Report has already been resolved');
      }

      if (dto.action === ReportAction.REMOVE_CONTENT) {
        if (report.target_type === ReportTargetType.REVIEW) {
          const result = await manager.getRepository(Review).delete({
            id: report.target_id,
          });

          if (!result.affected) {
            throw new NotFoundException('Reported review no longer exists');
          }
        } else {
          const result = await manager.getRepository(Message).delete({
            id: report.target_id,
          });

          if (!result.affected) {
            throw new NotFoundException('Reported message no longer exists');
          }
        }
      }

      report.action = dto.action;
      report.resolution_note = dto.resolution_note?.trim() || null;
      report.resolved_by = { id: adminId } as User;
      report.resolved_at = new Date();
      report.status =
        dto.action === ReportAction.DISMISS_REPORT
          ? ReportStatus.DISMISSED
          : ReportStatus.RESOLVED;

      const saved = await reportRepo.save(report);

      return {
        message: 'Report resolved successfully',
        report: {
          id: saved.id,
          status: saved.status,
          action: saved.action,
          resolution_note: saved.resolution_note,
          resolved_at: saved.resolved_at,
        },
      };
    });
  }
}
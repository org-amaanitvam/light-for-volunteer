import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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
import { AuditLog } from '../../database/entities/audit-log.entity';
import { Application } from '../../database/entities/application.entity';
import { StorageService } from '../storage/storage.service';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';
import { PresignDownloadDto } from '../../dtos/storage/storage.dto';

type OrganisationReviewAction =
  | 'approve'
  | 'reject'
  | 'request_information';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,

    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,

    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,

    private readonly dataSource: DataSource,

    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,

    private readonly storageService: StorageService,
  ) { }

  //Implementation for Organisation Pending/Verification Service
  async getPendingOrganisations() {
    return this.organisationRepository.find({
      where: {
        verification_status: VerificationStatus.PENDING,
      },
      relations: { members: { user: true } },
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
        members: {
          user: { id: true, name: true, email: true, city: true },
        },
      },
      order: {
        org_name: 'ASC',
      },
    });
  }

  async reviewOrganisation(
    id: string,
    adminId: string,
    dto: ReviewOrganisationDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const organisationRepo = manager.getRepository(Organisation);
      const auditRepo = manager.getRepository(AuditLog);

      const organisation = await organisationRepo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!organisation) {
        throw new NotFoundException('Organisation not found');
      }

      if (organisation.verification_status !== VerificationStatus.PENDING) {
        throw new ConflictException('Organisation is not awaiting verification');
      }

      const previousStatus = organisation.verification_status;
      organisation.verification_status = dto.status;
      const updated = await organisationRepo.save(organisation);

      await auditRepo.save(
        auditRepo.create({
          admin: { id: adminId } as User,
          action:
            dto.status === VerificationStatus.VERIFIED
              ? 'ORGANISATION_VERIFIED'
              : 'ORGANISATION_REJECTED',
          entity_type: 'organisation',
          entity_id: updated.id,
          details: {
            organisation_name: updated.org_name,
            previous_status: previousStatus,
            new_status: updated.verification_status,
          },
        }),
      );

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
    });
  }

  //Implementation for Opportunity Pending/Verification Service
  async getPendingOpportunities() {
    return this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.organisation', 'organisation')
      .leftJoinAndSelect('organisation.user', 'user')
      .select([
        'opportunity.id',
        'opportunity.title',
        'opportunity.description',
        'opportunity.type',
        'opportunity.category',
        'opportunity.skills_required',
        'opportunity.location_type',
        'opportunity.city',
        'opportunity.duration',
        'opportunity.points_reward',
        'opportunity.openings',
        'opportunity.deadline',
        'opportunity.status',
        'opportunity.created_at',
        'opportunity.updated_at',
        'organisation.id',
        'organisation.org_name',
        'organisation.about',
        'organisation.website',
        'organisation.registration_type',
        'organisation.registration_id',
        'organisation.verification_doc_url',
        'organisation.verification_status',
        'organisation.rating_avg',
        'user.id',
        'user.name',
        'user.email',
        'user.role',
      ])
      .where('opportunity.status = :status', {
        status: OpportunityStatus.PENDING_REVIEW,
      })
      .orderBy('opportunity.id', 'DESC')
      .getMany();
  }

  async reviewOpportunity(
    id: string,
    adminId: string,
    dto: ReviewOpportunityDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const opportunityRepo = manager.getRepository(Opportunity);
      const auditRepo = manager.getRepository(AuditLog);

      const opportunity = await opportunityRepo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!opportunity) {
        throw new NotFoundException('Opportunity not found');
      }

      if (opportunity.status !== OpportunityStatus.PENDING_REVIEW) {
        throw new ConflictException('Opportunity is not pending review');
      }

      const previousStatus = opportunity.status;
      opportunity.status =
        dto.status === 'approved'
          ? OpportunityStatus.LIVE
          : OpportunityStatus.REJECTED;

      const updated = await opportunityRepo.save(opportunity);

      await auditRepo.save(
        auditRepo.create({
          admin: { id: adminId } as User,
          action:
            dto.status === 'approved'
              ? 'OPPORTUNITY_APPROVED'
              : 'OPPORTUNITY_REJECTED',
          entity_type: 'opportunity',
          entity_id: updated.id,
          details: {
            opportunity_title: updated.title,
            previous_status: previousStatus,
            new_status: updated.status,
          },
        }),
      );

      return {
        message: `Opportunity ${dto.status} successfully`,
        opportunity: {
          id: updated.id,
          title: updated.title,
          status: updated.status,
        },
      };
    });
  }

  //Implementation for Report Pending/Resolve Service
  async getPendingReports() {
    return this.reportRepository.find({
      where: {
        status: ReportStatus.PENDING,
      },
      relations: {
        reporter: true,
      },
      select: {
        id: true,
        target_type: true,
        target_id: true,
        reason: true,
        status: true,
        action: true,
        resolution_note: true,
        created_at: true,
        updated_at: true,
        resolved_at: true,
        reporter: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          city: true,
        },
      },
      order: {
        created_at: 'ASC',
      },
    });
  }

  async resolveReport(
    id: string,
    adminId: string,
    dto: ResolveReportDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const reportRepo = manager.getRepository(Report);
      const auditRepo = manager.getRepository(AuditLog);
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

      const previousStatus = report.status;

      report.action = dto.action;
      report.resolution_note = dto.resolution_note?.trim() || null;
      report.resolved_by = { id: adminId } as User;
      report.resolved_at = new Date();
      report.status =
        dto.action === ReportAction.DISMISS_REPORT
          ? ReportStatus.DISMISSED
          : ReportStatus.RESOLVED;

      const saved = await reportRepo.save(report);
      await manager.getRepository(AuditLog).save(manager.getRepository(AuditLog).create({
        admin: { id: adminId } as User,
        action: `report_${dto.action}`,
        entity_type: report.target_type,
        entity_id: report.target_id,
        details: { reportId: report.id, status: saved.status, resolutionNote: saved.resolution_note },
      }));

      await auditRepo.save(
        auditRepo.create({
          admin: { id: adminId } as User,
          action: `REPORT_${String(dto.action).toUpperCase()}`,
          entity_type: 'report',
          entity_id: saved.id,
          details: {
            report_id: saved.id,
            reported_target_type: saved.target_type,
            reported_target_id: saved.target_id,
            reason: saved.reason,
            action: saved.action,
            previous_status: previousStatus,
            new_status: saved.status,
            resolution_note: saved.resolution_note,
          },
        }),
      );

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

  private async recordAudit(adminId: string, action: string, entityType: string, entityId: string, details: Record<string, unknown>) {
    await this.auditRepository.save(this.auditRepository.create({
      admin: { id: adminId } as User,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    }));
  }

  // Retrieve all the audit-logs 
  async getAuditLogs(query: {
    page?: number;
    limit?: number;
    action?: string;
    entity_type?: string;
    admin_id?: string;
    from?: string;
    to?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this.dataSource
      .getRepository(AuditLog)
      .createQueryBuilder('audit')
      .leftJoin('audit.admin', 'admin')
      .select([
        'audit.id',
        'audit.action',
        'audit.entity_type',
        'audit.entity_id',
        'audit.details',
        'audit.created_at',
        'admin.id',
        'admin.name',
        'admin.email',
      ]);

    if (query.action) {
      qb.andWhere('audit.action = :action', {
        action: query.action,
      });
    }

    if (query.entity_type) {
      qb.andWhere('audit.entity_type = :entity_type', {
        entity_type: query.entity_type,
      });
    }

    if (query.admin_id) {
      qb.andWhere('admin.id = :admin_id', {
        admin_id: query.admin_id,
      });
    }

    if (query.from) {
      const from = new Date(query.from);

      if (Number.isNaN(from.getTime())) {
        throw new BadRequestException('Invalid from date');
      }

      qb.andWhere('audit.created_at >= :from', { from });
    }

    if (query.to) {
      const to = new Date(query.to);

      if (Number.isNaN(to.getTime())) {
        throw new BadRequestException('Invalid to date');
      }

      qb.andWhere('audit.created_at <= :to', { to });
    }

    qb.orderBy('audit.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [logs, total] = await qb.getManyAndCount();

    return {
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getOrganisationDocument(
    organisationId: string,
    user: JwtAccessPayload,
  ) {
    const organisation = await this.organisationRepository.findOne({
      where: { id: organisationId },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    if (!organisation.verification_doc_url) {
      throw new NotFoundException(
        'Organisation verification document not found',
      );
    }

    const dto = {
      key: organisation.verification_doc_url,
    } as PresignDownloadDto;

    const signedUrl = await this.storageService.createDownloadUrl(
      user,
      dto,
    );

    return {
      organisation_id: organisation.id,
      organisation_name: organisation.org_name,
      document: {
        download_url: signedUrl.downloadUrl,
        expires_in: signedUrl.expiresIn,
      },
    };
  }

  async reviewOrganisationWithReason(
    organisationId: string,
    adminId: string,
    action: OrganisationReviewAction,
    reason?: string,
  ) {
    if (action !== 'approve' && !reason?.trim()) {
      throw new BadRequestException('Reason is required');
    }

    return this.dataSource.transaction(async (manager) => {
      const organisationRepo = manager.getRepository(Organisation);
      const auditRepo = manager.getRepository(AuditLog);

      const organisation = await organisationRepo.findOne({
        where: { id: organisationId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!organisation) {
        throw new NotFoundException('Organisation not found');
      }

      if (
        organisation.verification_status !== VerificationStatus.PENDING
      ) {
        throw new BadRequestException(
          'Only pending organisations can be reviewed',
        );
      }

      const previousStatus = organisation.verification_status;

      let newStatus: VerificationStatus = previousStatus;
      let auditAction: string;

      switch (action) {
        case 'approve':
          newStatus = VerificationStatus.VERIFIED;
          auditAction = 'ORGANISATION_APPROVED';
          break;

        case 'reject':
          newStatus = VerificationStatus.REJECTED;
          auditAction = 'ORGANISATION_REJECTED';
          break;

        case 'request_information':
          // Keep the organisation pending.
          newStatus = VerificationStatus.PENDING;
          auditAction = 'ORGANISATION_INFORMATION_REQUESTED';
          break;
      }

      organisation.verification_status = newStatus;

      await organisationRepo.save(organisation);

      await auditRepo.save({
        admin: { id: adminId },
        action: auditAction,
        entity_type: 'organisation',
        entity_id: organisation.id,
        details: {
          organisation_name: organisation.org_name,
          previous_status: previousStatus,
          new_status: newStatus,
          reason: reason ?? null,
        },
      });

      return {
        message: 'Organisation review completed successfully',
        organisation_id: organisation.id,
        verification_status: newStatus,
        action,
        reason: reason ?? null,
      };
    });
  }

  async exportApplications(adminId: string): Promise<string> {
    const applications = await this.applicationRepository.find({
      relations: {
        volunteer: true,
        opportunity: {
          organisation: true,
        },
      },
      order: {
        applied_at: 'DESC',
      },
    });

    const headers = [
      'Application ID',
      'Volunteer ID',
      'Volunteer Name',
      'Volunteer Email',
      'Opportunity ID',
      'Opportunity Title',
      'Organisation Name',
      'Pitch',
      'Application Status',
      'Applied At',
      'Completed At',
      'Completed Hours',
    ];

    const escapeCsv = (value: unknown): string => {
      let text = String(value ?? '');

      // Prevent spreadsheet formula injection.
      if (/^[\s]*[=+\-@]/.test(text)) {
        text = `'${text}`;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = applications.map((application) => [
      application.id,
      application.volunteer?.id,
      application.volunteer?.name,
      application.volunteer?.email,
      application.opportunity?.id,
      application.opportunity?.title,
      application.opportunity?.organisation?.org_name,
      application.pitch_text,
      application.status,
      application.applied_at?.toISOString(),
      application.completed_at?.toISOString() ?? '',
      application.completed_hours,
    ]);

    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\r\n');

    await this.dataSource.transaction(async (manager) => {
      const auditRepository = manager.getRepository(AuditLog);

      await auditRepository.save(
        auditRepository.create({
          admin: { id: adminId } as User,
          action: 'APPLICATIONS_CSV_EXPORTED',
          entity_type: 'applications',
          entity_id: null,
          details: {
            exported_count: applications.length,
            exported_at: new Date().toISOString(),
          },
        }),
      );
    });

    return csv;
  }
}
import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { VolunteerProfile } from '../../database/entities/volunteer-profile.entity';
import { ApplicationStatus } from '../../database/enums/application-status.enum';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';
import { CreateApplicationDto } from '../../dtos/application/create-application.dto';
import { GamificationService } from '../gamification/gamification.service';

/**
 * Pitch/application lifecycle.
 *
 * Owner: Samman. Auth (src/modules/auth) is the reference
 * for service/controller patterns.
 */
@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    @InjectRepository(VolunteerProfile)
    private readonly volunteerProfileRepo: Repository<VolunteerProfile>,
    private readonly gamificationService: GamificationService,
  ) { }

  async create(volunteerId: string, dto: CreateApplicationDto) {
    const opportunity = await this.opportunityRepo.findOne({
      where: { id: dto.opportunityId },
    });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status !== OpportunityStatus.LIVE) {
      throw new BadRequestException('Applications are closed for this opportunity');
    }

    const existing = await this.applicationRepo.findOne({
      where: {
        opportunity: { id: dto.opportunityId },
        volunteer: { id: volunteerId },
      },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this opportunity');
    }

    const previousApplicationCount = await this.applicationRepo.count({
      where: {
        volunteer: { id: volunteerId },
      },
    });

    // Profile rows are created lazily by the profile API. Ensure one exists
    // before awarding first-application points so a new volunteer can apply
    // without visiting their profile page first.
    await this.volunteerProfileRepo
      .createQueryBuilder()
      .insert()
      .into(VolunteerProfile)
      .values({ user: { id: volunteerId } as any })
      .orIgnore()
      .execute();

    try {
      const saved = await this.applicationRepo.save(
        this.applicationRepo.create({
          opportunity,
          volunteer: { id: volunteerId },
          pitch_text: dto.pitchText.trim(),
        }),
      );

      if (previousApplicationCount === 0) {
        try {
          await this.gamificationService.awardPoints(
            volunteerId,
            'first_application',
            `first-application:${volunteerId}`,
            10,
          );
          await this.gamificationService.awardBadge(volunteerId, 'FIRST_STEP');
        } catch (error) {
          // Keep a successful application successful if optional gamification
          // data (such as the badge catalogue) has not been seeded yet.
          this.logger.warn(
            `Application ${saved.id} was saved, but first-application rewards could not be issued: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      return {
        ...this.serialize(saved),
        opportunity_id: opportunity.id,
      };
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException('You have already applied to this opportunity');
      }
      throw err;
    }
  }

  async findMine(volunteerId: string) {
    const applications = await this.applicationRepo.find({
      where: { volunteer: { id: volunteerId } },
      relations: { opportunity: { organisation: true } },
      order: { applied_at: 'DESC' },
    });
    return applications.map((application) => this.serialize(application));
  }

  async findForOpportunity(opportunityId: string, userId: string, userRole: string) {
    const opportunity = await this.opportunityRepo.findOne({
      where: { id: opportunityId },
      relations: { organisation: { user: true } },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    if (userRole !== 'admin' && opportunity.organisation?.user?.id !== userId) {
      throw new ForbiddenException('You can only review applicants to your own opportunities');
    }

    const applications = await this.applicationRepo.find({
      where: { opportunity: { id: opportunityId } },
      relations: { volunteer: true },
      order: { applied_at: 'ASC' },
    });
    return applications.map((application) => ({
      ...this.serialize(application),
      volunteer: {
        id: application.volunteer.id,
        name: application.volunteer.name,
        email: application.volunteer.email,
        city: application.volunteer.city,
      },
    }));
  }

  async updateStatus(id: string, status: ApplicationStatus, userId: string, userRole: string) {
    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: { opportunity: { organisation: { user: true } }, volunteer: true },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (userRole !== 'admin' && application.opportunity.organisation?.user?.id !== userId) {
      throw new ForbiddenException('You can only update applicants to your own opportunities');
    }

    const allowed: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.APPLIED]: [ApplicationStatus.SHORTLISTED, ApplicationStatus.SELECTED, ApplicationStatus.REJECTED],
      [ApplicationStatus.SHORTLISTED]: [ApplicationStatus.SELECTED, ApplicationStatus.REJECTED],
      [ApplicationStatus.SELECTED]: [ApplicationStatus.COMPLETED, ApplicationStatus.REJECTED],
      [ApplicationStatus.COMPLETED]: [],
      [ApplicationStatus.REJECTED]: [],
    };
    if (status !== application.status && !allowed[application.status].includes(status)) {
      throw new BadRequestException(`Cannot move an application from ${application.status} to ${status}`);
    }

    application.status = status;
    const saved = await this.applicationRepo.save(application);

    if (status === ApplicationStatus.COMPLETED) {
      const volunteerId = application.volunteer.id;
      try {
        await this.volunteerProfileRepo
          .createQueryBuilder()
          .insert()
          .into(VolunteerProfile)
          .values({ user: { id: volunteerId } as any })
          .orIgnore()
          .execute();
        await this.gamificationService.awardPoints(
          volunteerId,
          'opportunity_completed',
          `opportunity-completed:${application.id}`,
          50,
        );
        const completedCount = await this.applicationRepo.count({
          where: { volunteer: { id: volunteerId }, status: ApplicationStatus.COMPLETED },
        });
        if (completedCount >= 5) await this.gamificationService.awardBadge(volunteerId, 'FIVE_COMPLETIONS');
      } catch (error) {
        this.logger.warn(
          `Application ${saved.id} was completed, but gamification rewards could not be issued: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return this.serialize(saved);
  }

  private serialize(application: Application) {
    return {
      id: application.id,
      opportunity_id: application.opportunity?.id,
      opportunity_title: application.opportunity?.title,
      organisation: application.opportunity?.organisation?.org_name,
      volunteer_id: application.volunteer?.id,
      pitch_text: application.pitch_text,
      status: application.status,
      applied_at: application.applied_at,
    };
  }
}

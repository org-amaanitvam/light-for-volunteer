import {
  BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';
import { CreateApplicationDto } from '../../dtos/application/create-application.dto';
import { GamificationService } from '../gamification/gamification.service';

// TODO: replace with the project's real application-status enum if one exists.
const APPLICATION_STATUSES = [
  'applied',
  'shortlisted',
  'selected',
  'completed',
  'rejected',
] as const;

/**
 * Pitch/application lifecycle.
 *
 * Owner: Samman. Auth (src/modules/auth) is the reference
 * for service/controller patterns.
 */
@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
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

    try {
      const saved = await this.applicationRepo.save(
        this.applicationRepo.create({
          opportunity,
          volunteer: { id: volunteerId },
          pitch_text: dto.pitchText.trim(),
        }),
      );

      if (previousApplicationCount === 0) {
        await this.gamificationService.awardPoints(
          volunteerId,
          'first_application',
          `first-application:${volunteerId}`,
          10,
        );

        await this.gamificationService.awardBadge(
          volunteerId,
          'FIRST_STEP',
        );
      }

      return {
        id: saved.id,
        opportunity_id: opportunity.id,
        volunteer_id: volunteerId,
        pitch_text: saved.pitch_text,
        status: saved.status,
        applied_at: saved.applied_at,
      };
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException('You have already applied to this opportunity');
      }
      throw err;
    }
  }

  async updateStatus(id: string, status: string) {
    if ((APPLICATION_STATUSES as readonly string[]).indexOf(status) === -1) {
      throw new BadRequestException(
        `Invalid status. Allowed values: ${APPLICATION_STATUSES.join(', ')}`,
      );
    }

    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: { opportunity: true, volunteer: true },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    application.status = status as Application['status'];
    const saved = await this.applicationRepo.save(application);

    if (status === 'completed') {
      const volunteerId = application.volunteer.id;

      await this.gamificationService.awardPoints(
        volunteerId,
        'opportunity_completed',
        `opportunity-completed:${application.id}`,
        50,
      );

      const completedCount = await this.applicationRepo.count({
        where: {
          volunteer: { id: volunteerId },
          status: 'completed' as Application['status'],
        },
      });

      if (completedCount >= 5) {
        await this.gamificationService.awardBadge(
          volunteerId,
          'FIVE_COMPLETIONS',
        );
      }
    }

    return {
      id: saved.id,
      opportunity_id: application.opportunity.id,
      volunteer_id: application.volunteer.id,
      pitch_text: saved.pitch_text,
      status: saved.status,
      applied_at: saved.applied_at,
    };
  }
}
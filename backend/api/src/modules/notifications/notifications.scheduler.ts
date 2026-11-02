import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { Application } from '../../database/entities/application.entity';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';
import { NotificationType } from '../../database/enums/notification-type.enum';
import { NotificationsService } from './notifications.service';

/**
 * Scheduled jobs for the notifications module.
 *
 * Runs deadline reminders daily at 8 AM. Queries opportunities with
 * deadlines in the next 48 hours and notifies volunteers who applied.
 *
 * Owner: Suraj.
 */
@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
  ) {}

  /**
   * Daily 8 AM — check for opportunities with deadlines within the next 48 h.
   * Create a notification for every volunteer who applied but hasn't been
   * reminded yet.
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM, { name: 'deadline-reminders' })
  async handleDeadlineReminders(): Promise<void> {
    this.logger.log('Running deadline reminder check…');

    const now = new Date();
    const twodays = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    try {
      // Find live opportunities whose deadline falls within the next 48 h.
      const opportunities = await this.opportunityRepo.find({
        where: {
          status: OpportunityStatus.LIVE,
          deadline: LessThanOrEqual(twodays) as unknown as Date,
        },
      });

      // Filter to only those whose deadline hasn't already passed.
      const upcoming = opportunities.filter(
        (opp) => opp.deadline && new Date(opp.deadline) >= now,
      );

      if (upcoming.length === 0) {
        this.logger.log('No upcoming deadlines found.');
        return;
      }

      let notificationCount = 0;

      for (const opp of upcoming) {
        // Find all applications for this opportunity.
        const applications = await this.applicationRepo.find({
          where: { opportunity: { id: opp.id } },
          relations: { volunteer: true },
        });

        for (const app of applications) {
          const volunteerId = (app.volunteer as { id: string })?.id;
          if (!volunteerId) continue;

          const alreadyReminded = await this.notificationsService.hasReferenceNotification(
            volunteerId,
            NotificationType.DEADLINE_REMINDER,
            opp.id,
          );
          if (alreadyReminded) continue;

          if (!opp.deadline) continue;
          const deadline = new Date(opp.deadline);
          const hoursLeft = Math.round(
            (deadline.getTime() - now.getTime()) / (1000 * 60 * 60),
          );

          await this.notificationsService.create({
            userId: volunteerId,
            type: NotificationType.DEADLINE_REMINDER,
            title: 'Deadline approaching',
            body: `"${opp.title}" deadline is in ~${hoursLeft} hours.`,
            referenceId: opp.id,
            referenceType: 'opportunity',
          });

          notificationCount++;
        }
      }

      this.logger.log(
        `Deadline reminders sent: ${notificationCount} notification(s) for ${upcoming.length} opportunity(ies).`,
      );
    } catch (error) {
      // Don't crash the cron on transient DB errors.
      this.logger.error('Deadline reminder check failed', error);
    }
  }
}

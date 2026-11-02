import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  ForbiddenException, 
  ConflictException 
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm'; // Import decorator here
import { Repository } from 'typeorm';                 // Import generic Repository here
import { Review } from '../../database/entities/review.entity';
import { Application } from '../../database/entities/application.entity';
import { CreateReviewDto } from '../../dtos/review/create-review.dto';
import { ApplicationStatus } from '../../database/enums/application-status.enum';
import { NotificationType } from '../../database/enums/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Two-way ratings after completion.
 *
 * Reviews can be submitted by either participant after an application is completed.
 */
@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    private readonly notifications: NotificationsService,
  ) {}

  async findMine(userId: string) {
    const reviews = await this.reviewRepo.find({
      where: { given_by: { id: userId } },
      relations: { application: { opportunity: { organisation: true } }, given_to: true, given_by: true },
      order: { created_at: 'DESC' },
    });
    return reviews.map((review) => ({
      id: review.id,
      applicationId: review.application?.id,
      opportunityTitle: review.application?.opportunity?.title ?? 'Opportunity',
      organisation: review.application?.opportunity?.organisation?.org_name ?? 'Organisation',
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      reviewerName: 'You',
      reviewedPerson: review.given_to?.name ?? 'Participant',
    }));
  }

  async create(givenById: string, role: string, dto: CreateReviewDto) {
    const application = await this.applicationRepo.findOne({
        where: { id: dto.applicationId },
        relations: {
            volunteer: true,
            opportunity: {
            organisation: {
                user: true, // TO CONFIRM: property name from Organisation entity
            },
            },
        },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== ApplicationStatus.COMPLETED) {
      throw new BadRequestException(
        'Reviews can only be submitted after completion',
      );
    }

    const volunteerId = application.volunteer.id;
    const organisationOwnerId = application.opportunity.organisation.user.id;
    let givenToId: string;
    if (role === 'volunteer' && volunteerId === givenById) givenToId = organisationOwnerId;
    else if (role === 'organisation' && organisationOwnerId === givenById) givenToId = volunteerId;
    else throw new ForbiddenException('Only participants of this completed application can review each other');
    if (givenById === givenToId) throw new BadRequestException('You cannot review yourself');

    const existing = await this.reviewRepo.findOne({
      where: {
        application: { id: dto.applicationId },
        given_by: { id: givenById },
        given_to: { id: givenToId },
      },
    });

    if (existing) {
      throw new ConflictException(
        'You have already reviewed this user for this application',
      );
    }

    const saved = await this.reviewRepo.save(
      this.reviewRepo.create({
        application: { id: dto.applicationId },
        given_by: { id: givenById },
        given_to: { id: givenToId },
        rating: dto.rating,
        comment: dto.comment,
      }),
    );

    try {
      await this.notifications.create({
        userId: givenToId,
        type: NotificationType.REVIEW_RECEIVED,
        title: 'You received a review',
        body: `A participant left feedback for ${application.opportunity.title}.`,
        referenceId: saved.id,
        referenceType: 'review',
      });
    } catch {
      // Keep the saved review successful if notifications are temporarily unavailable.
    }

    return {
      id: saved.id,
      applicationId: dto.applicationId,
      givenBy: givenById,
      givenTo: givenToId,
      rating: saved.rating,
      comment: saved.comment,
    };
  }
}

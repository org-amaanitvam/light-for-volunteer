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

/**
 * Two-way ratings after completion.
 *
 * Owner: Samman. Placeholder only — Auth
 * (src/modules/auth) is the reference for service/controller patterns.
 */
@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
  ) {}

  async create(givenById: string, dto: CreateReviewDto) {
    if (givenById === dto.givenTo) {
      throw new BadRequestException('You cannot review yourself');
    }

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

    const participants = [
      application.volunteer.id,
      application.opportunity.organisation.user.id, // TO CONFIRM
    ];

    if (
      !participants.includes(givenById) ||
      !participants.includes(dto.givenTo)
    ) {
      throw new ForbiddenException(
        'Only participants of this application can review each other',
      );
    }

    const existing = await this.reviewRepo.findOne({
      where: {
        application: { id: dto.applicationId },
        given_by: { id: givenById },
        given_to: { id: dto.givenTo },
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
        given_to: { id: dto.givenTo },
        rating: dto.rating,
        comment: dto.comment,
      }),
    );

    return {
      id: saved.id,
      applicationId: dto.applicationId,
      givenBy: givenById,
      givenTo: dto.givenTo,
      rating: saved.rating,
      comment: saved.comment,
    };
  }
}
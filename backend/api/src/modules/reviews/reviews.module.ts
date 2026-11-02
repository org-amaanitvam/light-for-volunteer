import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../../database/entities/review.entity';
import { Application } from '../../database/entities/application.entity';
import { NotificationsModule } from '../notifications/notifications.module';


@Module({
  imports: [TypeOrmModule.forFeature([Review, Application]), NotificationsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}

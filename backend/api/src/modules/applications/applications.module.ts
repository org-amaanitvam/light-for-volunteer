import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from '../../database/entities/application.entity';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { Organisation } from '../../database/entities/organisation.entity';
import { VolunteerProfile } from '../../database/entities/volunteer-profile.entity';
import { GamificationModule } from '../gamification/gamification.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Opportunity, Organisation, VolunteerProfile]),
    GamificationModule,
    NotificationsModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}

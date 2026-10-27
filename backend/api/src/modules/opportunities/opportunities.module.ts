import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { Organisation } from '../../database/entities/organisation.entity';
import { Application } from '../../database/entities/application.entity';
import { User } from '../users/entities/user.entity';
import { SearchModule } from '../search/search.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitySubscriber } from './opportunity.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Opportunity, Organisation, Application, User]),
    SearchModule,
    NotificationsModule,
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, OpportunitySubscriber],
  exports: [OpportunitiesService, TypeOrmModule],
})
export class OpportunitiesModule {}

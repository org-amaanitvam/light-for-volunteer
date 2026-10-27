import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Application } from 'src/database/entities/application.entity';
import { Opportunity } from 'src/database/entities/opportunity.entity';
import { GamificationModule } from '../gamification/gamification.module';

import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

@Module({
  imports : [
     TypeOrmModule.forFeature([Application, Opportunity]),
     GamificationModule
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}

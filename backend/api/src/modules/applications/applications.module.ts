import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from '../../database/entities/application.entity';
import { Opportunity } from '../../database/entities/opportunity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Opportunity])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
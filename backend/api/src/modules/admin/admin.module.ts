import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organisation } from '../../database/entities/organisation.entity';
import { Opportunity } from '../../database/entities/opportunity.entity';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation, Opportunity])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
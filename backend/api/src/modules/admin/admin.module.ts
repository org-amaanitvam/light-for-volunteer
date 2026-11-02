import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organisation } from '../../database/entities/organisation.entity';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { Report } from '../../database/entities/report.entity';
import { Review } from '../../database/entities/review.entity';
import { Message } from '../../database/entities/message.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation, Opportunity, Report, Review, Message, AuditLog])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

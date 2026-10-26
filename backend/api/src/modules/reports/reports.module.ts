import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Report } from '../../database/entities/report.entity';
import { Review } from '../../database/entities/review.entity';
import { Message } from '../../database/entities/message.entity';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Review, Message]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})

export class ReportsModule {}
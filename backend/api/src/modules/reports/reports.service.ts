import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Report, ReportStatus, ReportTargetType } from '../../database/entities/report.entity';
import { Review } from '../../database/entities/review.entity';
import { Message } from '../../database/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { CreateReportDto } from '../../dtos/report/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
    const reporterExists = await this.reportRepository.manager.getRepository(User).exists({ where: { id: reporterId } });

    if (!reporterExists) {
      throw new NotFoundException('Reporter not found');
    }

    if (dto.target_type === ReportTargetType.REVIEW) {
      const exists = await this.reviewRepository.exists({
        where: { id: dto.target_id },
      });

      if (!exists) {
        throw new NotFoundException('Reported review not found');
      }
    } else if (dto.target_type === ReportTargetType.MESSAGE) {
      const exists = await this.messageRepository.exists({
        where: { id: dto.target_id },
      });

      if (!exists) {
        throw new NotFoundException('Reported message not found');
      }
    } else {
      throw new BadRequestException('Unsupported report target');
    }

    const existingReport = await this.reportRepository.exists({
      where: {
        reporter: { id: reporterId },
        target_type: dto.target_type,
        target_id: dto.target_id,
        status: ReportStatus.PENDING,
      },
    });

    if (existingReport) {
      throw new BadRequestException(
        'You already have a pending report for this content',
      );
    }

    const report = this.reportRepository.create({
      reporter: { id: reporterId } as User,
      target_type: dto.target_type,
      target_id: dto.target_id,
      reason: dto.reason.trim(),
    });

    const saved = await this.reportRepository.save(report);

    return {
      message: 'Report submitted successfully',
      report: {
        id: saved.id,
        target_type: saved.target_type,
        target_id: saved.target_id,
        status: saved.status,
        created_at: saved.created_at,
      },
    };
  }
}
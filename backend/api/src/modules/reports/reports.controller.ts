import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateReportDto } from '../../dtos/report/create-report.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createReport(
    @CurrentUser('sub') reporterId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createReport(reporterId, dto);
  }
}
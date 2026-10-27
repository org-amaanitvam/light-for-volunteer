import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReviewOrganisationDto } from '../../dtos/organisation/review-organisation.dto';
import { AdminService } from './admin.service';
import { ReviewOpportunityDto } from '../../dtos/opportunity/review-opportunity.dto';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResolveReportDto } from '../../dtos/report/resolve-report.dto';


@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) { }

  @Public()
  @Get('ping')
  ping() {
    return { module: 'admin', status: 'ok', owner: 'Sourav' };
  }

  @Roles('admin')
  @Get('organisations/pending')
  getPendingOrganisations() {
    return this.service.getPendingOrganisations();
  }

  @Roles('admin')
  @Patch('organisations/:id/verify')
  reviewOrganisation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewOrganisationDto,
  ) {
    return this.service.reviewOrganisation(id, dto);
  }


  @ApiBearerAuth()
  @Roles('admin')
  @Get('opportunities/pending')
  getPendingOpportunities() {
    return this.service.getPendingOpportunities();
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Patch('opportunities/:id/review')
  reviewOpportunity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewOpportunityDto,
  ) {
    return this.service.reviewOpportunity(id, dto);
  }

  @Roles('admin')
  @Get('reports/pending')
  getPendingReports() {
    return this.service.getPendingReports();
  }

  @Roles('admin')
  @Patch('reports/:id/resolve')
  resolveReport(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') adminId: string,
    @Body() dto: ResolveReportDto,
  ) {
    return this.service.resolveReport(id, adminId, dto);
  }
}

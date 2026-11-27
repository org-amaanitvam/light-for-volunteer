import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReviewOrganisationDto } from '../../dtos/organisation/review-organisation.dto';
import { ReviewOpportunityDto } from '../../dtos/opportunity/review-opportunity.dto';
import { ResolveReportDto } from '../../dtos/report/resolve-report.dto';
import { AdminService } from './admin.service';
import { Response } from 'express';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';
import { ReviewOrganisationsDto } from '../../dtos/organisation/review-organisations.dto';
import { ReviewOrganisationDocumentDto } from '../../dtos/organisation-document/review-organisation-document.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) { }

  @Public()
  @Get('ping')
  ping() {
    return {
      module: 'admin',
      status: 'ok',
      owner: 'Sourav',
    };
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
    @CurrentUser('sub') adminId: string,
    @Body() dto: ReviewOrganisationDto,
  ) {
    return this.service.reviewOrganisation(id, adminId, dto);
  }

  @Roles('admin')
  @Get('opportunities/pending')
  getPendingOpportunities() {
    return this.service.getPendingOpportunities();
  }

  @Roles('admin')
  @Patch('opportunities/:id/review')
  reviewOpportunity(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') adminId: string,
    @Body() dto: ReviewOpportunityDto,
  ) {
    return this.service.reviewOpportunity(id, adminId, dto);
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

  @Roles('admin')
  @Get('audit-logs')
  getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('entity_type') entity_type?: string,
    @Query('admin_id') admin_id?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getAuditLogs({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      action,
      entity_type,
      admin_id,
      from,
      to,
    });
  }

  //GET - organisations document
  @Roles('admin')
  @Get('organisations/:id/documents')
  getOrganisationDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtAccessPayload,
  ) {
    return this.service.getOrganisationDocument(id, user);
  }

  @Roles('admin')
  @Get('organisations/:id/document-records')
  getOrganisationDocumentRecords(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getOrganisationDocumentRecords(id);
  }

  @Roles('admin')
  @Get('organisations/:id/documents/:documentId/download')
  getOrganisationDocumentRecordDownloadUrl(
    @Param('id', ParseUUIDPipe) organisationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtAccessPayload,
  ) {
    return this.service.getOrganisationDocumentRecordDownloadUrl(
      organisationId,
      documentId,
      user,
    );
  }

  @Roles('admin')
  @Patch('organisations/:id/documents/:documentId/review')
  reviewOrganisationDocument(
    @Param('id', ParseUUIDPipe) organisationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser('sub') adminId: string,
    @Body() dto: ReviewOrganisationDocumentDto,
  ) {
    return this.service.reviewOrganisationDocument(
      organisationId,
      documentId,
      adminId,
      dto,
    );
  }

  @Roles('admin')
  @Patch('organisations/:id/approve')
  approveOrganisation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.service.reviewOrganisationWithReason(
      id,
      adminId,
      'approve',
    );
  }

  @Roles('admin')
  @Patch('organisations/:id/reject')
  rejectOrganisation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewOrganisationsDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.service.reviewOrganisationWithReason(
      id,
      adminId,
      'reject',
      dto.reason,
    );
  }

  @Roles('admin')
  @Patch('organisations/:id/request-information')
  requestInformation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewOrganisationsDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.service.reviewOrganisationWithReason(
      id,
      adminId,
      'request_information',
      dto.reason,
    );
  }

  @Roles('admin')
  @Get('applications/export')
  async exportApplications(
    @CurrentUser('sub') adminId: string,
    @Res() res: Response,
  ) {
    const csv = await this.service.exportApplications(adminId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="applicants.csv"',
    );

    return res.send('\uFEFF' + csv);
  }
}
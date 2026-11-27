import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CertificatesService } from './certificates.service';

@ApiTags('certificates')
@ApiBearerAuth()
@Roles('volunteer')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'List certificates for completed opportunities' })
  list(@CurrentUser('sub') userId: string) {
    return this.certificates.listForVolunteer(userId);
  }

  @Get(':applicationId/pdf')
  @ApiOperation({ summary: 'Download a certificate PDF for a completed application' })
  async download(@CurrentUser('sub') userId: string, @Param('applicationId', ParseUUIDPipe) applicationId: string, @Res() response: Response) {
    const certificate = await this.certificates.createPdf(userId, applicationId);
    response.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${certificate.filename}"`, 'Content-Length': String(certificate.content.length), 'Cache-Control': 'private, no-store' });
    response.send(certificate.content);
  }
}

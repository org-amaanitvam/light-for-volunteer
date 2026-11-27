import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateOrganisationDocumentDto } from '../../dtos/organisation-document/create-organisation-document.dto';
import { OrganisationDocumentsService } from './organisation-documents.service';

@ApiTags('organisation-documents')
@ApiBearerAuth()
@Controller('organisations/me/documents')
export class OrganisationDocumentsController {
  constructor(private readonly service: OrganisationDocumentsService) {}

  @Roles('organisation')
  @Get('required')
  @ApiOperation({ summary: 'Get required documents for the organisation type' })
  getRequired(@CurrentUser('sub') userId: string) {
    return this.service.getRequiredDocuments(userId);
  }

  @Roles('organisation')
  @Get()
  @ApiOperation({ summary: 'List documents for an approved organisation membership' })
  list(@CurrentUser('sub') userId: string) {
    return this.service.list(userId);
  }

  @Roles('organisation')
  @Get(':id/download')
  @ApiOperation({ summary: 'Get a short-lived private download URL for an organisation document' })
  getDownloadUrl(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtAccessPayload,
  ) {
    return this.service.getDownloadUrl(user, documentId);
  }

  @Roles('organisation')
  @Post()
  @ApiOperation({ summary: 'Attach an uploaded verification object to the organisation' })
  attach(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateOrganisationDocumentDto,
  ) {
    return this.service.attach(user, dto);
  }

  @Roles('organisation')
  @Patch(':id')
  @ApiOperation({ summary: 'Replace a rejected or pending organisation document' })
  replace(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateOrganisationDocumentDto,
  ) {
    return this.service.replace(user, documentId, dto);
  }

}

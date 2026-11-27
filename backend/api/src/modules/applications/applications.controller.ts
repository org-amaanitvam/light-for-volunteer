import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from '../../dtos/application/create-application.dto';
import { UpdateApplicationStatusDto } from '../../dtos/application/update-application-status.dto';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'applications', status: 'ok', owner: 'Samman' };
  }

  @ApiBearerAuth()
  @Roles('volunteer')
  @ApiOperation({ summary: 'Submit an application' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateApplicationDto) {
    // Access tokens identify users with `sub` (rather than `id`).
    const volunteerId = user?.sub || (user as any)?.id;
    return this.service.create(volunteerId, dto);
  }

  @ApiBearerAuth()
  @Roles('volunteer')
  @Get('mine')
  @ApiOperation({ summary: 'List applications submitted by the current volunteer' })
  findMine(@CurrentUser('sub') volunteerId: string) {
    return this.service.findMine(volunteerId);
  }

  @ApiBearerAuth()
  @Roles('organisation', 'admin')
  @Get('opportunity/:opportunityId')
  @ApiOperation({ summary: 'List applicants for an organisation-owned opportunity' })
  findForOpportunity(
    @Param('opportunityId') opportunityId: string,
    @CurrentUser() user: JwtAccessPayload,
  ) {
    return this.service.findForOpportunity(opportunityId, user.sub, user.role);
  }

  @ApiBearerAuth()
  @Roles('organisation', 'admin')
  @ApiOperation({ summary: 'Update an application status for an owned opportunity' })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: UpdateApplicationStatusDto,
  ) {
    return this.service.updateStatus(id, body.status, user.sub, user.role, body.hoursCompleted);
  }
}

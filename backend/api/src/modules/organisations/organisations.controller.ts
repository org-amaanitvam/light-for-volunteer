import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateOrganisationDto } from '../../dtos/organisation/create-organisation.dto';
import { UpdateOrganisationDto } from '../../dtos/organisation/update-organisation.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrganisationsService } from './organisations.service';

@ApiTags('organisations')
@ApiBearerAuth()
@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly service: OrganisationsService) {}

  @Roles('organisation')
  @Post()
  @ApiOperation({ summary: 'Create the authenticated organisation profile' })
  create(
    @CurrentUser('sub') userId: string,
    @Body() body: CreateOrganisationDto,
  ) {
    return this.service.create(userId, body);
  }

  @Roles('organisation')
  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated organisation profile' })
  getMe(@CurrentUser('sub') userId: string) {
    return this.service.getMe(userId);
  }

  @Roles('organisation')
  @Patch('me')
  @ApiOperation({ summary: 'Update the authenticated organisation profile' })
  updateMe(
    @CurrentUser('sub') userId: string,
    @Body() body: UpdateOrganisationDto,
  ) {
    return this.service.updateMe(userId, body);
  }

  @Roles('organisation')
  @Post('me/resubmit')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resubmit a rejected organisation for verification' })
  resubmit(@CurrentUser('sub') userId: string) {
    return this.service.resubmit(userId);
  }

  @Public()
  @Get('ping')
  ping() {
    return { module: 'organisations', status: 'ok', owner: 'Dhruv' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an organisation by id' })
  getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.getById(id, userId, userRole);
  }
}

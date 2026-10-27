import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateOpportunityDto } from '../../dtos/opportunity/create-opportunity.dto';
import { UpdateOpportunityDto } from '../../dtos/opportunity/update-opportunity.dto';
import { QueryOpportunityDto } from '../../dtos/opportunity/query-opportunity.dto';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';
import { OpportunitiesService } from './opportunities.service';

@ApiTags('opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly service: OpportunitiesService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'opportunities', status: 'ok', owner: 'Aryan' };
  }

  @Public()
  @ApiOperation({ summary: 'List all available opportunity categories with live counts' })
  @Get('categories')
  getCategories() {
    return this.service.getCategories();
  }

  @ApiBearerAuth()
  @Roles('organisation')
  @ApiOperation({ summary: 'List all opportunities posted by the current organisation with metrics' })
  @Get('mine')
  findMine(@CurrentUser() user: JwtAccessPayload) {
    const userId = user?.sub || (user as any)?.id;
    return this.service.findMine(userId);
  }

  @ApiBearerAuth()
  @Roles('organisation')
  @ApiOperation({ summary: 'Alias for /opportunities/mine' })
  @Get('my')
  findMy(@CurrentUser() user: JwtAccessPayload) {
    const userId = user?.sub || (user as any)?.id;
    return this.service.findMine(userId);
  }

  @Public()
  @ApiOperation({ summary: 'Search and filter live opportunities' })
  @Get()
  findAll(
    @Query() query: QueryOpportunityDto,
    @CurrentUser() user?: JwtAccessPayload,
  ) {
    return this.service.findAll(query, user);
  }

  @Public()
  @ApiOperation({ summary: 'Get single opportunity by ID' })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: JwtAccessPayload,
  ) {
    return this.service.findOne(id, user);
  }

  @ApiBearerAuth()
  @Roles('organisation', 'admin')
  @ApiOperation({ summary: 'Create a new opportunity listing (defaults to DRAFT)' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateOpportunityDto,
  ) {
    const userId = user?.sub || (user as any)?.id;
    return this.service.create(userId, user.role, dto);
  }

  @ApiBearerAuth()
  @Roles('organisation', 'admin')
  @ApiOperation({ summary: 'Update an existing opportunity' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: UpdateOpportunityDto,
  ) {
    const userId = user?.sub || (user as any)?.id;
    return this.service.update(id, userId, user.role, dto);
  }

  @ApiBearerAuth()
  @Roles('organisation', 'admin')
  @ApiOperation({ summary: 'Delete an opportunity listing' })
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtAccessPayload,
  ) {
    const userId = user?.sub || (user as any)?.id;
    return this.service.remove(id, userId, user.role);
  }

  // ---------------------------------------------------------------- status workflow

  @ApiBearerAuth()
  @Roles('organisation', 'admin')
  @ApiOperation({ summary: 'Submit a draft opportunity for admin review (DRAFT -> PENDING_REVIEW)' })
  @Post(':id/submit')
  submitForReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtAccessPayload,
  ) {
    const userId = user?.sub || (user as any)?.id;
    return this.service.submitForReview(id, userId, user.role);
  }

  @ApiBearerAuth()
  @Roles('organisation', 'admin')
  @ApiOperation({ summary: 'Alias for submitting listing for review' })
  @Post(':id/submit-review')
  submitForReviewAlias(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtAccessPayload,
  ) {
    const userId = user?.sub || (user as any)?.id;
    return this.service.submitForReview(id, userId, user.role);
  }

  @ApiBearerAuth()
  @Roles('organisation', 'admin')
  @ApiOperation({ summary: 'Close an active opportunity (LIVE -> CLOSED)' })
  @Post(':id/close')
  close(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtAccessPayload,
  ) {
    const userId = user?.sub || (user as any)?.id;
    return this.service.close(id, userId, user.role);
  }

  @ApiBearerAuth()
  @Roles('organisation', 'admin')
  @ApiOperation({ summary: 'Reopen a closed opportunity (CLOSED -> PENDING_REVIEW/DRAFT)' })
  @Post(':id/reopen')
  reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtAccessPayload,
  ) {
    const userId = user?.sub || (user as any)?.id;
    return this.service.reopen(id, userId, user.role);
  }

  @ApiBearerAuth()
  @Roles('organisation', 'admin')
  @ApiOperation({ summary: 'Direct status update with transition validation' })
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtAccessPayload,
    @Body('status') status: OpportunityStatus,
  ) {
    const userId = user?.sub || (user as any)?.id;
    return this.service.updateStatus(id, userId, user.role, status);
  }
}

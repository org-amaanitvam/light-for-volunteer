import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from '../../dtos/application/create-application.dto';

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
  @ApiOperation({ summary: 'Submit an application' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser('id') volunteerId: string, @Body() dto: CreateApplicationDto) {
    return this.service.create(volunteerId, dto);
  }
}
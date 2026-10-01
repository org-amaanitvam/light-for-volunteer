import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ApplicationsService } from './applications.service';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'applications', status: 'ok', owner: 'Samman' };
  }
}

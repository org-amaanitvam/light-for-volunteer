import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { OrganisationsService } from './organisations.service';

@ApiTags('organisations')
@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly service: OrganisationsService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'organisations', status: 'ok', owner: 'Dhruv' };
  }
}

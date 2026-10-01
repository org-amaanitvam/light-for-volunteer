import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
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
}

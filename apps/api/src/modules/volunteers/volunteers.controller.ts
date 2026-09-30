import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { VolunteersService } from './volunteers.service';

@ApiTags('volunteers')
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly service: VolunteersService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'volunteers', status: 'ok', owner: 'Dhruv' };
  }
}

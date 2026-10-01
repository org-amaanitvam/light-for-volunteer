import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { GamificationService } from './gamification.service';

@ApiTags('gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly service: GamificationService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'gamification', status: 'ok', owner: 'Sourav' };
  }
}

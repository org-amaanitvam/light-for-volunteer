import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GamificationService } from './gamification.service';

@ApiTags('gamification')
@ApiBearerAuth()
@Controller('gamification')
export class GamificationController {
  constructor(private readonly service: GamificationService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'gamification', status: 'ok', owner: 'Sourav' };
  }

  @Get('me')
  getMyGamification(@CurrentUser('sub') userId: string) {
    return this.service.getMyGamification(userId);
  }
}

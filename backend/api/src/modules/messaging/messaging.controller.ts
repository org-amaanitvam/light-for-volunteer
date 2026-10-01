import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { MessagingService } from './messaging.service';

@ApiTags('messaging')
@Controller('messaging')
export class MessagingController {
  constructor(private readonly service: MessagingService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'messaging', status: 'ok', owner: 'Suraj' };
  }
}

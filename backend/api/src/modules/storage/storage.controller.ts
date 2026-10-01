import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { StorageService } from './storage.service';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly service: StorageService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'storage', status: 'ok', owner: 'Suryansh' };
  }
}

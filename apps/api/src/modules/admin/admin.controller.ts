import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'admin', status: 'ok', owner: 'Sourav' };
  }
}

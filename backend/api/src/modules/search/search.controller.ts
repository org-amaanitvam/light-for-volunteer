import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'search', status: 'ok', owner: 'Aryan / Suryansh' };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'reviews', status: 'ok', owner: 'Samman' };
  }
}

import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from '../../dtos/review/create-review.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Public()
  @Get('ping')
  ping() {
    return { module: 'reviews', status: 'ok', owner: 'Samman' };
  }

  @Post()
  @ApiOperation({ summary: 'Submit rating after completion' })
  create(@Req() req: any, @Body() dto: CreateReviewDto) {
    // Swap for your @CurrentUser() decorator if Auth has one
    return this.service.create(req.user.id, dto);
  }
}

import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
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

  @ApiBearerAuth()
  @Roles('volunteer', 'organisation')
  @Get('mine')
  listMine(@CurrentUser('sub') userId: string) {
    return this.service.findMine(userId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('volunteer', 'organisation')
  @ApiOperation({ summary: 'Submit rating after completion' })
  create(@CurrentUser() user: { sub: string; role: string }, @Body() dto: CreateReviewDto) {
    return this.service.create(user.sub, user.role, dto);
  }
}

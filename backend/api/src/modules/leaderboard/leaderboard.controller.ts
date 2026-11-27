import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';
import { LeaderboardService } from './leaderboard.service';

class LeaderboardQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 25;
}

/**
 * Leaderboard endpoints.
 *
 * Owner: Suraj. Coordinate with Sourav (gamification) on points/badge rules.
 */
@ApiTags('leaderboard')
@ApiBearerAuth()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly service: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Paginated volunteer leaderboard (sorted by points)' })
  getLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.service.getLeaderboard(query.page, query.limit);
  }

  @Get('my-rank')
  @ApiOperation({ summary: 'Current user\'s rank on the leaderboard' })
  async myRank(@CurrentUser() user: JwtAccessPayload) {
    return (await this.service.getRank(user.sub)) ?? { rank: null, entry: null };
  }

  @Get('rank/:userId')
  @ApiOperation({ summary: 'Get a specific user\'s rank' })
  async userRank(@Param('userId', ParseUUIDPipe) userId: string) {
    return (await this.service.getRank(userId)) ?? { rank: null, entry: null };
  }
}

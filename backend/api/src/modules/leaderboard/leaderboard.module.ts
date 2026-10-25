import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerProfile } from '../../database/entities/volunteer-profile.entity';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

/**
 * Leaderboard module — recalculates rankings on a schedule and exposes
 * paginated endpoints.
 *
 * Owner: Suraj. Coordinate with Sourav (gamification) on points/badge rules.
 */
@Module({
  imports: [TypeOrmModule.forFeature([VolunteerProfile])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule implements OnModuleInit {
  constructor(private readonly leaderboard: LeaderboardService) {}

  /** Initial leaderboard population at startup. */
  async onModuleInit(): Promise<void> {
    await this.leaderboard.recalculate();
  }
}

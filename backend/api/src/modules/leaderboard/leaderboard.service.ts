import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VolunteerProfile } from '../../database/entities/volunteer-profile.entity';

/**
 * Leaderboard data model returned to clients.
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  headline: string | null;
  points: number;
  badges: string[];
  ratingAvg: number;
}

/**
 * Leaderboard recalculation and query service.
 *
 * Maintains an in-memory cached leaderboard that is recalculated every 4 hours
 * via `@nestjs/schedule`. The cache is a sorted snapshot of
 * `VolunteerProfile.points` — no Redis dependency so it works even when Redis
 * is unavailable.
 *
 * Owner: Suraj. Coordinate with Sourav (gamification) on points/badge rules.
 */
@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  /** In-memory cached leaderboard (sorted by points desc). */
  private cache: LeaderboardEntry[] = [];
  private lastRecalculated: Date | null = null;

  constructor(
    @InjectRepository(VolunteerProfile)
    private readonly profileRepo: Repository<VolunteerProfile>,
  ) {}

  // ── Scheduled recalculation ────────────────────────────────────

  /**
   * Every 4 hours: query all volunteer profiles and re-sort by points.
   * Also runs once at startup (via `onModuleInit` from the module).
   */
  @Cron(CronExpression.EVERY_4_HOURS, { name: 'leaderboard-recalc' })
  async recalculate(): Promise<void> {
    this.logger.log('Recalculating leaderboard…');

    try {
      const profiles = await this.profileRepo.find({
        relations: { user: true },
        order: { points: 'DESC' },
      });

      this.cache = profiles.map((p, index) => ({
        rank: index + 1,
        userId: p.user?.id ?? p.id,
        headline: p.headline,
        points: p.points,
        badges: p.badges ?? [],
        ratingAvg: p.rating_avg,
      }));

      this.lastRecalculated = new Date();
      this.logger.log(
        `Leaderboard recalculated — ${this.cache.length} entries.`,
      );
    } catch (error) {
      this.logger.error('Leaderboard recalculation failed', error);
    }
  }

  // ── Queries ────────────────────────────────────────────────────

  /**
   * Paginated leaderboard.
   */
  getLeaderboard(
    page: number = 1,
    limit: number = 25,
  ): { entries: LeaderboardEntry[]; total: number; lastRecalculated: Date | null } {
    const start = (page - 1) * limit;
    const entries = this.cache.slice(start, start + limit);
    return {
      entries,
      total: this.cache.length,
      lastRecalculated: this.lastRecalculated,
    };
  }

  /**
   * Get a specific user's rank. Returns `null` if not on the leaderboard.
   */
  getRank(
    userId: string,
  ): { rank: number; entry: LeaderboardEntry } | null {
    const entry = this.cache.find((e) => e.userId === userId);
    if (!entry) return null;
    return { rank: entry.rank, entry };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { VolunteerProfile } from '../../database/entities/volunteer-profile.entity';
import { Badge } from '../../database/entities/badge.entity';
import { PointTransaction } from '../../database/entities/point-transaction.entity';

@Injectable()
export class GamificationService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(VolunteerProfile)
    private readonly profileRepository: Repository<VolunteerProfile>,
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(PointTransaction)
    private readonly transactionRepository: Repository<PointTransaction>,
  ) {}

  async getMyGamification(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Volunteer profile not found.');
    }

    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      take: 20,
    });

    return {
      points: profile.points,
      badges: profile.badges ?? [],
      recentTransactions: transactions.map((transaction) => ({
        eventType: transaction.event_type,
        points: transaction.points,
        createdAt: transaction.created_at,
      })),
    };
  }

  async awardPoints(
    userId: string,
    eventType: string,
    eventKey: string,
    points: number,
  ) {
    if (!Number.isInteger(points) || points <= 0) {
      throw new BadRequestException('Points must be a positive integer.');
    }

    if (!eventType.trim() || !eventKey.trim()) {
      throw new BadRequestException('Event type and event key are required.');
    }

    return this.dataSource.transaction(async (manager) => {
      const profileRepo = manager.getRepository(VolunteerProfile);
      const transactionRepo = manager.getRepository(PointTransaction);

      const profile = await profileRepo.findOne({
        where: { user: { id: userId } },
        relations: { user: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!profile) {
        throw new NotFoundException('Volunteer profile not found.');
      }

      // The unique event_key prevents duplicate awards.
      const insertResult = await manager
        .createQueryBuilder()
        .insert()
        .into(PointTransaction)
        .values({
          user: { id: userId },
          event_type: eventType,
          event_key: eventKey,
          points,
        })
        .orIgnore()
        .execute();

      if (insertResult.identifiers.length === 0) {
        return {
          awarded: false,
          message: 'This event has already been processed.',
          points: profile.points,
        };
      }

      profile.points += points;
      await profileRepo.save(profile);

      return {
        awarded: true,
        awardedPoints: points,
        totalPoints: profile.points,
      };
    });
  }

  async awardBadge(userId: string, badgeCode: string) {
    const badge = await this.badgeRepository.findOne({
      where: { code: badgeCode },
    });

    if (!badge) {
      throw new NotFoundException('Badge not found.');
    }

    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Volunteer profile not found.');
    }

    const currentBadges = profile.badges ?? [];

    if (currentBadges.includes(badge.code)) {
      return {
        awarded: false,
        message: 'Volunteer already has this badge.',
        badges: currentBadges,
      };
    }

    profile.badges = [...currentBadges, badge.code];
    await this.profileRepository.save(profile);

    return {
      awarded: true,
      badge: {
        code: badge.code,
        title: badge.title,
        iconUrl: badge.icon_url,
      },
      badges: profile.badges,
    };
  }
}
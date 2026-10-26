import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { VolunteerProfile } from '../../database/entities/volunteer-profile.entity';
import { Badge } from '../../database/entities/badge.entity';
import { PointTransaction } from '../../database/entities/point-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VolunteerProfile,
      Badge,
      PointTransaction,
    ]),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})

export class GamificationModule {}
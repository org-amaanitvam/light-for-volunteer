import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerProfile } from '../../database/entities/volunteer-profile.entity';
import { User } from '../users/entities/user.entity';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, VolunteerProfile])],
  controllers: [MentorsController],
  providers: [MentorsService],
})
export class MentorsModule {}

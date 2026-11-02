import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerProfile } from '../../database/entities/volunteer-profile.entity';
import { User } from '../users/entities/user.entity';
import { Application } from '../../database/entities/application.entity';
import { VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';

@Module({
  imports: [TypeOrmModule.forFeature([VolunteerProfile, User, Application])],
  controllers: [VolunteersController],
  providers: [VolunteersService],
})
export class VolunteersModule {}

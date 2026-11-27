import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VolunteerProfile } from '../../database/entities/volunteer-profile.entity';
import { User } from '../users/entities/user.entity';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(VolunteerProfile) private readonly profiles: Repository<VolunteerProfile>,
  ) {}

  async list() {
    const mentors = await this.users.find({ where: { role: 'mentor' }, order: { name: 'ASC' } });
    if (!mentors.length) return [];
    const profiles = await this.profiles.find({ where: mentors.map((mentor) => ({ user: { id: mentor.id } })), relations: { user: true } });
    const profileByUser = new Map(profiles.map((profile) => [profile.user.id, profile]));
    return mentors.map((mentor) => {
      const profile = profileByUser.get(mentor.id);
      return {
        id: mentor.id,
        name: mentor.name,
        city: mentor.city ?? null,
        headline: profile?.headline ?? null,
        about: profile?.about ?? null,
        skills: profile?.skills ?? [],
      };
    });
  }

  async getMine(userId: string) {
    const profile = await this.ensureProfile(userId);
    return { headline: profile.headline ?? '', about: profile.about ?? '', skills: profile.skills ?? [] };
  }

  async updateMine(userId: string, input: UpdateMentorProfileDto) {
    const profile = await this.ensureProfile(userId);
    if (input.headline !== undefined) profile.headline = input.headline.trim();
    if (input.about !== undefined) profile.about = input.about.trim();
    if (input.skills !== undefined) profile.skills = [...new Set(input.skills.map((skill) => skill.trim()).filter(Boolean))].slice(0, 30);
    const saved = await this.profiles.save(profile);
    return { headline: saved.headline ?? '', about: saved.about ?? '', skills: saved.skills ?? [] };
  }

  private async ensureProfile(userId: string): Promise<VolunteerProfile> {
    await this.profiles.createQueryBuilder().insert().into(VolunteerProfile).values({ user: { id: userId } as User }).orIgnore().execute();
    const profile = await this.profiles.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new NotFoundException('Mentor profile could not be loaded');
    return profile;
  }
}

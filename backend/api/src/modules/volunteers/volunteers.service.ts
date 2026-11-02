import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type QueryDeepPartialEntity } from 'typeorm';
import { VolunteerProfile } from '../../database/entities/volunteer-profile.entity';
import { UpdateVolunteerProfileDto } from '../../dtos/volunteer-profile/update-volunteer-profile.dto';
import { User } from '../users/entities/user.entity';
import { Application } from '../../database/entities/application.entity';
import { ApplicationStatus } from '../../database/enums/application-status.enum';

type VolunteerProfileResponse = {
  id: string;
  headline: string | null;
  about: string | null;
  skills: string[];
  portfolioLinks: string[];
  points: number;
  ratingAvg: number;
  badges: string[];
  resumeUrl: string | null;
  totalHours: number;
};

type VolunteerPublicProfileResponse = {
  userId: string;
  name: string;
  city: string | null;
  headline: string | null;
  about: string | null;
  skills: string[];
  portfolioLinks: string[];
  badges: string[];
  points: number;
  ratingAvg: number;
};

type VolunteerProfileChanges = {
  headline?: string | null;
  about?: string | null;
  resume_url?: string | null;
  skills?: string[] | null;
  portfolio_links?: string[] | null;
};

/**
 * Updates volunteer-owned columns independently from values owned by other
 * modules, so a stale profile read cannot overwrite concurrent gamification.
 */
@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(VolunteerProfile)
    private readonly profiles: Repository<VolunteerProfile>,
    @InjectRepository(Application)
    private readonly applications: Repository<Application>,
  ) {}

  async getMyProfile(userId: string): Promise<VolunteerProfileResponse> {
    const profile = await this.ensureProfile(userId);
    return this.toOwnerResponse(profile, await this.getTotalHours(userId));
  }

  async updateMyProfile(
    userId: string,
    input: UpdateVolunteerProfileDto,
  ): Promise<VolunteerProfileResponse> {
    const profile = await this.ensureProfile(userId);
    const changes: VolunteerProfileChanges = {};

    if (input.headline !== undefined) {
      changes.headline = typeof input.headline === 'string' ? input.headline.trim() : null;
    }
    if (input.about !== undefined) {
      changes.about = typeof input.about === 'string' ? input.about.trim() : null;
    }
    if (input.resumeUrl !== undefined) {
      this.assertStorageKeyOwner(userId, input.resumeUrl, 'resumes');
      changes.resume_url = typeof input.resumeUrl === 'string' ? input.resumeUrl : null;
    }

    const skills = input.skills as string[] | null | undefined;
    if (skills !== undefined) {
      changes.skills = skills === null ? null : this.normalizeList(skills, 'skills', 30, 50, true);
    }

    const portfolioLinks = input.portfolioLinks as string[] | null | undefined;
    if (portfolioLinks !== undefined) {
      for (const link of portfolioLinks ?? []) this.assertStorageKeyOwner(userId, link, 'portfolio');
      changes.portfolio_links =
        portfolioLinks === null
          ? null
          : this.normalizeList(portfolioLinks, 'portfolio links', 10);
    }

    if (Object.keys(changes).length > 0) {
      await this.profiles.update(
        profile.id,
        changes as QueryDeepPartialEntity<VolunteerProfile>,
      );
    }

    const updated = await this.profiles.findOne({ where: { id: profile.id } });
    if (!updated) throw new NotFoundException('Volunteer profile not found');
    return this.toOwnerResponse(updated, await this.getTotalHours(userId));
  }

  private assertStorageKeyOwner(userId: string, value: string | null | undefined, purpose: 'resumes' | 'portfolio'): void {
    if (value?.startsWith(`${purpose}/`) && !value.startsWith(`${purpose}/${userId}/`)) {
      throw new BadRequestException('Uploaded file must belong to this volunteer');
    }
  }

  async getPublicProfile(userId: string): Promise<VolunteerPublicProfileResponse> {
    const profile = await this.profiles
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!profile?.user) throw new NotFoundException('Volunteer profile not found');
    return {
      userId: profile.user.id,
      name: profile.user.name,
      city: profile.user.city ?? null,
      headline: profile.headline ?? null,
      about: profile.about ?? null,
      skills: profile.skills ?? [],
      portfolioLinks: profile.portfolio_links ?? [],
      badges: profile.badges ?? [],
      points: profile.points,
      ratingAvg: profile.rating_avg,
    };
  }

  private async ensureProfile(userId: string): Promise<VolunteerProfile> {
    await this.profiles
      .createQueryBuilder()
      .insert()
      .into(VolunteerProfile)
      .values({ user: { id: userId } as User })
      .orIgnore()
      .execute();

    const profile = await this.profiles.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new NotFoundException('Volunteer profile not found');
    return profile;
  }

  private normalizeList(
    values: string[],
    label: string,
    maxCount: number,
    maxLength?: number,
    caseInsensitive = false,
  ): string[] {
    const result: string[] = [];
    const seen = new Set<string>();

    for (const value of values) {
      const trimmed = value.trim();
      if (!trimmed) continue;
      if (trimmed.includes(',')) {
        throw new BadRequestException(`Each ${label} item must not contain a comma`);
      }
      if (maxLength !== undefined && trimmed.length > maxLength) {
        throw new BadRequestException(`Each ${label} item must be at most ${maxLength} characters`);
      }

      const key = caseInsensitive ? trimmed.toLowerCase() : trimmed;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(trimmed);
    }

    if (result.length > maxCount) {
      throw new BadRequestException(`A maximum of ${maxCount} ${label} are allowed`);
    }
    return result;
  }

  private async getTotalHours(userId: string): Promise<number> {
    const result = await this.applications.createQueryBuilder('application')
      .innerJoin('application.volunteer', 'volunteer')
      .select('COALESCE(SUM(application.completed_hours), 0)', 'total')
      .where('volunteer.id = :userId', { userId })
      .andWhere('application.status = :status', { status: ApplicationStatus.COMPLETED })
      .getRawOne<{ total: string | number }>();
    return Number(result?.total ?? 0);
  }

  private toOwnerResponse(profile: VolunteerProfile, totalHours: number): VolunteerProfileResponse {
    return {
      id: profile.id,
      headline: profile.headline ?? null,
      about: profile.about ?? null,
      skills: profile.skills ?? [],
      portfolioLinks: profile.portfolio_links ?? [],
      points: profile.points,
      ratingAvg: profile.rating_avg,
      badges: profile.badges ?? [],
      resumeUrl: profile.resume_url ?? null,
      totalHours,
    };
  }
}

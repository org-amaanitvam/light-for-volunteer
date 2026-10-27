import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { Organisation } from '../../database/entities/organisation.entity';
import { Application } from '../../database/entities/application.entity';
import { User } from '../users/entities/user.entity';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';
import { LocationType } from '../../database/enums/location-type.enum';
import { NotificationType } from '../../database/enums/notification-type.enum';
import { CreateOpportunityDto } from '../../dtos/opportunity/create-opportunity.dto';
import { UpdateOpportunityDto } from '../../dtos/opportunity/update-opportunity.dto';
import { QueryOpportunityDto } from '../../dtos/opportunity/query-opportunity.dto';
import { SearchService } from '../search/search.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';

export const DEFAULT_OPPORTUNITY_CATEGORIES = [
  'Education & Literacy',
  'Environment & Climate',
  'Healthcare & Mental Health',
  'Community Outreach',
  'Animal Welfare',
  'Women & Child Empowerment',
  'Skill Development & Livelihood',
  'Disaster Relief',
  'Arts & Culture',
  'Technology for Good',
] as const;

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);

  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,

    @InjectRepository(Organisation)
    private readonly organisationRepo: Repository<Organisation>,

    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly searchService: SearchService,

    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  // ---------------------------------------------------------------- categories

  /**
   * Returns available opportunity categories with counts of currently LIVE opportunities.
   */
  async getCategories(): Promise<{ name: string; count: number; active: boolean }[]> {
    const countsRaw = await this.opportunityRepo
      .createQueryBuilder('opp')
      .select('opp.category', 'category')
      .addSelect('COUNT(opp.id)', 'count')
      .where('opp.status = :status', { status: OpportunityStatus.LIVE })
      .groupBy('opp.category')
      .getRawMany<{ category: string; count: string }>();

    const countsMap = new Map<string, number>();
    for (const row of countsRaw) {
      if (row.category) {
        countsMap.set(row.category.toLowerCase(), Number(row.count) || 0);
      }
    }

    const categoriesList: { name: string; count: number; active: boolean }[] = [];
    const seenNames = new Set<string>();

    for (const defaultName of DEFAULT_OPPORTUNITY_CATEGORIES) {
      const count = countsMap.get(defaultName.toLowerCase()) || 0;
      categoriesList.push({
        name: defaultName,
        count,
        active: count > 0,
      });
      seenNames.add(defaultName.toLowerCase());
    }

    // Add any dynamic categories found in DB that aren't in default list
    for (const row of countsRaw) {
      if (row.category && !seenNames.has(row.category.toLowerCase())) {
        categoriesList.push({
          name: row.category,
          count: Number(row.count) || 0,
          active: true,
        });
      }
    }

    return categoriesList;
  }

  // ---------------------------------------------------------------- CRUD

  /**
   * Create a new opportunity.
   * Default status is DRAFT. Can optionally be submitted directly for review.
   */
  async create(
    userId: string,
    userRole: string,
    dto: CreateOpportunityDto,
  ): Promise<any> {
    const organisation = await this.resolveOrganisationForUser(userId, userRole, dto.orgId || dto.org_id);

    const skills = this.normalizeSkills(dto.skillsRequired || dto.skills_required);
    const locationType = dto.locationType || dto.location_type || LocationType.REMOTE;
    const pointsReward = dto.pointsReward ?? dto.points_reward ?? 0;
    const openings = dto.openings ?? 1;

    let initialStatus = dto.status || OpportunityStatus.DRAFT;
    if (initialStatus === OpportunityStatus.LIVE && userRole !== 'admin') {
      // Non-admins cannot publish directly to LIVE; it must be reviewed
      initialStatus = OpportunityStatus.PENDING_REVIEW;
    }

    const opportunity = this.opportunityRepo.create({
      organisation,
      title: dto.title.trim(),
      description: dto.description.trim(),
      type: dto.type,
      category: dto.category.trim(),
      skills_required: skills,
      location_type: locationType,
      city: dto.city?.trim() || null,
      duration: dto.duration?.trim() || 'Flexible',
      points_reward: pointsReward,
      openings,
      deadline: dto.deadline,
      status: initialStatus,
    });

    const saved = await this.opportunityRepo.save(opportunity);

    // Sync search index if created directly as LIVE (e.g. by admin)
    if (saved.status === OpportunityStatus.LIVE) {
      await this.searchService.syncOpportunity(saved);
    }

    if (saved.status === OpportunityStatus.PENDING_REVIEW) {
      await this.notifyOpportunityStatus(
        userId,
        saved.id,
        saved.title,
        'Submitted for Review',
        `Your opportunity "${saved.title}" has been submitted for admin review.`,
      );
    }

    this.logger.log(`Opportunity created: "${saved.title}" (${saved.id}) by org ${organisation.id} with status ${saved.status}`);

    return this.serializeOpportunity(saved);
  }

  /**
   * Search and filter opportunities with pagination.
   * Public visitors / volunteers only see LIVE listings.
   * Admins can query any status.
   * Organisations can query their own listings across statuses.
   */
  async findAll(
    query: QueryOpportunityDto,
    currentUser?: JwtAccessPayload,
  ): Promise<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const qb = this.opportunityRepo
      .createQueryBuilder('opp')
      .leftJoinAndSelect('opp.organisation', 'org')
      .leftJoin('org.user', 'orgUser')
      .addSelect(['orgUser.id', 'orgUser.name']);

    const searchParam = (query.search || query.q || '').trim();
    const typeParam = query.type;
    const categoryParam = query.category?.trim();
    const locationTypeParam = query.locationType || query.location_type;
    const cityParam = query.city?.trim();
    const skillsParam = query.skills?.trim();
    const orgIdParam = query.orgId || query.organisationId;
    const requestedStatus = query.status;

    // RBAC & Visibility rules:
    const isAdmin = currentUser?.role === 'admin';
    const isOrganisation = currentUser?.role === 'organisation';

    if (requestedStatus) {
      if (isAdmin) {
        qb.andWhere('opp.status = :status', { status: requestedStatus });
      } else if (isOrganisation && currentUser) {
        // Can filter by status for own organisation listings
        qb.andWhere('opp.status = :status AND orgUser.id = :userId', {
          status: requestedStatus,
          userId: currentUser.sub,
        });
      } else {
        // Public/volunteers can ONLY see LIVE
        qb.andWhere('opp.status = :status', { status: OpportunityStatus.LIVE });
      }
    } else {
      if (!isAdmin) {
        if (isOrganisation && currentUser && orgIdParam) {
          // If org is viewing their own listing filter, let status be whatever
        } else {
          // Default public view: only LIVE listings
          qb.andWhere('opp.status = :status', { status: OpportunityStatus.LIVE });
        }
      }
    }

    // Filter by Organization
    if (orgIdParam) {
      qb.andWhere('org.id = :orgId', { orgId: orgIdParam });
    }

    // Filter by Type
    if (typeParam) {
      qb.andWhere('opp.type = :type', { type: typeParam });
    }

    // Filter by Category
    if (categoryParam) {
      qb.andWhere('LOWER(opp.category) LIKE :category', {
        category: `%${categoryParam.toLowerCase()}%`,
      });
    }

    // Filter by Location Type
    if (locationTypeParam) {
      qb.andWhere('opp.location_type = :locType', { locType: locationTypeParam });
    }

    // Filter by City
    if (cityParam) {
      qb.andWhere('LOWER(opp.city) LIKE :city', {
        city: `%${cityParam.toLowerCase()}%`,
      });
    }

    // Filter by Skills
    if (skillsParam) {
      const skillTokens = skillsParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (skillTokens.length > 0) {
        const conditions = skillTokens.map((_, i) => `LOWER(opp.skills_required) LIKE :skill${i}`);
        const parameters = skillTokens.reduce((acc, token, i) => {
          acc[`skill${i}`] = `%${token}%`;
          return acc;
        }, {} as Record<string, string>);
        qb.andWhere(`(${conditions.join(' OR ')})`, parameters);
      }
    }

    // Keyword Search
    if (searchParam) {
      const searchPattern = `%${searchParam.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(opp.title) LIKE :search OR LOWER(opp.description) LIKE :search OR LOWER(opp.category) LIKE :search OR LOWER(opp.city) LIKE :search OR LOWER(opp.skills_required) LIKE :search OR LOWER(org.org_name) LIKE :search)',
        { search: searchPattern },
      );
    }

    // Sorting
    const sortBy = query.sortBy || 'newest';
    const sortOrder = (query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    if (sortBy === 'deadline_soon' || sortBy === 'deadline') {
      qb.orderBy('opp.deadline', sortOrder);
    } else if (sortBy === 'points') {
      qb.orderBy('opp.points_reward', sortOrder);
    } else {
      // Default: newest
      qb.orderBy('opp.created_at', sortOrder);
    }

    // Pagination
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: items.map((item) => this.serializeOpportunity(item)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Find single opportunity by ID.
   * Public can view LIVE listings.
   * DRAFT, PENDING_REVIEW, CLOSED, or REJECTED can only be viewed by the owner org or admin.
   */
  async findOne(id: string, currentUser?: JwtAccessPayload): Promise<any> {
    const opp = await this.opportunityRepo.findOne({
      where: { id },
      relations: {
        organisation: {
          user: true,
        },
      },
    });

    if (!opp) {
      throw new NotFoundException(`Opportunity with ID "${id}" not found`);
    }

    // Access control:
    if (opp.status !== OpportunityStatus.LIVE) {
      const isAdmin = currentUser?.role === 'admin';
      const isOwner = currentUser?.sub && opp.organisation?.user?.id === currentUser.sub;

      if (!isAdmin && !isOwner) {
        throw new NotFoundException(`Opportunity with ID "${id}" not found`);
      }
    }

    // Fetch applications count
    const applicationsCount = await this.applicationRepo.count({
      where: { opportunity: { id } },
    });

    return this.serializeOpportunity(opp, applicationsCount);
  }

  /**
   * Get all opportunities created by the current authenticated organisation,
   * enriched with application count metrics.
   */
  async findMine(userId: string): Promise<any[]> {
    const organisation = await this.organisationRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!organisation) {
      return [];
    }

    const opportunities = await this.opportunityRepo.find({
      where: { organisation: { id: organisation.id } },
      relations: { organisation: true },
      order: { created_at: 'DESC' },
    });

    const enriched = await Promise.all(
      opportunities.map(async (opp) => {
        const apps = await this.applicationRepo.find({
          where: { opportunity: { id: opp.id } },
          select: { id: true, status: true },
        });

        const statusCounts = apps.reduce(
          (acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        return {
          ...this.serializeOpportunity(opp, apps.length),
          applicant_stats: {
            total: apps.length,
            applied: statusCounts['applied'] || 0,
            shortlisted: statusCounts['shortlisted'] || 0,
            selected: statusCounts['selected'] || 0,
            completed: statusCounts['completed'] || 0,
            rejected: statusCounts['rejected'] || 0,
          },
        };
      }),
    );

    return enriched;
  }

  /**
   * Update an opportunity.
   * Can only be updated by its owner organisation or an admin.
   */
  async update(
    id: string,
    userId: string,
    userRole: string,
    dto: UpdateOpportunityDto,
  ): Promise<any> {
    const opp = await this.findOpportunityWithOrg(id);

    this.assertOwnership(opp, userId, userRole);

    if (dto.title !== undefined) opp.title = dto.title.trim();
    if (dto.description !== undefined) opp.description = dto.description.trim();
    if (dto.type !== undefined) opp.type = dto.type;
    if (dto.category !== undefined) opp.category = dto.category.trim();

    const skills = dto.skillsRequired || dto.skills_required;
    if (skills !== undefined) {
      opp.skills_required = this.normalizeSkills(skills);
    }

    const locType = dto.locationType || dto.location_type;
    if (locType !== undefined) opp.location_type = locType;

    if (dto.city !== undefined) opp.city = dto.city.trim() || null;
    if (dto.duration !== undefined) opp.duration = dto.duration.trim() || opp.duration;

    const points = dto.pointsReward ?? dto.points_reward;
    if (points !== undefined) opp.points_reward = points;

    if (dto.openings !== undefined) opp.openings = dto.openings;
    if (dto.deadline !== undefined) opp.deadline = dto.deadline;

    if (dto.status !== undefined) {
      // Validate permissible direct status updates
      if (dto.status === OpportunityStatus.LIVE && userRole !== 'admin') {
        throw new ForbiddenException('Only administrators can approve opportunities to LIVE');
      }
      opp.status = dto.status;
    }

    const updated = await this.opportunityRepo.save(opp);

    // Sync search index
    if (updated.status === OpportunityStatus.LIVE) {
      await this.searchService.syncOpportunity(updated);
    } else {
      await this.searchService.removeOpportunity(updated.id);
    }

    this.logger.log(`Opportunity updated: ${updated.id} by user ${userId}`);

    return this.serializeOpportunity(updated);
  }

  /**
   * Delete an opportunity.
   * Guarded: Owner organisation or admin.
   */
  async remove(id: string, userId: string, userRole: string): Promise<{ message: string; id: string }> {
    const opp = await this.findOpportunityWithOrg(id);

    this.assertOwnership(opp, userId, userRole);

    // Check if there are active applications
    const activeAppCount = await this.applicationRepo.count({
      where: {
        opportunity: { id },
      },
    });

    if (activeAppCount > 0 && userRole !== 'admin' && opp.status === OpportunityStatus.LIVE) {
      throw new ConflictException(
        'Cannot delete opportunity with active applications. Please close the opportunity instead.',
      );
    }

    await this.opportunityRepo.delete(id);
    await this.searchService.removeOpportunity(id);

    this.logger.log(`Opportunity deleted: ${id} by user ${userId}`);

    return { message: 'Opportunity deleted successfully', id };
  }

  // ---------------------------------------------------------------- workflow

  /**
   * Transition: DRAFT | REJECTED -> PENDING_REVIEW
   */
  async submitForReview(id: string, userId: string, userRole: string): Promise<any> {
    const opp = await this.findOpportunityWithOrg(id);

    this.assertOwnership(opp, userId, userRole);

    if (opp.status !== OpportunityStatus.DRAFT && opp.status !== OpportunityStatus.REJECTED) {
      throw new BadRequestException(
        `Only draft or rejected opportunities can be submitted for review. Current status: ${opp.status}`,
      );
    }

    // Validate completeness
    if (!opp.title || !opp.description || !opp.category || !opp.type || !opp.location_type) {
      throw new BadRequestException('Please complete all required fields before submitting for review');
    }

    if (opp.deadline && new Date(opp.deadline) < new Date()) {
      throw new BadRequestException('Deadline cannot be in the past');
    }

    opp.status = OpportunityStatus.PENDING_REVIEW;
    const updated = await this.opportunityRepo.save(opp);

    await this.notifyOpportunityStatus(
      userId,
      opp.id,
      opp.title,
      'Listing Submitted for Review',
      `Your opportunity "${opp.title}" has been submitted for admin moderation.`,
    );

    this.logger.log(`Opportunity ${id} submitted for review by user ${userId}`);

    return this.serializeOpportunity(updated);
  }

  /**
   * Transition: LIVE | PENDING_REVIEW -> CLOSED
   */
  async close(id: string, userId: string, userRole: string): Promise<any> {
    const opp = await this.findOpportunityWithOrg(id);

    this.assertOwnership(opp, userId, userRole);

    if (opp.status === OpportunityStatus.CLOSED) {
      return this.serializeOpportunity(opp);
    }

    opp.status = OpportunityStatus.CLOSED;
    const updated = await this.opportunityRepo.save(opp);

    // Remove from active search index
    await this.searchService.removeOpportunity(opp.id);

    await this.notifyOpportunityStatus(
      userId,
      opp.id,
      opp.title,
      'Listing Closed',
      `Your opportunity "${opp.title}" has been marked as closed.`,
    );

    this.logger.log(`Opportunity ${id} closed by user ${userId}`);

    return this.serializeOpportunity(updated);
  }

  /**
   * Transition: CLOSED -> PENDING_REVIEW (or DRAFT if deadline passed)
   */
  async reopen(id: string, userId: string, userRole: string): Promise<any> {
    const opp = await this.findOpportunityWithOrg(id);

    this.assertOwnership(opp, userId, userRole);

    if (opp.status !== OpportunityStatus.CLOSED) {
      throw new BadRequestException('Only closed opportunities can be reopened');
    }

    // If deadline has passed, reopen as DRAFT so date can be updated
    if (opp.deadline && new Date(opp.deadline) < new Date()) {
      opp.status = OpportunityStatus.DRAFT;
    } else {
      opp.status = userRole === 'admin' ? OpportunityStatus.LIVE : OpportunityStatus.PENDING_REVIEW;
    }

    const updated = await this.opportunityRepo.save(opp);

    if (updated.status === OpportunityStatus.LIVE) {
      await this.searchService.syncOpportunity(updated);
    }

    this.logger.log(`Opportunity ${id} reopened to ${updated.status} by user ${userId}`);

    return this.serializeOpportunity(updated);
  }

  /**
   * Helper for generic status changes (used by PATCH /opportunities/:id/status).
   */
  async updateStatus(
    id: string,
    userId: string,
    userRole: string,
    newStatus: OpportunityStatus,
  ): Promise<any> {
    if (newStatus === OpportunityStatus.PENDING_REVIEW) {
      return this.submitForReview(id, userId, userRole);
    }
    if (newStatus === OpportunityStatus.CLOSED) {
      return this.close(id, userId, userRole);
    }
    if (newStatus === OpportunityStatus.LIVE) {
      if (userRole !== 'admin') {
        throw new ForbiddenException('Only administrators can approve opportunities to LIVE');
      }
      const opp = await this.findOpportunityWithOrg(id);
      opp.status = OpportunityStatus.LIVE;
      const updated = await this.opportunityRepo.save(opp);
      await this.searchService.syncOpportunity(updated);
      return this.serializeOpportunity(updated);
    }
    if (newStatus === OpportunityStatus.REJECTED) {
      if (userRole !== 'admin') {
        throw new ForbiddenException('Only administrators can mark an opportunity REJECTED');
      }
      const opp = await this.findOpportunityWithOrg(id);
      opp.status = OpportunityStatus.REJECTED;
      const updated = await this.opportunityRepo.save(opp);
      await this.searchService.removeOpportunity(id);
      return this.serializeOpportunity(updated);
    }

    return this.update(id, userId, userRole, { status: newStatus });
  }

  // ---------------------------------------------------------------- helpers

  private async findOpportunityWithOrg(id: string): Promise<Opportunity> {
    const opp = await this.opportunityRepo.findOne({
      where: { id },
      relations: {
        organisation: {
          user: true,
        },
      },
    });

    if (!opp) {
      throw new NotFoundException(`Opportunity with ID "${id}" not found`);
    }

    return opp;
  }

  private assertOwnership(opp: Opportunity, userId: string, userRole: string): void {
    if (userRole === 'admin') return;

    const orgOwnerId = opp.organisation?.user?.id;
    if (!orgOwnerId || orgOwnerId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this opportunity');
    }
  }

  private async resolveOrganisationForUser(
    userId: string,
    userRole: string,
    requestedOrgId?: string,
  ): Promise<Organisation> {
    if (userRole === 'admin' && requestedOrgId) {
      const org = await this.organisationRepo.findOne({ where: { id: requestedOrgId } });
      if (org) return org;
    }

    let organisation = await this.organisationRepo.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!organisation) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User record not found');
      }

      // Auto-initialize organisation record for organisation user
      organisation = this.organisationRepo.create({
        user,
        org_name: user.name || 'Organisation',
      });
      organisation = await this.organisationRepo.save(organisation);
      this.logger.log(`Created organization profile for user ${userId}`);
    }

    return organisation;
  }

  private normalizeSkills(skills?: string[] | string): string[] {
    if (!skills) return [];
    if (Array.isArray(skills)) {
      return skills.map((s) => s.trim()).filter(Boolean);
    }
    return String(skills)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private serializeOpportunity(opp: Opportunity, applicationsCount?: number): any {
    const skills = Array.isArray(opp.skills_required)
      ? opp.skills_required
      : typeof opp.skills_required === 'string'
        ? (opp.skills_required as string).split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    return {
      id: opp.id,
      title: opp.title,
      description: opp.description,
      type: opp.type,
      category: opp.category,
      skills_required: skills,
      skills,
      location_type: opp.location_type,
      locationType: opp.location_type,
      city: opp.city,
      location: opp.city || (opp.location_type === LocationType.REMOTE ? 'Remote' : 'Various'),
      duration: opp.duration,
      points_reward: opp.points_reward ?? 0,
      pointsReward: opp.points_reward ?? 0,
      openings: opp.openings ?? 1,
      deadline: opp.deadline,
      status: opp.status,
      applications_count: applicationsCount,
      organisation: opp.organisation
        ? {
            id: opp.organisation.id,
            org_name: opp.organisation.org_name,
            website: opp.organisation.website,
            verification_status: opp.organisation.verification_status,
            rating_avg: opp.organisation.rating_avg ?? 0,
          }
        : undefined,
      org: opp.organisation?.org_name,
      created_at: opp.created_at,
      updated_at: opp.updated_at,
    };
  }

  private async notifyOpportunityStatus(
    userId: string,
    opportunityId: string,
    title: string,
    header: string,
    message: string,
  ): Promise<void> {
    if (!this.notificationsService) return;
    try {
      await this.notificationsService.create({
        userId,
        type: NotificationType.OPPORTUNITY_STATUS,
        title: header,
        body: message,
        referenceId: opportunityId,
        referenceType: 'opportunity',
      });
    } catch (e: any) {
      this.logger.warn(`Failed to dispatch opportunity status notification: ${e?.message}`);
    }
  }
}

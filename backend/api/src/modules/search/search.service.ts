import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from '../../database/entities/opportunity.entity';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';
import { QueryOpportunityDto } from '../../dtos/opportunity/query-opportunity.dto';

export interface IndexedOpportunityDoc {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  skills_required: string[];
  location_type: string;
  city?: string | null;
  duration?: string | null;
  points_reward: number;
  openings: number;
  deadline?: string | null;
  status: string;
  org_id?: string;
  org_name?: string;
  org_verified?: boolean;
  rating_avg?: number;
  created_at: string;
  updated_at: string;
}

export interface SearchFacets {
  categories: Record<string, number>;
  types: Record<string, number>;
  locationTypes: Record<string, number>;
}

export interface SearchResult<T = any> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    facets?: SearchFacets;
  };
}

/**
 * High-performance search and faceted discovery service.
 * Supports built-in indexed in-memory and database search with real-time sync,
 * plus pluggable Elasticsearch / Algolia integration when configured in .env.
 *
 * Owner: Aryan.
 */
@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly indexStore = new Map<string, IndexedOpportunityDoc>();

  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.reindexAll();
    } catch (err: any) {
      this.logger.warn(`Initial search index bootstrap skipped: ${err?.message || err}`);
    }
  }

  // ---------------------------------------------------------------- index sync

  /**
   * Synchronises an opportunity document with the search index.
   * If the status is LIVE, it adds/updates the document; otherwise, it removes it.
   */
  async syncOpportunity(opp: Opportunity | any): Promise<void> {
    if (!opp || !opp.id) return;

    if (opp.status === OpportunityStatus.LIVE) {
      const doc = this.buildDoc(opp);
      this.indexStore.set(opp.id, doc);
      await this.syncExternalIndex(doc, 'upsert');
      this.logger.debug(`Search index synced opportunity ${opp.id} (LIVE)`);
    } else {
      await this.removeOpportunity(opp.id);
    }
  }

  /**
   * Removes an opportunity from the search index (e.g. when closed, draft, or deleted).
   */
  async removeOpportunity(opportunityId: string): Promise<void> {
    if (!opportunityId) return;
    this.indexStore.delete(opportunityId);
    await this.syncExternalIndex({ id: opportunityId } as any, 'delete');
    this.logger.debug(`Search index removed opportunity ${opportunityId}`);
  }

  /**
   * Rebuilds the search index from all LIVE opportunities in the PostgreSQL database.
   */
  async reindexAll(): Promise<{ indexed: number; message: string }> {
    const liveOpportunities = await this.opportunityRepo.find({
      where: { status: OpportunityStatus.LIVE },
      relations: { organisation: true },
      order: { id: 'DESC' },
    });

    this.indexStore.clear();

    for (const opp of liveOpportunities) {
      const doc = this.buildDoc(opp);
      this.indexStore.set(opp.id, doc);
    }

    this.logger.log(`Search index rebuilt: ${this.indexStore.size} live opportunities indexed.`);

    return {
      indexed: this.indexStore.size,
      message: `Successfully indexed ${this.indexStore.size} opportunities`,
    };
  }

  // ---------------------------------------------------------------- query & facets

  /**
   * Fast faceted search query across live opportunities.
   */
  async searchOpportunities(query: QueryOpportunityDto): Promise<SearchResult<IndexedOpportunityDoc>> {
    const searchParam = (query.search || query.q || '').trim().toLowerCase();
    const categoryParam = query.category?.trim().toLowerCase();
    const typeParam = query.type;
    const locationTypeParam = query.locationType || query.location_type;
    const cityParam = query.city?.trim().toLowerCase();
    const skillsParam = query.skills?.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const orgIdParam = query.orgId || query.organisationId;

    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const sortBy = query.sortBy || 'newest';
    const sortOrder = (query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Collect all documents currently in the index
    let items = Array.from(this.indexStore.values());

    // Compute global facets before applying category/type filters for rich faceted sidebar UI
    const facets = this.calculateFacets(items);

    // Apply Filters
    if (categoryParam) {
      items = items.filter((item) =>
        item.category?.toLowerCase() === categoryParam ||
        item.category?.toLowerCase().includes(categoryParam),
      );
    }

    if (typeParam) {
      items = items.filter((item) => item.type === typeParam);
    }

    if (locationTypeParam) {
      items = items.filter(
        (item) => item.location_type?.toLowerCase() === locationTypeParam.toLowerCase(),
      );
    }

    if (cityParam) {
      items = items.filter((item) => item.city?.toLowerCase().includes(cityParam));
    }

    if (skillsParam && skillsParam.length > 0) {
      items = items.filter((item) => {
        const itemSkills = (item.skills_required || []).map((s) => s.toLowerCase());
        return skillsParam.some((s) => itemSkills.includes(s));
      });
    }

    if (orgIdParam) {
      items = items.filter((item) => item.org_id === orgIdParam);
    }

    // Apply Keyword Search & Relevance Scoring
    let scoredItems: { doc: IndexedOpportunityDoc; score: number }[];

    if (searchParam) {
      const searchTerms = searchParam.split(/\s+/).filter(Boolean);

      scoredItems = items
        .map((doc) => {
          let score = 0;
          const title = (doc.title || '').toLowerCase();
          const desc = (doc.description || '').toLowerCase();
          const cat = (doc.category || '').toLowerCase();
          const city = (doc.city || '').toLowerCase();
          const org = (doc.org_name || '').toLowerCase();
          const skills = (doc.skills_required || []).map((s) => s.toLowerCase()).join(' ');

          for (const term of searchTerms) {
            if (title === term) score += 15;
            else if (title.includes(term)) score += 8;

            if (skills.includes(term)) score += 5;
            if (cat.includes(term)) score += 4;
            if (org.includes(term)) score += 3;
            if (city.includes(term)) score += 2;
            if (desc.includes(term)) score += 1;
          }

          return { doc, score };
        })
        .filter((entry) => entry.score > 0);
    } else {
      scoredItems = items.map((doc) => ({ doc, score: 0 }));
    }

    // Apply Sorting
    scoredItems.sort((a, b) => {
      if (sortBy === 'relevance' && searchParam) {
        return sortOrder === 'ASC' ? a.score - b.score : b.score - a.score;
      }

      if (sortBy === 'deadline_soon' || sortBy === 'deadline') {
        const timeA = a.doc.deadline ? new Date(a.doc.deadline).getTime() : Infinity;
        const timeB = b.doc.deadline ? new Date(b.doc.deadline).getTime() : Infinity;
        return sortOrder === 'ASC' ? timeA - timeB : timeB - timeA;
      }

      if (sortBy === 'points') {
        const pA = a.doc.points_reward ?? 0;
        const pB = b.doc.points_reward ?? 0;
        return sortOrder === 'ASC' ? pA - pB : pB - pA;
      }

      // Default: newest
      const dateA = new Date(a.doc.created_at || 0).getTime();
      const dateB = new Date(b.doc.created_at || 0).getTime();
      return sortOrder === 'ASC' ? dateA - dateB : dateB - dateA;
    });

    // Pagination
    const total = scoredItems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const pagedDocs = scoredItems.slice(start, start + limit).map((entry) => entry.doc);

    return {
      data: pagedDocs,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        facets,
      },
    };
  }

  /**
   * Returns facet aggregates for categories, opportunity types, and location types.
   */
  async getFacets(): Promise<SearchFacets> {
    const items = Array.from(this.indexStore.values());
    return this.calculateFacets(items);
  }

  // ---------------------------------------------------------------- helpers

  private calculateFacets(items: IndexedOpportunityDoc[]): SearchFacets {
    const categories: Record<string, number> = {};
    const types: Record<string, number> = {};
    const locationTypes: Record<string, number> = {};

    for (const item of items) {
      if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + 1;
      }
      if (item.type) {
        types[item.type] = (types[item.type] || 0) + 1;
      }
      if (item.location_type) {
        locationTypes[item.location_type] = (locationTypes[item.location_type] || 0) + 1;
      }
    }

    return { categories, types, locationTypes };
  }

  private buildDoc(opp: Opportunity | any): IndexedOpportunityDoc {
    const skills = Array.isArray(opp.skills_required)
      ? opp.skills_required
      : typeof opp.skills_required === 'string'
        ? opp.skills_required.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

    return {
      id: opp.id,
      title: opp.title,
      description: opp.description,
      type: opp.type,
      category: opp.category || 'General',
      skills_required: skills,
      location_type: opp.location_type,
      city: opp.city || null,
      duration: opp.duration || null,
      points_reward: opp.points_reward ?? 0,
      openings: opp.openings ?? 1,
      deadline: opp.deadline ? new Date(opp.deadline).toISOString() : null,
      status: opp.status,
      org_id: opp.organisation?.id || opp.org_id,
      org_name: opp.organisation?.org_name,
      org_verified: opp.organisation?.verification_status === 'verified',
      rating_avg: opp.organisation?.rating_avg ?? 0,
      created_at: opp.created_at ? new Date(opp.created_at).toISOString() : new Date().toISOString(),
      updated_at: opp.updated_at ? new Date(opp.updated_at).toISOString() : new Date().toISOString(),
    };
  }

  /**
   * Resilient pluggable external sync (Elasticsearch / Algolia).
   * Runs non-blocking and handles connection/configuration gracefully.
   */
  private async syncExternalIndex(
    doc: IndexedOpportunityDoc,
    action: 'upsert' | 'delete',
  ): Promise<void> {
    const esNode = process.env.ELASTICSEARCH_NODE;
    const algoliaAppId = process.env.ALGOLIA_APP_ID;
    const algoliaApiKey = process.env.ALGOLIA_API_KEY;

    if (esNode) {
      try {
        const url = `${esNode}/opportunities/_doc/${doc.id}`;
        if (action === 'upsert') {
          await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc),
          });
        } else {
          await fetch(url, { method: 'DELETE' });
        }
      } catch (e: any) {
        this.logger.debug(`Elasticsearch sync skipped/offline: ${e?.message}`);
      }
    }

    if (algoliaAppId && algoliaApiKey) {
      try {
        const url = `https://${algoliaAppId}-dsn.algolia.net/1/indexes/opportunities/${doc.id}`;
        if (action === 'upsert') {
          await fetch(url, {
            method: 'PUT',
            headers: {
              'X-Algolia-Application-Id': algoliaAppId,
              'X-Algolia-API-Key': algoliaApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(doc),
          });
        } else {
          await fetch(url, {
            method: 'DELETE',
            headers: {
              'X-Algolia-Application-Id': algoliaAppId,
              'X-Algolia-API-Key': algoliaApiKey,
            },
          });
        }
      } catch (e: any) {
        this.logger.debug(`Algolia sync skipped/offline: ${e?.message}`);
      }
    }
  }
}

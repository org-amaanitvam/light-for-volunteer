import type { LocationType, OpportunityStatus, OpportunityType } from '../enums/opportunity.enum';

export interface OpportunityOrganisationSummary {
  id: string;
  org_name: string;
  website?: string | null;
  verification_status: string;
  rating_avg: number;
}

export interface OpportunityData {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  category: string;
  skills_required: string[];
  skills?: string[];
  location_type: LocationType;
  locationType?: LocationType;
  city?: string | null;
  location?: string | null;
  duration: string;
  points_reward: number;
  pointsReward?: number;
  openings: number;
  deadline: string | Date;
  status: OpportunityStatus;
  organisation?: OpportunityOrganisationSummary;
  org?: string;
  applications_count?: number;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CreateOpportunityPayload {
  title: string;
  description: string;
  type: OpportunityType;
  category: string;
  skillsRequired?: string[];
  skills_required?: string[];
  locationType?: LocationType;
  location_type?: LocationType;
  city?: string;
  duration: string;
  pointsReward?: number;
  points_reward?: number;
  openings?: number;
  deadline: string | Date;
  status?: OpportunityStatus;
}

export interface UpdateOpportunityPayload extends Partial<CreateOpportunityPayload> {}

export interface OpportunitySearchParams {
  search?: string;
  type?: OpportunityType;
  category?: string;
  locationType?: LocationType;
  city?: string;
  status?: OpportunityStatus;
  skills?: string;
  orgId?: string;
  sortBy?: 'newest' | 'relevance' | 'deadline_soon' | 'points';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface OpportunityCategoryItem {
  name: string;
  count: number;
}

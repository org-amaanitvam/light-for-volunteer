export const OPPORTUNITY_TYPES = [
  'Internship',
  'Volunteering',
  'Challenge',
  'Fellowship',
  'Event',
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const isOpportunityType = (value: unknown): value is OpportunityType =>
  typeof value === 'string' && (OPPORTUNITY_TYPES as readonly string[]).includes(value);

export const LOCATION_TYPES = ['On-site', 'Remote', 'Hybrid'] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export const isLocationType = (value: unknown): value is LocationType =>
  typeof value === 'string' && (LOCATION_TYPES as readonly string[]).includes(value);

export const OPPORTUNITY_STATUSES = [
  'draft',
  'pending_review',
  'live',
  'closed',
  'rejected',
] as const;

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const isOpportunityStatus = (value: unknown): value is OpportunityStatus =>
  typeof value === 'string' && (OPPORTUNITY_STATUSES as readonly string[]).includes(value);

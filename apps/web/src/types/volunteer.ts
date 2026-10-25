export type ApplicationStatusType =
  | "applied"
  | "shortlisted"
  | "selected"
  | "completed"
  | "rejected"
  | "withdrawn"
  | "pending"
  | "accepted";

export interface Application {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organisation: string;
  status: ApplicationStatusType;
  appliedAt: string;
  updatedAt: string;
  location?: string;
  category?: string;
  nextStep?: string;
  pitchText?: string;
}

export interface VolunteerProfileData {
  headline: string | null;
  about: string | null;
  skills: string[];
  portfolioLinks: string[];
  points: number;
  ratingAvg: number;
  badges: string[];
  resumeUrl: string | null;
  totalHours: number;
}

export interface BadgeItem {
  id: string;
  code: string;
  title: string;
  criteria: string;
  iconUrl: string;
  earned: boolean;
  earnedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  volunteerId: string;
  name: string;
  city: string | null;
  points: number;
  badgeCount: number;
}

export interface Certificate {
  id: string;
  opportunityTitle: string;
  organisation: string;
  completedAt: string;
  hoursVolunteered: number;
  verified: boolean;
}

export interface ReviewItem {
  id: string;
  opportunityTitle: string;
  organisation: string;
  rating: number;
  comment: string;
  createdAt: string;
}

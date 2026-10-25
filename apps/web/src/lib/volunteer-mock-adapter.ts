import type {
  Application,
  BadgeItem,
  Certificate,
  LeaderboardEntry,
  ReviewItem,
  VolunteerProfileData,
} from "@/types/volunteer";
import type { UserProfile } from "@/lib/api";

export const MOCK_VOLUNTEER_PROFILE: VolunteerProfileData = {
  headline: "Passionate Volunteer | Community & Education Advocate",
  about: "Dedicated to driving meaningful change through grassroots community work, youth mentorship, and educational initiatives. Experienced in team coordination and field volunteering.",
  skills: ["Tutoring", "Event Organization", "First Aid", "Mentorship", "Public Speaking"],
  portfolioLinks: [
    "https://github.com/volunteer-impact",
    "https://linkedin.com/in/volunteer-portfolio",
  ],
  points: 420,
  ratingAvg: 4.8,
  badges: ["Community Champion", "First Responder", "Reliable Mentor"],
  resumeUrl: "https://example.com/resumes/volunteer-cv.pdf",
  totalHours: 36,
};

export const MOCK_DASHBOARD_APPLICATIONS: Application[] = [
  {
    id: "app-101",
    opportunityId: "opp-201",
    opportunityTitle: "Weekend Youth Reading Circle",
    organisation: "Bright Futures Foundation",
    status: "selected",
    appliedAt: "2026-10-15T10:00:00Z",
    updatedAt: "2026-10-17T14:30:00Z",
    location: "Bangalore, KA (On-site)",
    category: "Education",
    nextStep: "Attend mandatory volunteer orientation on Saturday at 10:00 AM.",
    pitchText: "I have 2 years of teaching experience with underprivileged kids and can conduct story sessions.",
  },
  {
    id: "app-102",
    opportunityId: "opp-202",
    opportunityTitle: "Urban Tree Plantation & Care",
    organisation: "EcoGuard India",
    status: "applied",
    appliedAt: "2026-10-21T08:15:00Z",
    updatedAt: "2026-10-21T08:15:00Z",
    location: "Cubbon Park, Bangalore",
    category: "Environment",
    nextStep: "Application received. Organization review in progress.",
    pitchText: "Passionate about urban forestry and native tree conservation.",
  },
  {
    id: "app-103",
    opportunityId: "opp-203",
    opportunityTitle: "Elderly Care Digital Literacy Workshop",
    organisation: "Silver Age Care",
    status: "completed",
    appliedAt: "2026-10-08T11:00:00Z",
    updatedAt: "2026-10-10T16:00:00Z",
    location: "Indiranagar Community Hall",
    category: "Community Welfare",
    nextStep: "Drive concluded! Download verified participation certificate.",
    pitchText: "Experienced in teaching smartphone and internet safety basics to seniors.",
  },
  {
    id: "app-104",
    opportunityId: "opp-204",
    opportunityTitle: "Rural Health Awareness Drive Assistant",
    organisation: "Swasthya Kalyan Trust",
    status: "shortlisted",
    appliedAt: "2026-10-12T09:30:00Z",
    updatedAt: "2026-10-14T11:00:00Z",
    location: "Kolar Rural District",
    category: "Healthcare",
    nextStep: "Selected for interview. The coordinator will reach out via WhatsApp/email.",
    pitchText: "Certified first-aid responder with experience managing patient registration queues.",
  },
  {
    id: "app-105",
    opportunityId: "opp-205",
    opportunityTitle: "Disaster Relief Supply Logistics",
    organisation: "Apex Relief Taskforce",
    status: "rejected",
    appliedAt: "2026-09-20T14:00:00Z",
    updatedAt: "2026-09-22T10:00:00Z",
    location: "North Karnataka Command",
    category: "Disaster Relief",
    nextStep: "Cohort capacity filled for this round. Keep an eye out for upcoming deployments.",
    pitchText: "Available for heavy material handling and ration packaging.",
  },
];

export const MOCK_BADGES: BadgeItem[] = [
  {
    id: "badge-1",
    code: "COMMUNITY_CHAMPION",
    title: "Community Champion",
    criteria: "Complete 25+ verified community service hours across social welfare drives.",
    iconUrl: "🏆",
    earned: true,
    earnedAt: "2026-09-15T10:00:00Z",
    category: "Milestone",
  },
  {
    id: "badge-2",
    code: "FIRST_RESPONDER",
    title: "First Responder",
    criteria: "Apply within 24 hours of an urgent emergency relief or medical drive posting.",
    iconUrl: "⚡",
    earned: true,
    earnedAt: "2026-09-28T14:00:00Z",
    category: "Dedication",
  },
  {
    id: "badge-3",
    code: "RELIABLE_MENTOR",
    title: "Reliable Mentor",
    criteria: "Lead or tutor in 3 or more youth education and skill development programs.",
    iconUrl: "🌱",
    earned: true,
    earnedAt: "2026-10-12T16:30:00Z",
    category: "Impact",
  },
  {
    id: "badge-4",
    code: "GREEN_WARRIOR",
    title: "Green Warrior",
    criteria: "Participate in 2 or more environmental clean-up or urban forestry drives.",
    iconUrl: "🌿",
    earned: false,
    category: "Environment",
  },
  {
    id: "badge-5",
    code: "HEALING_HANDS",
    title: "Healing Hands",
    criteria: "Volunteer at least 10 hours supporting healthcare clinics or blood donation drives.",
    iconUrl: "🩺",
    earned: false,
    category: "Health",
  },
  {
    id: "badge-6",
    code: "IMPACT_LEGEND",
    title: "Impact Legend",
    criteria: "Accumulate 700+ impact points and complete 50 verified volunteer hours.",
    iconUrl: "🌟",
    earned: false,
    category: "Mastery",
  },
];

export const MOCK_ACTIVITY_FEED = [
  { action: "Completed drive: Elderly Care Digital Literacy Workshop", points: 80, date: "2026-10-10" },
  { action: "Earned badge: Reliable Mentor", points: 50, date: "2026-10-12" },
  { action: "Selected for Weekend Youth Reading Circle", points: 25, date: "2026-10-17" },
  { action: "Applied to Urban Tree Plantation & Care", points: 15, date: "2026-10-21" },
  { action: "Earned badge: First Responder", points: 50, date: "2026-09-28" },
];

export const MOCK_LEADERBOARD_MONTHLY: LeaderboardEntry[] = [
  { rank: 1, volunteerId: "v-1", name: "Ananya Deshmukh", city: "Mumbai, MH", points: 680, badgeCount: 5 },
  { rank: 2, volunteerId: "v-2", name: "Rohan Varma", city: "Bengaluru, KA", points: 590, badgeCount: 4 },
  { rank: 3, volunteerId: "v-3", name: "Kavita Subramanian", city: "Chennai, TN", points: 530, badgeCount: 4 },
  { rank: 4, volunteerId: "v-me", name: "Navya Anubhuti", city: "Bengaluru, KA", points: 420, badgeCount: 3 },
  { rank: 5, volunteerId: "v-5", name: "Tanmay Bhatt", city: "Pune, MH", points: 370, badgeCount: 3 },
  { rank: 6, volunteerId: "v-6", name: "Zoya Akhtar", city: "Hyderabad, TS", points: 310, badgeCount: 2 },
  { rank: 7, volunteerId: "v-7", name: "Amitabh Sen", city: "Kolkata, WB", points: 260, badgeCount: 2 },
  { rank: 8, volunteerId: "v-8", name: "Divya Nair", city: "Kochi, KL", points: 220, badgeCount: 1 },
];

export const MOCK_LEADERBOARD_ALL_TIME: LeaderboardEntry[] = [
  { rank: 1, volunteerId: "v-2", name: "Rohan Varma", city: "Bengaluru, KA", points: 2450, badgeCount: 9 },
  { rank: 2, volunteerId: "v-1", name: "Ananya Deshmukh", city: "Mumbai, MH", points: 2120, badgeCount: 8 },
  { rank: 3, volunteerId: "v-3", name: "Kavita Subramanian", city: "Chennai, TN", points: 1890, badgeCount: 7 },
  { rank: 4, volunteerId: "v-5", name: "Tanmay Bhatt", city: "Pune, MH", points: 1420, badgeCount: 6 },
  { rank: 5, volunteerId: "v-me", name: "Navya Anubhuti", city: "Bengaluru, KA", points: 1280, badgeCount: 4 },
  { rank: 6, volunteerId: "v-6", name: "Zoya Akhtar", city: "Hyderabad, TS", points: 980, badgeCount: 3 },
  { rank: 7, volunteerId: "v-7", name: "Amitabh Sen", city: "Kolkata, WB", points: 840, badgeCount: 3 },
  { rank: 8, volunteerId: "v-8", name: "Divya Nair", city: "Kochi, KL", points: 650, badgeCount: 2 },
];

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: "cert-101",
    opportunityTitle: "Elderly Care Digital Literacy Workshop",
    organisation: "Silver Age Care",
    completedAt: "2026-10-10T16:00:00Z",
    hoursVolunteered: 8,
    verified: true,
    certificateNumber: "LFV-2026-EDL-101",
    fileUrl: null,
  },
  {
    id: "cert-102",
    opportunityTitle: "Monsoon Community Flood Relief Logistics",
    organisation: "Amaanitvam Foundation",
    completedAt: "2026-08-25T18:00:00Z",
    hoursVolunteered: 16,
    verified: true,
    certificateNumber: "LFV-2026-MFR-044",
    fileUrl: "https://example.com/certificates/lfv-2026-mfr-044.pdf",
  },
  {
    id: "cert-103",
    opportunityTitle: "Weekend Youth Reading Circle",
    organisation: "Bright Futures Foundation",
    completedAt: "2026-10-17T14:30:00Z",
    hoursVolunteered: 12,
    verified: false,
    certificateNumber: "LFV-2026-YRC-PENDING",
    fileUrl: null,
  },
];

export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "rev-201",
    opportunityTitle: "Elderly Care Digital Literacy Workshop",
    organisation: "Silver Age Care",
    rating: 5,
    comment: "An exceptionally meaningful initiative. The senior participants were eager to learn digital tools, and the venue and teaching aids provided by the NGO coordinators were stellar.",
    createdAt: "2026-10-11T10:30:00Z",
    reviewerName: "Navya Anubhuti",
    applicationId: "app-103",
  },
  {
    id: "rev-202",
    opportunityTitle: "Monsoon Community Flood Relief Logistics",
    organisation: "Amaanitvam Foundation",
    rating: 5,
    comment: "Rigorous emergency logistics coordination. The safety protocols, hydration stations, and clear shift handovers made the strenuous work manageable and effective.",
    createdAt: "2026-08-27T14:00:00Z",
    reviewerName: "Navya Anubhuti",
  },
];

export interface ProfileCompletionItem {
  key: string;
  label: string;
  completed: boolean;
  weight: number;
}

export function calculateProfileCompletion(
  user: UserProfile | null,
  profile: VolunteerProfileData
): {
  percentage: number;
  items: ProfileCompletionItem[];
  missingCount: number;
} {
  const items: ProfileCompletionItem[] = [
    { key: "name", label: "Full Name", completed: Boolean(user?.name), weight: 10 },
    { key: "email", label: "Email Address", completed: Boolean(user?.email), weight: 10 },
    { key: "phone", label: "Phone Number", completed: Boolean(user?.phone), weight: 10 },
    { key: "city", label: "City Location", completed: Boolean(user?.city), weight: 10 },
    { key: "headline", label: "Professional Headline", completed: Boolean(profile.headline?.trim()), weight: 15 },
    { key: "about", label: "Bio / About Section", completed: Boolean(profile.about?.trim()), weight: 15 },
    { key: "skills", label: "Skills Listed (min 1)", completed: profile.skills.length > 0, weight: 15 },
    { key: "portfolioLinks", label: "Portfolio Links", completed: profile.portfolioLinks.length > 0, weight: 10 },
    { key: "resumeUrl", label: "Resume Uploaded", completed: Boolean(profile.resumeUrl), weight: 5 },
  ];

  const earned = items.reduce((acc, curr) => (curr.completed ? acc + curr.weight : acc), 0);
  const total = items.reduce((acc, curr) => acc + curr.weight, 0);
  const percentage = Math.round((earned / total) * 100);
  const missingCount = items.filter((item) => !item.completed).length;

  return { percentage, items, missingCount };
}

export function getMockVolunteerProfile(): Promise<VolunteerProfileData> {
  return Promise.resolve({ ...MOCK_VOLUNTEER_PROFILE });
}

export function getMockDashboardStats(profile: VolunteerProfileData) {
  return [
    { label: "Total Applications", value: MOCK_DASHBOARD_APPLICATIONS.length.toString(), icon: "📋" },
    { label: "Hours Volunteered", value: `${profile.totalHours} hrs`, icon: "⏱️" },
    { label: "Impact Points", value: profile.points.toString(), icon: "🌟" },
    { label: "Average Rating", value: `${profile.ratingAvg.toFixed(1)} ★`, icon: "⭐" },
  ];
}

export function getMockApplications(): Promise<Application[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_DASHBOARD_APPLICATIONS]);
    }, 150);
  });
}

export function getMockBadges(): Promise<BadgeItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_BADGES]);
    }, 150);
  });
}

export function getMockLeaderboard(period: "monthly" | "alltime"): Promise<LeaderboardEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(period === "monthly" ? [...MOCK_LEADERBOARD_MONTHLY] : [...MOCK_LEADERBOARD_ALL_TIME]);
    }, 150);
  });
}

export function getMockCertificates(): Promise<Certificate[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_CERTIFICATES]);
    }, 150);
  });
}

export function getMockReviews(): Promise<ReviewItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_REVIEWS]);
    }, 150);
  });
}

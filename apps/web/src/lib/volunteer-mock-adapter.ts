import type { Application, VolunteerProfileData } from "@/types/volunteer";
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
    status: "accepted",
    appliedAt: "2026-10-15T10:00:00Z",
    updatedAt: "2026-10-17T14:30:00Z",
  },
  {
    id: "app-102",
    opportunityId: "opp-202",
    opportunityTitle: "Urban Tree Plantation & Care",
    organisation: "EcoGuard India",
    status: "pending",
    appliedAt: "2026-10-21T08:15:00Z",
    updatedAt: "2026-10-21T08:15:00Z",
  },
  {
    id: "app-103",
    opportunityId: "opp-203",
    opportunityTitle: "Elderly Care Digital Literacy Workshop",
    organisation: "Silver Age Care",
    status: "accepted",
    appliedAt: "2026-10-08T11:00:00Z",
    updatedAt: "2026-10-10T16:00:00Z",
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

import type { UserProfile } from "@/lib/api";
import type { VolunteerProfileData } from "@/types/volunteer";

export interface ProfileCompletionItem {
  key: string;
  label: string;
  completed: boolean;
  weight: number;
}

export function calculateProfileCompletion(
  user: UserProfile | null,
  profile: VolunteerProfileData,
): { percentage: number; items: ProfileCompletionItem[]; missingCount: number } {
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
  const earned = items.reduce((sum, item) => sum + (item.completed ? item.weight : 0), 0);
  return {
    percentage: Math.round(earned / items.reduce((sum, item) => sum + item.weight, 0) * 100),
    items,
    missingCount: items.filter((item) => !item.completed).length,
  };
}

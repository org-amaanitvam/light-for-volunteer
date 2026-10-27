"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Application, ApplicationStatusType, VolunteerProfileData } from "@/types/volunteer";
import {
  MOCK_DASHBOARD_APPLICATIONS,
  MOCK_VOLUNTEER_PROFILE,
  calculateProfileCompletion,
  getMockDashboardStats,
} from "@/lib/volunteer-mock-adapter";

const STATUS_BADGE: Record<
  ApplicationStatusType,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" }
> = {
  applied: { label: "Under Review", variant: "secondary" },
  pending: { label: "Pending", variant: "secondary" },
  shortlisted: { label: "Shortlisted", variant: "default" },
  selected: { label: "Selected", variant: "success" },
  accepted: { label: "Accepted", variant: "success" },
  completed: { label: "Completed", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  withdrawn: { label: "Withdrawn", variant: "outline" },
};

export default function VolunteerDashboardPage() {
  const { user } = useAuth();
  const [profile] = useState<VolunteerProfileData>(MOCK_VOLUNTEER_PROFILE);
  const [applications] = useState<Application[]>(MOCK_DASHBOARD_APPLICATIONS);
  const [isLoading] = useState(false);

  const completion = calculateProfileCompletion(user, profile);
  const stats = getMockDashboardStats(profile);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 p-6 sm:p-8 text-white shadow-xl shadow-sky-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              Volunteer Dashboard
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name ?? "Volunteer"}! 👋
            </h1>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-sky-100">
              Track your impact, active applications, and verified community hours.
            </p>
          </div>
          <div className="flex shrink-0 gap-2.5">
            <Link href="/volunteer/profile">
              <Button
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-sky-700 backdrop-blur-sm"
              >
                Edit Profile
              </Button>
            </Link>
            <Link href="/#opportunities">
              <Button className="bg-white text-sky-700 hover:bg-sky-50 shadow-md">
                Find Drives
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="border-sky-100/80 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Profile Completion</CardTitle>
              <CardDescription>
                Complete your details to boost visibility for high-impact social initiatives.
              </CardDescription>
            </div>
            <span className="text-xl font-bold text-sky-600">{completion.percentage}%</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-sky-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${completion.percentage}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap gap-2">
              {completion.items.map((item) => (
                <span
                  key={item.key}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium ${
                    item.completed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {item.completed ? "✓" : "○"} {item.label}
                </span>
              ))}
            </div>
            {completion.missingCount > 0 && (
              <Link
                href="/volunteer/profile"
                className="font-semibold text-sky-600 hover:text-sky-800 underline underline-offset-2"
              >
                Complete remaining fields →
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-sky-100/80 transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-2xl font-extrabold text-slate-900">{stat.value}</span>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-sky-100/80 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Recent Applications</CardTitle>
              <CardDescription>Latest community drives you have applied for.</CardDescription>
            </div>
            <Link href="/volunteer/applications">
              <Button variant="ghost" size="sm" className="text-sky-600">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sky-200 p-8 text-center">
                <p className="text-sm text-slate-500">No applications submitted yet.</p>
                <Link href="/#opportunities" className="mt-3 inline-block">
                  <Button size="sm">Explore Drives</Button>
                </Link>
              </div>
            ) : (
              applications.map((app) => {
                const badge = STATUS_BADGE[app.status];
                return (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/20 p-4 transition hover:bg-sky-50/50"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{app.opportunityTitle}</p>
                      <p className="text-xs text-slate-500">
                        {app.organisation} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-sky-100/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Earned Badges</CardTitle>
              <CardDescription>Recognition for consistent impact.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badgeName) => (
                  <Badge key={badgeName} variant="secondary" className="px-3 py-1 font-medium">
                    🏅 {badgeName}
                  </Badge>
                ))}
              </div>
              <div className="pt-2">
                <Link href="/volunteer/badges">
                  <Button variant="outline" size="sm" className="w-full">
                    View Badge Shelf
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100/80 bg-gradient-to-br from-white to-sky-50/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/volunteer/profile" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-semibold">
                  👤 My Profile &amp; Portfolio
                </Button>
              </Link>
              <Link href="/volunteer/applications" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-semibold">
                  📋 Applications Tracker
                </Button>
              </Link>
              <Link href="/volunteer/leaderboard" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-semibold">
                  🏆 Community Leaderboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Architecture Adapter Notice:</p>
        <p className="mt-0.5">
          Volunteer statistics and recent applications currently hydrate from the dedicated mock data adapter until the backend volunteer profile and application query endpoints are provisioned.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
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
import { buttonVariants } from "@/components/ui/button";
import type { Application, ApplicationStatusType, VolunteerProfileData } from "@/types/volunteer";
import { calculateProfileCompletion } from "@/lib/volunteer-utils";
import { api } from "@/lib/api";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  Compass,
  User,
  Trophy,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Building2,
} from "lucide-react";

const STATUS_CONFIG: Record<
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
  const [profile, setProfile] = useState<VolunteerProfileData>({
    headline: null,
    about: null,
    skills: [],
    portfolioLinks: [],
    points: 0,
    ratingAvg: 0,
    badges: [],
    resumeUrl: null,
    totalHours: 0,
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api.getVolunteerProfile(), api.getMyApplications()])
      .then(([p, items]) => {
        if (!active) return;
        setProfile({
          headline: p.headline,
          about: p.about,
          skills: p.skills || [],
          portfolioLinks: p.portfolioLinks || [],
          points: p.points,
          ratingAvg: p.ratingAvg,
          badges: p.badges || [],
          resumeUrl: p.resumeUrl,
          totalHours: p.totalHours,
        });
        setApplications(
          items.map((item) => ({
            id: item.id,
            opportunityId: item.opportunity_id,
            opportunityTitle: item.opportunity_title,
            organisation: item.organisation,
            status: item.status,
            appliedAt: item.applied_at,
            updatedAt: item.applied_at,
            pitchText: item.pitch_text,
          }))
        );
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Could not load your dashboard.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const completion = calculateProfileCompletion(user, profile);

  const stats = [
    {
      label: "Applications",
      value: applications.length,
      Icon: ClipboardList,
      description: "Drives applied",
    },
    {
      label: "Selected & Confirmed",
      value: applications.filter((item) => item.status === "selected" || item.status === "accepted").length,
      Icon: CheckCircle2,
      description: "Active placements",
    },
    {
      label: "Impact Points",
      value: profile.points,
      Icon: Award,
      description: "Civic credit balance",
    },
    {
      label: "Verified Hours",
      value: profile.totalHours,
      Icon: Clock,
      description: "Service logged",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading dashboard">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0369a1] border-t-transparent" />
          <p className="text-xs font-semibold tracking-wide text-[#335577] uppercase">
            Loading civic ledger…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {loadError && (
        <div role="alert" className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Architectural Civic Ledger Header */}
      <section
        aria-label="Volunteer Ledger Banner"
        className="relative overflow-hidden rounded-2xl border border-[#bae6fd] bg-gradient-to-r from-[#075985] to-[#0c4a6e] p-6 sm:p-8 text-white shadow-md"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md text-[#e0f2fe]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Volunteer Account
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {user?.name ? `${user.name} — Workspace` : "Volunteer Impact Ledger"}
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-[#e0f2fe] leading-relaxed">
              Track verified service hours, monitor active drive applications, and manage accredited certificates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/volunteer/profile"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "border-white/40 bg-white/10 text-white hover:bg-white hover:text-[#075985] font-semibold text-xs transition",
              })}
            >
              <User className="h-3.5 w-3.5 mr-1.5" />
              Edit Profile
            </Link>
            <Link
              href="/opportunities"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "border-transparent bg-white text-[#075985] hover:bg-white/90 hover:text-[#0369a1] font-bold text-xs shadow-sm transition",
              })}
            >
              <Compass className="h-3.5 w-3.5 mr-1.5 text-[#0369a1]" />
              Explore Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* Profile Completion Card */}
      <Card className="border-[#bae6fd]/80 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-[#f1f5f9]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-[#0f2a43]">
                Profile Ledger Completeness
              </CardTitle>
              <CardDescription className="text-xs text-[#335577]">
                Complete all profile attributes to increase verification speed by verified organisations.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-[#0369a1] tabular-nums">
                {completion.percentage}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e0f2fe]">
            <div
              className="h-full rounded-full bg-[#0369a1] transition-all duration-500"
              style={{ width: `${completion.percentage}%` }}
              role="progressbar"
              aria-valuenow={completion.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap gap-1.5">
              {completion.items.map((item) => (
                <span
                  key={item.key}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                    item.completed
                      ? "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]"
                      : "bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]"
                  }`}
                >
                  <span className="font-bold">{item.completed ? "✓" : "○"}</span>
                  <span>{item.label}</span>
                </span>
              ))}
            </div>
            {completion.missingCount > 0 && (
              <Link
                href="/volunteer/profile"
                className="inline-flex items-center gap-1 font-bold text-xs text-[#0369a1] hover:text-[#075985] underline underline-offset-2"
              >
                <span>Complete remaining fields</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4-Stat Metric Ledger */}
      <section aria-label="Volunteer Key Metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.Icon;
          return (
            <Card key={stat.label} className="border-[#bae6fd]/80 bg-white transition hover:border-[#7dd3fc] hover:shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0369a1]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-2xl font-black text-[#0f2a43] tabular-nums">
                    {stat.value}
                  </span>
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#075985]">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-[11px] text-[#5a7b9d]">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Main Content Grid: Recent Applications & Badges */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Applications Feed */}
        <Card className="border-[#bae6fd]/80 bg-white lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#f1f5f9]">
            <div>
              <CardTitle className="text-base font-bold text-[#0f2a43]">
                Recent Applications
              </CardTitle>
              <CardDescription className="text-xs text-[#335577]">
                Status of drives you have applied for through the ledger.
              </CardDescription>
            </div>
            <Link
              href="/volunteer/applications"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-xs font-bold text-[#0369a1] hover:text-[#075985] hover:bg-[#f4f9ff] gap-1",
              })}
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {applications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#bae6fd] p-8 text-center bg-[#f4f9ff]/40">
                <ClipboardList className="mx-auto h-8 w-8 text-[#0369a1]/60" />
                <p className="mt-2 text-xs font-semibold text-[#0f2a43]">No active applications recorded</p>
                <p className="mt-1 text-[11px] text-[#5a7b9d]">
                  Discover civic drives matching your skills and start contributing.
                </p>
                <Link
                  href="/opportunities"
                  className={buttonVariants({
                    size: "sm",
                    className: "mt-4 bg-[#0369a1] hover:bg-[#075985] text-white text-xs font-semibold",
                  })}
                >
                  Explore Opportunities
                </Link>
              </div>
            ) : (
              applications.slice(0, 4).map((app) => {
                const badge = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.applied;
                const formattedDate = new Date(app.appliedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#e0f2fe] bg-[#f8fafc] p-4 transition hover:bg-[#f4f9ff] hover:border-[#bae6fd]"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="truncate text-sm font-bold text-[#0f2a43]">
                        {app.opportunityTitle}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5a7b9d]">
                        <span className="inline-flex items-center gap-1 font-medium text-[#335577]">
                          <Building2 className="h-3 w-3 text-[#0369a1]" />
                          {app.organisation}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Applied {formattedDate}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Badge variant={badge.variant} className="text-xs font-semibold px-2.5 py-0.5">
                        {badge.label}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right Rail: Earned Badges & Quick Links */}
        <div className="space-y-6">
          <Card className="border-[#bae6fd]/80 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#0f2a43]">
                    Earned Badges
                  </CardTitle>
                  <CardDescription className="text-xs text-[#335577]">
                    Accredited recognition for service.
                  </CardDescription>
                </div>
                <Award className="h-5 w-5 text-[#0369a1]" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {profile.badges.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#bae6fd] p-4 text-center bg-[#f4f9ff]/40">
                  <p className="text-xs text-[#5a7b9d]">Complete drives to unlock recognition badges.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {profile.badges.map((badgeName) => (
                    <Badge
                      key={badgeName}
                      variant="secondary"
                      className="border-[#bae6fd] bg-[#f4f9ff] px-2.5 py-1 text-xs font-semibold text-[#0369a1] gap-1"
                    >
                      <Award className="h-3 w-3 text-[#0369a1]" />
                      <span>{badgeName}</span>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="pt-1">
                <Link
                  href="/volunteer/badges"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full border-[#bae6fd] text-[#0369a1] hover:bg-[#f4f9ff] text-xs font-bold justify-center",
                  })}
                >
                  View Badge Shelf
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#bae6fd]/80 bg-gradient-to-br from-white to-[#f4f9ff] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f1f5f9]">
              <CardTitle className="text-base font-bold text-[#0f2a43]">
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <Link
                href="/volunteer/profile"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full justify-start text-xs font-semibold border-[#bae6fd]/70 bg-white hover:bg-[#f4f9ff] text-[#335577] hover:text-[#0369a1] gap-2",
                })}
              >
                <User className="h-3.5 w-3.5 text-[#0369a1]" />
                <span>My Profile &amp; Portfolio</span>
              </Link>
              <Link
                href="/volunteer/applications"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full justify-start text-xs font-semibold border-[#bae6fd]/70 bg-white hover:bg-[#f4f9ff] text-[#335577] hover:text-[#0369a1] gap-2",
                })}
              >
                <ClipboardList className="h-3.5 w-3.5 text-[#0369a1]" />
                <span>Applications Tracker</span>
              </Link>
              <Link
                href="/volunteer/leaderboard"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full justify-start text-xs font-semibold border-[#bae6fd]/70 bg-white hover:bg-[#f4f9ff] text-[#335577] hover:text-[#0369a1] gap-2",
                })}
              >
                <Trophy className="h-3.5 w-3.5 text-[#0369a1]" />
                <span>Community Leaderboard</span>
              </Link>
              <Link
                href="/volunteer/certificates"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full justify-start text-xs font-semibold border-[#bae6fd]/70 bg-white hover:bg-[#f4f9ff] text-[#335577] hover:text-[#0369a1] gap-2",
                })}
              >
                <Award className="h-3.5 w-3.5 text-[#0369a1]" />
                <span>Volunteer Certificates</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

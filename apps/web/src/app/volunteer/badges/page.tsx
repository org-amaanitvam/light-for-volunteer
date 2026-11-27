"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { BadgeShelf } from "@/components/volunteer/badge-shelf";
import type { BadgeItem } from "@/types/volunteer";
import { api, GamificationItem } from "@/lib/api";
import {
  Award,
  Trophy,
  Sprout,
  Handshake,
  Sparkles,
  Star,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";

const LEVEL_TIERS = [
  { label: "Newcomer", min: 0, max: 99, Icon: Sprout, color: "text-[#475569]" },
  { label: "Helper", min: 100, max: 299, Icon: Handshake, color: "text-[#0369a1]" },
  { label: "Champion", min: 300, max: 699, Icon: Award, color: "text-[#075985]" },
  { label: "Legend", min: 700, max: Infinity, Icon: Sparkles, color: "text-[#0c4a6e]" },
];

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "earned" | "unearned">("all");
  const [activity, setActivity] = useState<GamificationItem["recentTransactions"]>([]);
  const [points, setPoints] = useState(0);
  const [profileStats, setProfileStats] = useState({ totalHours: 0, ratingAvg: 0 });

  useEffect(() => {
    void loadBadges();
  }, []);

  async function loadBadges() {
    setError(null);
    try {
      const [data, profile] = await Promise.all([api.getMyGamification(), api.getVolunteerProfile()]);
      setPoints(data.points);
      setProfileStats({ totalHours: profile.totalHours, ratingAvg: profile.ratingAvg });
      setActivity(data.recentTransactions || []);
      setBadges(
        (data.badges || []).map((code) => ({
          id: code,
          code,
          title: code.replace(/[_-]/g, " "),
          criteria: "Earned through verified civic drive participation and community milestones.",
          iconUrl: "",
          earned: true,
        }))
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to load badge shelf. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentLevel =
    LEVEL_TIERS.find((t) => points >= t.min && points <= t.max) ?? LEVEL_TIERS[0];
  const nextLevel = LEVEL_TIERS.find((t) => points < t.min) ?? null;

  const progressPct = nextLevel
    ? Math.min(
        100,
        Math.round(((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
      )
    : 100;

  const earnedCount = badges.filter((b) => b.earned).length;

  const displayedBadges = badges.filter((b) => {
    if (filter === "earned") return b.earned;
    if (filter === "unearned") return !b.earned;
    return true;
  });

  const CurrentIcon = currentLevel.Icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f2a43]">
            Badges &amp; Gamification Shelf
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5a7b9d] leading-relaxed">
            Civic milestones, verified impact badges, and service tier progression on the transparent ledger.
          </p>
        </div>
        <Link
          href="/volunteer/leaderboard"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "self-start sm:self-auto border-[#bae6fd] text-[#0369a1] hover:bg-[#f4f9ff] text-xs font-bold gap-1.5 shadow-sm",
          })}
        >
          <Trophy className="h-4 w-4" />
          <span>View Community Leaderboard</span>
        </Link>
      </div>

      {/* Standing & Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Standing Card */}
        <Card className="md:col-span-2 border-[#bae6fd]/80 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-[#f1f5f9]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0369a1]">
                  Current Standing
                </span>
                <CardTitle className="text-lg sm:text-xl font-bold text-[#0f2a43] mt-1 flex items-center gap-2">
                  <CurrentIcon className="h-5 w-5 text-[#0369a1]" />
                  <span>{currentLevel.label} Level</span>
                </CardTitle>
              </div>
              <div className="text-right">
                <span className="font-mono text-3xl font-black text-[#0369a1] tabular-nums">
                  {points}
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7b9d]">
                  Impact Points
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#335577] mb-1.5">
                <span>Current Tier: {currentLevel.label}</span>
                {nextLevel ? (
                  <span className="tabular-nums">
                    {nextLevel.min - points} points to {nextLevel.label}
                  </span>
                ) : (
                  <span className="text-[#0369a1] font-bold">Top Civic Tier Reached</span>
                )}
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e0f2fe]">
                <div
                  className="h-full rounded-full bg-[#0369a1] transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            {/* Level Tier Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {LEVEL_TIERS.map((tier) => {
                const TierIcon = tier.Icon;
                const isCurrent = currentLevel.label === tier.label;
                const isPassed = points >= tier.min;
                return (
                  <div
                    key={tier.label}
                    className={`rounded-xl border p-3 text-center transition ${
                      isCurrent
                        ? "border-[#0369a1] bg-[#f4f9ff] ring-2 ring-[#0369a1]/20 shadow-sm"
                        : isPassed
                        ? "border-[#bae6fd] bg-white"
                        : "border-[#e2e8f0] bg-[#f8fafc] opacity-60"
                    }`}
                  >
                    <TierIcon className={`mx-auto h-5 w-5 ${tier.color}`} />
                    <p className="text-xs font-bold text-[#0f2a43] mt-1">{tier.label}</p>
                    <p className="text-[10px] font-mono text-[#5a7b9d] mt-0.5 tabular-nums">
                      {tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min}–${tier.max} pts`}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Achievements Summary Card */}
        <Card className="border-[#bae6fd]/80 bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-[#f1f5f9]">
            <CardTitle className="text-base font-bold text-[#0f2a43]">
              Achievements Summary
            </CardTitle>
            <CardDescription className="text-xs text-[#335577]">
              Accredited participation milestones.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2.5 text-xs">
              <span className="text-[#5a7b9d] flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-[#0369a1]" />
                <span>Badges Unlocked</span>
              </span>
              <span className="font-mono font-bold text-[#0f2a43] tabular-nums">
                {earnedCount} / {badges.length}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2.5 text-xs">
              <span className="text-[#5a7b9d] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#0369a1]" />
                <span>Verified Service</span>
              </span>
              <span className="font-mono font-bold text-[#0f2a43] tabular-nums">
                {profileStats.totalHours} Hours
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5a7b9d] flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span>Quality Rating</span>
              </span>
              <span className="font-mono font-bold text-[#075985] tabular-nums">
                ★ {profileStats.ratingAvg.toFixed(1)} / 5.0
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Collection Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0f2a43]">Badge Collection</h2>
            <p className="text-xs text-[#5a7b9d]">
              Showing unlocked civic credentials and upcoming milestones.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter badges"
            className="flex gap-1 rounded-xl border border-[#bae6fd]/80 bg-white p-1 shadow-sm"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filter === "all"}
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
                filter === "all"
                  ? "bg-[#0369a1] text-white shadow-sm"
                  : "text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
              }`}
            >
              All ({badges.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === "earned"}
              onClick={() => setFilter("earned")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
                filter === "earned"
                  ? "bg-[#0369a1] text-white shadow-sm"
                  : "text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
              }`}
            >
              Unlocked ({earnedCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === "unearned"}
              onClick={() => setFilter("unearned")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
                filter === "unearned"
                  ? "bg-[#0369a1] text-white shadow-sm"
                  : "text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
              }`}
            >
              In Progress ({badges.length - earnedCount})
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[25vh] items-center justify-center" role="status" aria-label="Loading badges">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0369a1] border-t-transparent" />
          </div>
        )}

        {error && (
          <div role="alert" className="flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="text-xs font-semibold text-red-700">{error}</p>
            <Button size="sm" variant="outline" onClick={loadBadges} className="text-xs">
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && (
          <BadgeShelf
            badges={displayedBadges}
            emptyMessage={
              filter === "earned"
                ? "No unlocked badges yet. Participate in drives to earn your first badge!"
                : "No matching badges."
            }
          />
        )}
      </div>

      {/* Recent Points Activity Ledger */}
      <Card className="border-[#bae6fd]/80 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-[#f1f5f9]">
          <CardTitle className="text-base font-bold text-[#0f2a43]">
            Recent Points Activity
          </CardTitle>
          <CardDescription className="text-xs text-[#335577]">
            Recorded events that contributed to your impact points balance.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {activity.length === 0 ? (
            <p className="text-xs text-[#5a7b9d] text-center py-4">No recent points transactions recorded.</p>
          ) : (
            <ul className="divide-y divide-[#f1f5f9] text-xs">
              {activity.map((item, idx) => (
                <li
                  key={`${item.eventType}-${item.createdAt}-${idx}`}
                  className="flex items-center justify-between py-3"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#0f2a43] capitalize">
                      {item.eventType.replace(/[_-]/g, " ")}
                    </p>
                    <p className="text-[11px] text-[#5a7b9d] flex items-center gap-1 tabular-nums">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono font-bold text-[#0369a1] bg-[#e0f2fe] border-[#bae6fd] tabular-nums">
                    +{item.points} pts
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Civic Transparency Notice */}
      <div className="rounded-xl border border-[#bae6fd]/80 bg-[#f4f9ff] p-4 text-xs text-[#335577] flex items-center gap-2">
        <Award className="h-4 w-4 text-[#0369a1] shrink-0" />
        <span>
          Badges and impact points are credited upon verified completion of volunteer opportunities. Progress tiers (Newcomer to Legend) reflect milestone thresholds on cumulative points.
        </span>
      </div>
    </div>
  );
}

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
import { Button } from "@/components/ui/button";
import { BadgeShelf } from "@/components/volunteer/badge-shelf";
import type { BadgeItem } from "@/types/volunteer";
import {
  MOCK_VOLUNTEER_PROFILE,
  MOCK_ACTIVITY_FEED,
  getMockBadges,
} from "@/lib/volunteer-mock-adapter";

const LEVEL_TIERS = [
  { label: "Newcomer", min: 0, max: 99, icon: "🌱", color: "text-slate-600" },
  { label: "Helper", min: 100, max: 299, icon: "🤝", color: "text-sky-600" },
  { label: "Champion", min: 300, max: 699, icon: "🏆", color: "text-amber-600" },
  { label: "Legend", min: 700, max: Infinity, icon: "🌟", color: "text-purple-600" },
];

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "earned" | "unearned">("all");

  const points = MOCK_VOLUNTEER_PROFILE.points;

  useEffect(() => {
    loadBadges();
  }, []);

  function loadBadges() {
    setLoading(true);
    setError(null);
    getMockBadges()
      .then((data) => {
        setBadges(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load badge shelf. Please try again.");
        setLoading(false);
      });
  }

  const currentLevel =
    LEVEL_TIERS.find((t) => points >= t.min && points <= t.max) ?? LEVEL_TIERS[0];
  const nextLevel =
    LEVEL_TIERS.find((t) => points < t.min) ?? null;

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Badges &amp; Gamification Shelf
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Celebrate community impact, unlock badges, and track your progression rank.
          </p>
        </div>
        <Link href="/volunteer/leaderboard">
          <Button variant="outline" className="self-start sm:self-auto gap-2">
            <span>🏆</span> View Community Leaderboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-sky-100/80 bg-gradient-to-br from-white via-sky-50/20 to-cyan-50/30 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  Current Standing
                </span>
                <CardTitle className="text-xl sm:text-2xl mt-1">
                  {currentLevel.icon} {currentLevel.label} Level
                </CardTitle>
              </div>
              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-black text-sky-600">{points}</span>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Impact Points
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Current Tier: {currentLevel.label}</span>
                {nextLevel ? (
                  <span>
                    {nextLevel.min - points} points to {nextLevel.icon} {nextLevel.label}
                  </span>
                ) : (
                  <span>Max Tier Reached!</span>
                )}
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {LEVEL_TIERS.map((tier) => {
                const isCurrent = currentLevel.label === tier.label;
                const isPassed = points >= tier.min;
                return (
                  <div
                    key={tier.label}
                    className={`rounded-xl border p-2.5 text-center transition ${
                      isCurrent
                        ? "border-sky-300 bg-white shadow-sm ring-2 ring-sky-400/20"
                        : isPassed
                        ? "border-emerald-200 bg-emerald-50/40 opacity-90"
                        : "border-slate-100 bg-slate-50/60 opacity-50"
                    }`}
                  >
                    <span className="text-lg">{tier.icon}</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{tier.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min}-${tier.max} pts`}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-100/80 bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Achievements Summary
            </CardTitle>
            <CardDescription>Verified participation milestones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-sky-50 pb-3 text-xs">
              <span className="text-slate-600">Badges Unlocked</span>
              <span className="font-extrabold text-slate-900">
                {earnedCount} / {badges.length}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-sky-50 pb-3 text-xs">
              <span className="text-slate-600">Verified Service</span>
              <span className="font-extrabold text-slate-900">
                {MOCK_VOLUNTEER_PROFILE.totalHours} Hours
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Quality Rating</span>
              <span className="font-extrabold text-amber-600">
                ★ {MOCK_VOLUNTEER_PROFILE.ratingAvg.toFixed(1)} / 5.0
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Badge Collection</h2>
            <p className="text-xs text-slate-500">
              Showing badges you have unlocked and upcoming challenges.
            </p>
          </div>

          <div className="flex gap-1.5 rounded-2xl border border-sky-100 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filter === "all"
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-sky-700"
              }`}
            >
              All ({badges.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("earned")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filter === "earned"
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-sky-700"
              }`}
            >
              Unlocked ({earnedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unearned")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filter === "unearned"
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-sky-700"
              }`}
            >
              In Progress ({badges.length - earnedCount})
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50/40 p-6 text-center">
            <CardContent className="space-y-2 pt-6">
              <p className="text-xs font-semibold text-red-700">{error}</p>
              <Button size="sm" variant="outline" onClick={loadBadges}>
                Retry
              </Button>
            </CardContent>
          </Card>
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

      <Card className="border-sky-100/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900">
            Recent Points Activity
          </CardTitle>
          <CardDescription>Actions that contributed to your impact points score.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-sky-50 text-xs">
            {MOCK_ACTIVITY_FEED.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">{item.action}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(item.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge variant="secondary" className="font-bold text-sky-700 bg-sky-50 border-sky-200">
                  +{item.points} pts
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Gamification Architecture Note:</p>
        <p className="mt-0.5">
          Badge requirements and points data are populated via the gamification adapter. The backend currently contains the TypeORM `badges` entity and a controller stub (`GET /api/gamification/ping`). Live score calculation and real-time badge distribution will bind once the gamification engine is finalized.
        </p>
      </div>
    </div>
  );
}

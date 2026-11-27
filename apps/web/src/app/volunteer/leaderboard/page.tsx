"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import type { LeaderboardEntry } from "@/types/volunteer";
import { api } from "@/lib/api";
import {
  Medal,
  Award,
  Search,
  X,
  RefreshCw,
  MapPin,
  ShieldCheck,
  Crown,
  AlertCircle,
} from "lucide-react";

const PODIUM_CONFIG = [
  {
    rank: 1,
    label: "Civic Champion",
    Icon: Crown,
    badgeBg: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
    avatarBg: "bg-[#0369a1] text-white",
    cardBorder: "border-[#0369a1]/40 shadow-md",
  },
  {
    rank: 2,
    label: "Runner Up",
    Icon: Medal,
    badgeBg: "bg-[#f1f5f9] text-[#335577] border-[#cbd5e1]",
    avatarBg: "bg-[#075985] text-white",
    cardBorder: "border-[#bae6fd]/80 shadow-sm",
  },
  {
    rank: 3,
    label: "3rd Place",
    Icon: Award,
    badgeBg: "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]",
    avatarBg: "bg-[#0c4a6e] text-white",
    cardBorder: "border-[#bae6fd]/80 shadow-sm",
  },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadLeaderboard();
    const timer = window.setInterval(() => {
      if (!document.hidden) void loadLeaderboard();
    }, 30_000);
    window.addEventListener("focus", loadLeaderboard);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", loadLeaderboard);
    };
  }, []);

  async function loadLeaderboard() {
    setError(null);
    try {
      const data = await api.request<{
        entries: {
          rank: number;
          userId: string;
          name: string;
          city: string | null;
          points: number;
          badges: string[];
        }[];
      }>("/leaderboard?page=1&limit=100");
      setEntries(
        data.entries.map((item) => ({
          rank: item.rank,
          volunteerId: item.userId,
          name: item.name,
          city: item.city,
          points: item.points,
          badgeCount: item.badges.length,
        }))
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load leaderboard. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  const filteredEntries = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.city ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = entries.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f2a43]">
            Volunteer Leaderboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5a7b9d] leading-relaxed">
            Recognizing dedicated contributors across community drives, education, and health programs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLeaderboard}
            disabled={loading}
            className="border-[#bae6fd] text-[#0369a1] hover:bg-[#f4f9ff] text-xs font-semibold gap-1.5"
            aria-label="Refresh leaderboard rankings"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <span className="rounded-xl border border-[#bae6fd]/80 bg-white px-3.5 py-1.5 text-xs font-bold text-[#075985] shadow-sm">
            All-Time Points Ledger
          </span>
        </div>
      </div>

      {/* Podium Cards for Top 3 (shown when not searching) */}
      {!loading && !error && topThree.length === 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Runner Up */}
          <Card className={`order-2 md:order-1 ${PODIUM_CONFIG[1].cardBorder} bg-white`}>
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#335577] mb-2">
                <Medal className="h-5 w-5" />
              </div>
              <div
                className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-lg mb-2 shadow-sm ${PODIUM_CONFIG[1].avatarBg}`}
              >
                {topThree[1].name.charAt(0)}
              </div>
              <Badge variant="outline" className={`mb-2 text-[10px] font-bold ${PODIUM_CONFIG[1].badgeBg}`}>
                #2 • {PODIUM_CONFIG[1].label}
              </Badge>
              <h3 className="font-bold text-[#0f2a43] text-base">{topThree[1].name}</h3>
              <p className="text-xs text-[#5a7b9d] flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-[#0369a1]" />
                <span>{topThree[1].city ?? "Community Volunteer"}</span>
              </p>
              <div className="mt-4 pt-3 border-t border-[#f1f5f9] w-full flex justify-around text-xs">
                <div>
                  <p className="font-mono font-bold text-[#0369a1] text-sm tabular-nums">{topThree[1].points}</p>
                  <p className="text-[10px] text-[#5a7b9d] uppercase font-bold tracking-wider">Points</p>
                </div>
                <div>
                  <p className="font-mono font-bold text-[#0f2a43] text-sm tabular-nums">{topThree[1].badgeCount}</p>
                  <p className="text-[10px] text-[#5a7b9d] uppercase font-bold tracking-wider">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* #1 Champion */}
          <Card className={`order-1 md:order-2 ${PODIUM_CONFIG[0].cardBorder} bg-gradient-to-b from-[#f4f9ff] via-white to-white md:-translate-y-2`}>
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#0369a1] mb-2 border border-[#bae6fd]">
                <Crown className="h-6 w-6" />
              </div>
              <div
                className={`h-16 w-16 rounded-2xl flex items-center justify-center font-extrabold text-xl mb-2 shadow-md ${PODIUM_CONFIG[0].avatarBg} ring-4 ring-[#bae6fd]`}
              >
                {topThree[0].name.charAt(0)}
              </div>
              <Badge variant="outline" className={`mb-2 text-[10px] font-bold ${PODIUM_CONFIG[0].badgeBg}`}>
                #1 • {PODIUM_CONFIG[0].label}
              </Badge>
              <h3 className="font-extrabold text-[#0f2a43] text-lg">{topThree[0].name}</h3>
              <p className="text-xs text-[#5a7b9d] flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-[#0369a1]" />
                <span>{topThree[0].city ?? "Community Volunteer"}</span>
              </p>
              <div className="mt-4 pt-3 border-t border-[#bae6fd] w-full flex justify-around text-xs">
                <div>
                  <p className="font-mono font-black text-[#0369a1] text-base tabular-nums">{topThree[0].points}</p>
                  <p className="text-[10px] text-[#5a7b9d] uppercase font-bold tracking-wider">Points</p>
                </div>
                <div>
                  <p className="font-mono font-bold text-[#0f2a43] text-base tabular-nums">{topThree[0].badgeCount}</p>
                  <p className="text-[10px] text-[#5a7b9d] uppercase font-bold tracking-wider">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* #3 3rd Place */}
          <Card className={`order-3 md:order-3 ${PODIUM_CONFIG[2].cardBorder} bg-white`}>
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8fafc] text-[#475569] mb-2">
                <Award className="h-5 w-5" />
              </div>
              <div
                className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-lg mb-2 shadow-sm ${PODIUM_CONFIG[2].avatarBg}`}
              >
                {topThree[2].name.charAt(0)}
              </div>
              <Badge variant="outline" className={`mb-2 text-[10px] font-bold ${PODIUM_CONFIG[2].badgeBg}`}>
                #3 • {PODIUM_CONFIG[2].label}
              </Badge>
              <h3 className="font-bold text-[#0f2a43] text-base">{topThree[2].name}</h3>
              <p className="text-xs text-[#5a7b9d] flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-[#0369a1]" />
                <span>{topThree[2].city ?? "Community Volunteer"}</span>
              </p>
              <div className="mt-4 pt-3 border-t border-[#f1f5f9] w-full flex justify-around text-xs">
                <div>
                  <p className="font-mono font-bold text-[#0369a1] text-sm tabular-nums">{topThree[2].points}</p>
                  <p className="text-[10px] text-[#5a7b9d] uppercase font-bold tracking-wider">Points</p>
                </div>
                <div>
                  <p className="font-mono font-bold text-[#0f2a43] text-sm tabular-nums">{topThree[2].badgeCount}</p>
                  <p className="text-[10px] text-[#5a7b9d] uppercase font-bold tracking-wider">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rankings Table Card */}
      <Card className="border-[#bae6fd]/80 bg-white shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#f1f5f9]">
          <div>
            <CardTitle className="text-base font-bold text-[#0f2a43]">
              Rankings Table
            </CardTitle>
            <CardDescription className="text-xs text-[#335577]">
              Ranked strictly by verified cumulative impact points across recorded drives.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5a7b9d]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volunteer or city…"
              className="h-10 pl-9 pr-8 text-xs border-[#bae6fd] bg-white focus-visible:ring-[#0369a1]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5a7b9d] hover:text-[#0f2a43]"
                aria-label="Clear query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {loading && (
            <div className="flex min-h-[30vh] items-center justify-center" role="status" aria-label="Loading rankings">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0369a1] border-t-transparent" />
            </div>
          )}

          {error && (
            <div role="alert" className="p-8 text-center space-y-2">
              <AlertCircle className="mx-auto h-6 w-6 text-red-600" />
              <p className="text-xs font-semibold text-red-700">{error}</p>
              <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={loadLeaderboard}>
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && filteredEntries.length === 0 && (
            <div className="p-10 text-center space-y-2">
              <p className="text-xs font-medium text-[#5a7b9d]">No volunteers found matching your query.</p>
              <Button size="sm" variant="outline" className="text-xs border-[#bae6fd]" onClick={() => setSearchQuery("")}>
                Clear Filter
              </Button>
            </div>
          )}

          {!loading && !error && filteredEntries.length > 0 && (
            <div className="divide-y divide-[#f1f5f9]" role="table" aria-label="Leaderboard Rankings">
              {filteredEntries.map((entry) => {
                const isCurrentUser =
                  entry.volunteerId === "v-me" ||
                  entry.volunteerId === user?.id ||
                  (user?.name && entry.name.toLowerCase() === user.name.toLowerCase());

                return (
                  <div
                    key={entry.volunteerId}
                    role="row"
                    className={`flex items-center justify-between py-3.5 px-3 rounded-xl transition ${
                      isCurrentUser
                        ? "bg-[#f4f9ff] border border-[#bae6fd] shadow-xs"
                        : "hover:bg-[#f8fafc]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 text-center font-mono text-xs font-black text-[#0369a1] tabular-nums">
                        #{entry.rank}
                      </span>
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-[#0369a1] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {entry.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-bold text-sm text-[#0f2a43]">{entry.name}</p>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-[10px] font-bold text-[#0369a1] bg-[#e0f2fe] border-[#bae6fd]">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#5a7b9d] flex items-center gap-2">
                          {entry.city && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-[#0369a1]" />
                              {entry.city}
                            </span>
                          )}
                          <span>•</span>
                          <span className="font-mono tabular-nums">{entry.badgeCount} badges</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-black text-[#0369a1] text-sm tabular-nums">
                        {entry.points}
                      </span>
                      <span className="text-[11px] text-[#5a7b9d] ml-1 font-semibold">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Policy Notice */}
      <div className="rounded-xl border border-[#bae6fd]/80 bg-[#f4f9ff] p-4 text-xs text-[#335577] flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#0369a1] shrink-0" />
        <span>
          Leaderboard syncs with verified civic hours and point disbursements automatically every 30 seconds.
        </span>
      </div>
    </div>
  );
}

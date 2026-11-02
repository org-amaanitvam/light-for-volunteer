"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import type { LeaderboardEntry } from "@/types/volunteer";
import { api } from "@/lib/api";

const PODIUM_CONFIG = [
  {
    rank: 1,
    label: "Champion",
    medal: "🥇",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
    avatarBg: "bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950",
    ring: "ring-4 ring-amber-400/30",
  },
  {
    rank: 2,
    label: "Runner Up",
    medal: "🥈",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-300",
    avatarBg: "bg-gradient-to-tr from-slate-300 to-slate-200 text-slate-800",
    ring: "ring-4 ring-slate-300/30",
  },
  {
    rank: 3,
    label: "3rd Place",
    medal: "🥉",
    badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
    avatarBg: "bg-gradient-to-tr from-amber-600 to-orange-400 text-white",
    ring: "ring-4 ring-orange-400/20",
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
    const timer = window.setInterval(() => void loadLeaderboard(), 30_000);
    window.addEventListener("focus", loadLeaderboard);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", loadLeaderboard); };
  }, []);

  async function loadLeaderboard() {
    setError(null);
    try {
      const data = await api.request<{ entries: { rank: number; userId: string; name: string; city: string | null; points: number; badges: string[] }[] }>("/leaderboard?page=1&limit=100");
      setEntries(data.entries.map((item) => ({ rank: item.rank, volunteerId: item.userId, name: item.name, city: item.city, points: item.points, badgeCount: item.badges.length })));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load leaderboard. Please retry.");
    } finally { setLoading(false); }
  }

  const filteredEntries = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.city ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = entries.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Volunteer Leaderboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Recognizing top contributors across community drives, education, and health programs.
          </p>
        </div>

        <span className="rounded-xl border border-sky-100 bg-white px-4 py-2 text-xs font-bold text-slate-600">All-time points</span>
      </div>

      {!loading && !error && topThree.length === 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <Card className="order-2 md:order-1 border-slate-200 bg-gradient-to-b from-white to-slate-50/60 shadow-sm">
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
              <span className="text-3xl mb-1">{PODIUM_CONFIG[1].medal}</span>
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md ${PODIUM_CONFIG[1].avatarBg} ${PODIUM_CONFIG[1].ring}`}
              >
                {topThree[1].name.charAt(0)}
              </div>
              <Badge variant="outline" className={`mb-2 text-[10px] font-bold ${PODIUM_CONFIG[1].badgeBg}`}>
                #2 • {PODIUM_CONFIG[1].label}
              </Badge>
              <h3 className="font-bold text-slate-900 text-base">{topThree[1].name}</h3>
              <p className="text-xs text-slate-500">{topThree[1].city}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex justify-around text-xs">
                <div>
                  <p className="font-extrabold text-sky-600">{topThree[1].points}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Points</p>
                </div>
                <div>
                  <p className="font-extrabold text-slate-700">{topThree[1].badgeCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="order-1 md:order-2 border-amber-200 bg-gradient-to-b from-amber-50/30 via-white to-amber-50/40 shadow-md md:-translate-y-2">
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
              <span className="text-4xl mb-1">{PODIUM_CONFIG[0].medal}</span>
              <div
                className={`h-20 w-20 rounded-full flex items-center justify-center font-extrabold text-2xl mb-3 shadow-lg ${PODIUM_CONFIG[0].avatarBg} ${PODIUM_CONFIG[0].ring}`}
              >
                {topThree[0].name.charAt(0)}
              </div>
              <Badge variant="outline" className={`mb-2 text-[10px] font-bold ${PODIUM_CONFIG[0].badgeBg}`}>
                #1 • {PODIUM_CONFIG[0].label}
              </Badge>
              <h3 className="font-extrabold text-slate-900 text-lg">{topThree[0].name}</h3>
              <p className="text-xs text-slate-500">{topThree[0].city}</p>
              <div className="mt-4 pt-3 border-t border-amber-100 w-full flex justify-around text-xs">
                <div>
                  <p className="font-extrabold text-amber-600 text-sm">{topThree[0].points}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Points</p>
                </div>
                <div>
                  <p className="font-extrabold text-slate-700 text-sm">{topThree[0].badgeCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="order-3 md:order-3 border-orange-100 bg-gradient-to-b from-white to-orange-50/40 shadow-sm">
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
              <span className="text-3xl mb-1">{PODIUM_CONFIG[2].medal}</span>
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md ${PODIUM_CONFIG[2].avatarBg} ${PODIUM_CONFIG[2].ring}`}
              >
                {topThree[2].name.charAt(0)}
              </div>
              <Badge variant="outline" className={`mb-2 text-[10px] font-bold ${PODIUM_CONFIG[2].badgeBg}`}>
                #3 • {PODIUM_CONFIG[2].label}
              </Badge>
              <h3 className="font-bold text-slate-900 text-base">{topThree[2].name}</h3>
              <p className="text-xs text-slate-500">{topThree[2].city}</p>
              <div className="mt-4 pt-3 border-t border-orange-100 w-full flex justify-around text-xs">
                <div>
                  <p className="font-extrabold text-sky-600">{topThree[2].points}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Points</p>
                </div>
                <div>
                  <p className="font-extrabold text-slate-700">{topThree[2].badgeCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-sky-100/80 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg">Rankings Table</CardTitle>
            <CardDescription>
              Showing volunteers ranked by their current total impact points.
            </CardDescription>
          </div>
          <div className="w-full sm:w-64">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by volunteer or city..."
              className="h-10 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex min-h-[30vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <p className="text-xs font-semibold text-red-600">{error}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={loadLeaderboard}>
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && filteredEntries.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">No volunteers found matching your query.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setSearchQuery("")}>
                Clear Filter
              </Button>
            </div>
          )}

          {!loading && !error && filteredEntries.length > 0 && (
            <div className="divide-y divide-sky-50">
              {filteredEntries.map((entry) => {
                const isCurrentUser =
                  entry.volunteerId === "v-me" ||
                  (user?.name && entry.name.toLowerCase() === user.name.toLowerCase());

                return (
                  <div
                    key={entry.volunteerId}
                    className={`flex items-center justify-between py-3.5 px-3 rounded-xl transition ${
                      isCurrentUser ? "bg-sky-50/70 border border-sky-200" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 text-center text-sm font-black ${
                          entry.rank === 1
                            ? "text-amber-500"
                            : entry.rank === 2
                            ? "text-slate-400"
                            : entry.rank === 3
                            ? "text-amber-700"
                            : "text-slate-400"
                        }`}
                      >
                        #{entry.rank}
                      </span>
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {entry.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900">{entry.name}</p>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-[10px] font-bold text-sky-800 bg-sky-100">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {entry.city} • {entry.badgeCount} badges
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sky-600 text-sm">{entry.points}</span>
                      <span className="text-[11px] text-slate-400 ml-1 font-medium">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 text-xs text-slate-500">
        <p>Rankings refresh from current volunteer points every 30 seconds while this page is open.</p>
      </div>
    </div>
  );
}

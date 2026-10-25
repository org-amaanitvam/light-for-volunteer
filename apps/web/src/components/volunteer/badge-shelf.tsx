"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { BadgeItem } from "@/types/volunteer";

interface BadgeShelfProps {
  badges: BadgeItem[];
  emptyMessage?: string;
  className?: string;
}

export function BadgeShelf({
  badges,
  emptyMessage = "No badges to display in this shelf.",
  className = "",
}: BadgeShelfProps) {
  if (badges.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/20 p-8 text-center">
        <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {badges.map((badge) => {
        const formattedDate = badge.earnedAt
          ? new Date(badge.earnedAt).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })
          : null;

        return (
          <div
            key={badge.id}
            className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
              badge.earned
                ? "border-sky-200 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/30 shadow-sm hover:shadow-md hover:border-sky-300"
                : "border-slate-200/80 bg-slate-50/60 opacity-60 grayscale-[70%]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm ${
                    badge.earned
                      ? "bg-white border border-sky-100 shadow-sky-500/10"
                      : "bg-slate-200/80 border border-slate-300"
                  }`}
                >
                  {badge.earned ? badge.iconUrl || "🏅" : "🔒"}
                </div>
                {badge.category && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {badge.category}
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-900">{badge.title}</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{badge.criteria}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
              {badge.earned ? (
                <div className="flex items-center gap-1.5">
                  <Badge variant="success" className="text-[11px] font-semibold px-2 py-0.5">
                    ✓ Unlocked
                  </Badge>
                  {formattedDate && (
                    <span className="text-[11px] text-slate-400">{formattedDate}</span>
                  )}
                </div>
              ) : (
                <Badge variant="outline" className="text-[11px] font-medium text-slate-500 bg-white">
                  Locked
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

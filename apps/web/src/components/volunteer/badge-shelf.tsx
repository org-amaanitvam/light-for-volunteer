"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { BadgeItem } from "@/types/volunteer";
import { Award, Lock, CheckCircle2, Calendar } from "lucide-react";

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
      <div className="rounded-2xl border border-dashed border-[#bae6fd] bg-[#f4f9ff]/40 p-8 text-center">
        <p className="text-xs font-medium text-[#5a7b9d]">{emptyMessage}</p>
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
                ? "border-[#bae6fd] bg-white shadow-sm hover:border-[#7dd3fc] hover:shadow-md"
                : "border-[#e2e8f0] bg-[#f8fafc] opacity-65"
            }`}
          >
            <div>
              {/* Badge Icon Seal */}
              <div className="flex items-center justify-between mb-3.5">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
                    badge.earned
                      ? "bg-[#e0f2fe] border-[#bae6fd] text-[#0369a1] shadow-sm"
                      : "bg-[#e2e8f0] border-[#cbd5e1] text-[#94a3b8]"
                  }`}
                >
                  {badge.earned ? (
                    <Award className="h-6 w-6 text-[#0369a1]" />
                  ) : (
                    <Lock className="h-5 w-5 text-[#94a3b8]" />
                  )}
                </div>
                {badge.category && (
                  <span className="rounded bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                    {badge.category}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-[#0f2a43] tracking-tight">{badge.title}</h4>
              <p className="mt-1 text-xs text-[#5a7b9d] leading-relaxed">{badge.criteria}</p>
            </div>

            {/* Status Footer */}
            <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
              {badge.earned ? (
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[11px] font-bold px-2 py-0.5 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Unlocked</span>
                  </Badge>
                  {formattedDate && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#5a7b9d] tabular-nums">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </span>
                  )}
                </div>
              ) : (
                <Badge variant="outline" className="text-[11px] font-medium text-[#64748b] bg-white border-[#cbd5e1] gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Locked</span>
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

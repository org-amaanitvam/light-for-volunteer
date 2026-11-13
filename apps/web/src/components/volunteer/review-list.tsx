"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReviewItem } from "@/types/volunteer";
import { Building2, Calendar, UserCheck, MessageSquare } from "lucide-react";

interface ReviewListProps {
  reviews: ReviewItem[];
  emptyMessage?: string;
  className?: string;
}

export function ReviewList({
  reviews,
  emptyMessage = "No reviews submitted yet. Submit feedback on your completed volunteer drives above.",
  className = "",
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#bae6fd] bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0369a1]">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f2a43]">No reviews recorded yet</h3>
        <p className="mt-1 text-xs text-[#5a7b9d] max-w-sm mx-auto leading-relaxed">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} role="feed" aria-label="Submitted reviews list">
      {reviews.map((rev) => {
        const formattedDate = new Date(rev.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return (
          <Card
            key={rev.id}
            className="border-[#bae6fd]/80 bg-white shadow-sm transition hover:border-[#7dd3fc] hover:shadow-md"
          >
            <CardContent className="p-5 sm:p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-[#0f2a43] text-sm sm:text-base tracking-tight">
                    {rev.opportunityTitle}
                  </h4>
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#335577]">
                    <Building2 className="h-3.5 w-3.5 text-[#0369a1]" />
                    <span>{rev.organisation}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex text-amber-500 text-sm" aria-label={`${rev.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= rev.rating ? "★" : <span className="text-slate-200">★</span>}
                      </span>
                    ))}
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs font-bold px-2 py-0.5 bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd] tabular-nums">
                    {rev.rating}.0
                  </Badge>
                </div>
              </div>

              <blockquote className="text-xs sm:text-sm text-[#335577] leading-relaxed bg-[#f8fafc] rounded-xl p-3.5 border border-[#e2e8f0]">
                &ldquo;{rev.comment}&rdquo;
              </blockquote>

              <div className="flex items-center justify-between text-[11px] text-[#5a7b9d] pt-1 border-t border-[#f1f5f9]">
                <span className="inline-flex items-center gap-1 font-medium text-[#335577]">
                  <UserCheck className="h-3 w-3 text-[#0369a1]" />
                  <span>Reviewer: {rev.reviewerName ?? "Volunteer"}</span>
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Calendar className="h-3 w-3 text-[#0369a1]" />
                  <span>Submitted on {formattedDate}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

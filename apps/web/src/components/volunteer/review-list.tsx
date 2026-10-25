"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReviewItem } from "@/types/volunteer";

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
      <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl">
          ⭐
        </div>
        <h3 className="text-base font-bold text-slate-900">No reviews recorded yet</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {reviews.map((rev) => {
        const formattedDate = new Date(rev.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return (
          <Card
            key={rev.id}
            className="border-sky-100 shadow-sm transition-all duration-200 hover:border-sky-200 hover:shadow-md"
          >
            <CardContent className="p-5 sm:p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {rev.opportunityTitle}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {rev.organisation}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= rev.rating ? "★" : <span className="text-slate-200">★</span>}
                      </span>
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
                    {rev.rating}.0
                  </Badge>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 rounded-xl p-3 border border-slate-100">
                &ldquo;{rev.comment}&rdquo;
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Reviewer: {rev.reviewerName ?? "Volunteer"}</span>
                <span>Submitted on {formattedDate}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

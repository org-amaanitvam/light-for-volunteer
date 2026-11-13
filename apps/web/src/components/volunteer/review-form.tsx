"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Application, ReviewItem } from "@/types/volunteer";
import { MessageSquarePlus, CheckCircle2, AlertCircle } from "lucide-react";

interface ReviewFormProps {
  completedApplications: Application[];
  existingReviews?: ReviewItem[];
  onReviewSubmitted?: (review: ReviewItem) => void;
  className?: string;
}

export function ReviewForm({
  completedApplications,
  existingReviews = [],
  onReviewSubmitted,
  className = "",
}: ReviewFormProps) {
  const [selectedAppId, setSelectedAppId] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const reviewedAppIds = new Set(existingReviews.map((r) => r.applicationId).filter(Boolean));
  const eligibleApplications = completedApplications.filter(
    (app) => app.status === "completed" && !reviewedAppIds.has(app.id)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedAppId) {
      setErrorMsg("Please select a completed volunteer opportunity to review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMsg("Rating must be between 1 and 5 stars.");
      return;
    }

    if (comment.trim().length < 10) {
      setErrorMsg("Please provide at least 10 characters of detailed constructive feedback.");
      return;
    }

    const application = eligibleApplications.find((app) => app.id === selectedAppId);
    if (!application) {
      setErrorMsg("Reviews can only be submitted for completed or verified applications.");
      return;
    }

    setIsSubmitting(true);

    try {
      const saved = await api.request<{ id: string; applicationId: string }>("/reviews", {
        method: "POST",
        body: JSON.stringify({ applicationId: application.id, rating, comment: comment.trim() }),
      });

      const newReview: ReviewItem = {
        id: saved.id,
        opportunityTitle: application.opportunityTitle,
        organisation: application.organisation,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        reviewerName: "You",
        applicationId: saved.applicationId,
      };

      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }

      setSuccessMsg(
        `Review for "${application.opportunityTitle}" recorded successfully. Thank you for strengthening community accountability.`
      );
      setSelectedAppId("");
      setRating(5);
      setComment("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to record review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className={`border-[#bae6fd]/80 bg-white shadow-sm ${className}`}>
      <CardHeader className="pb-3 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e0f2fe] text-[#0369a1]">
            <MessageSquarePlus className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-[#0f2a43]">
              Leave a Review
            </CardTitle>
            <CardDescription className="text-xs text-[#335577]">
              Provide feedback on completed civic drives.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {eligibleApplications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#bae6fd] bg-[#f4f9ff]/40 p-6 text-center space-y-1">
            <p className="text-xs font-bold text-[#0f2a43]">
              {completedApplications.some((a) => a.status === "completed")
                ? "All completed drives have been reviewed"
                : "No completed drives available to review yet"}
            </p>
            <p className="text-[11px] text-[#5a7b9d] leading-relaxed">
              {completedApplications.some((a) => a.status === "completed")
                ? "You have submitted feedback for all completed opportunities. Thank you for your contributions!"
                : "Reviews unlock automatically once a host organisation confirms your volunteer participation as completed."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="applicationSelect"
                className="block text-xs font-bold text-[#0f2a43] mb-1"
              >
                Completed Opportunity *
              </label>
              <select
                id="applicationSelect"
                value={selectedAppId}
                onChange={(e) => {
                  setSelectedAppId(e.target.value);
                  setErrorMsg(null);
                }}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-xl border border-[#bae6fd] bg-white px-3 py-2 text-xs text-[#0f2a43] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] shadow-xs disabled:opacity-60"
              >
                <option value="">Select a completed drive…</option>
                {eligibleApplications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.opportunityTitle} ({app.organisation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0f2a43] mb-1">
                Rating (1 to 5 Stars) *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 text-2xl transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] rounded disabled:opacity-60"
                    aria-label={`Select ${star} stars`}
                  >
                    <span
                      className={
                        star <= (hoveredRating || rating)
                          ? "text-amber-400"
                          : "text-slate-200"
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
                <span className="ml-2 font-mono text-xs font-bold text-[#335577] tabular-nums">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="reviewComment"
                className="block text-xs font-bold text-[#0f2a43] mb-1"
              >
                Constructive Commentary *
              </label>
              <textarea
                id="reviewComment"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setErrorMsg(null);
                }}
                rows={4}
                disabled={isSubmitting}
                placeholder="Detail your volunteering experience, drive safety, logistics coordination, and suggestions for future volunteers…"
                className="flex w-full rounded-xl border border-[#bae6fd] bg-white px-3.5 py-2.5 text-xs text-[#0f2a43] placeholder:text-[#94a3b8] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] shadow-xs disabled:opacity-60"
              />
              <span className="font-mono text-[11px] text-[#5a7b9d] mt-1 block tabular-nums">
                {comment.trim().length} / minimum 10 characters
              </span>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-medium"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !selectedAppId}
              className="w-full bg-[#0369a1] hover:bg-[#075985] text-white text-xs font-bold min-h-[40px] shadow-sm"
            >
              {isSubmitting ? "Submitting Review…" : "Submit Review"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

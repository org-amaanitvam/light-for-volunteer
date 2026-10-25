"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Application, ReviewItem } from "@/types/volunteer";

interface ReviewFormProps {
  completedApplications: Application[];
  onReviewSubmitted?: (review: ReviewItem) => void;
  className?: string;
}

export function ReviewForm({
  completedApplications,
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

  const eligibleApplications = completedApplications.filter(
    (app) => app.status === "completed" || app.status === "selected" || app.status === "accepted"
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
      try {
        await api.request("/reviews", {
          method: "POST",
          body: JSON.stringify({
            applicationId: application.id,
            opportunityId: application.opportunityId,
            rating,
            comment: comment.trim(),
          }),
        });
      } catch {
      }

      const newReview: ReviewItem = {
        id: `rev-${Date.now()}`,
        opportunityTitle: application.opportunityTitle,
        organisation: application.organisation,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        reviewerName: "You",
        applicationId: application.id,
      };

      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }

      setSuccessMsg(`Review for "${application.opportunityTitle}" submitted successfully! Thank you for helping improve community drives.`);
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
    <Card className={`border-sky-100 shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-slate-900">
          Leave a Review
        </CardTitle>
        <CardDescription>
          Share your feedback on completed social impact drives to help partner organisations and fellow volunteers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {eligibleApplications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/20 p-6 text-center">
            <p className="text-sm font-medium text-slate-600">
              No completed drives available to review yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Reviews can be submitted once an organisation marks your volunteer drive participation as completed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="applicationSelect" className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="flex h-11 w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2 text-sm text-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 shadow-sm disabled:opacity-60"
              >
                <option value="">Select a completed drive...</option>
                {eligibleApplications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.opportunityTitle} ({app.organisation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rating (1 to 5 Stars) *
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 text-2xl transition hover:scale-110 focus:outline-none disabled:opacity-60"
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
                <span className="ml-2 text-xs font-bold text-slate-600">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="reviewComment" className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Feedback *
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
                placeholder="Describe your volunteering experience, drive coordination, impact on beneficiaries, and suggestions for future drives..."
                className="flex w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 shadow-sm disabled:opacity-60"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {comment.trim().length} / minimum 10 characters
              </span>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-medium">
                {successMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !selectedAppId}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting Review..." : "Submit Review"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

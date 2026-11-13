"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ReviewForm } from "@/components/volunteer/review-form";
import { ReviewList } from "@/components/volunteer/review-list";
import type { Application, ReviewItem } from "@/types/volunteer";
import { api } from "@/lib/api";
import {
  Star,
  ClipboardList,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
    const timer = window.setInterval(() => {
      if (!document.hidden) void loadData();
    }, 20_000);
    window.addEventListener("focus", loadData);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", loadData);
    };
  }, []);

  async function loadData() {
    setError(null);
    try {
      const [revData, appData] = await Promise.all([
        api.request<ReviewItem[]>("/reviews/mine"),
        api.getMyApplications(),
      ]);
      setReviews(revData);
      setApplications(
        appData.map((item) => ({
          id: item.id,
          opportunityId: item.opportunity_id,
          opportunityTitle: item.opportunity_title,
          organisation: item.organisation,
          status: item.status,
          appliedAt: item.applied_at,
          updatedAt: item.applied_at,
          pitchText: item.pitch_text,
        }))
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load reviews and drive records. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  function handleReviewSubmitted(newReview: ReviewItem) {
    setReviews((prev) => [newReview, ...prev]);
  }

  const completedCount = applications.filter((app) => app.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f2a43]">
            Reviews &amp; Testimonials
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5a7b9d] leading-relaxed">
            Record transparent ratings for completed volunteer drives to maintain civic safety and logistics standards.
          </p>
        </div>
        <Link
          href="/volunteer/applications"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "self-start sm:self-auto border-[#bae6fd] text-[#0369a1] hover:bg-[#f4f9ff] text-xs font-bold gap-1.5 shadow-sm",
          })}
        >
          <ClipboardList className="h-4 w-4" />
          <span>View My Applications</span>
        </Link>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Review Submission Form & Guidelines */}
        <div className="lg:col-span-1 space-y-6">
          <ReviewForm
            completedApplications={applications}
            existingReviews={reviews}
            onReviewSubmitted={handleReviewSubmitted}
          />

          <div className="rounded-2xl border border-[#bae6fd]/80 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#0f2a43] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#0369a1]" />
              <span>Review Guidelines</span>
            </h3>
            <ul className="space-y-2 text-xs text-[#335577]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0369a1] shrink-0 mt-0.5" />
                <span>Only drives marked as completed by the host organisation are eligible for feedback.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0369a1] shrink-0 mt-0.5" />
                <span>Constructive feedback helps partner NGOs enhance volunteer safety and on-ground logistics.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0369a1] shrink-0 mt-0.5" />
                <span>Ratings contribute directly to the host organisation&apos;s verified public ledger score.</span>
              </li>
            </ul>
            <div className="pt-2 border-t border-[#f1f5f9] text-[11px] text-[#5a7b9d] flex justify-between items-center">
              <span>Eligible completed drives:</span>
              <span className="font-mono font-bold text-[#0369a1] tabular-nums">{completedCount}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Submitted Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#0f2a43] flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span>Submitted Reviews ({reviews.length})</span>
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="text-xs border-[#bae6fd] text-[#0369a1] hover:bg-[#f4f9ff] gap-1.5"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {loading && (
            <div className="flex min-h-[25vh] items-center justify-center" role="status" aria-label="Loading reviews">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0369a1] border-t-transparent" />
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-2">
              <AlertCircle className="mx-auto h-6 w-6 text-red-600" />
              <p className="text-xs font-semibold text-red-700">{error}</p>
              <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={loadData}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && <ReviewList reviews={reviews} />}
        </div>
      </div>

      {/* Civic Audit Trail Notice */}
      <div className="rounded-xl border border-[#bae6fd]/80 bg-[#f4f9ff] p-4 text-xs text-[#335577] flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#0369a1] shrink-0" />
        <span>
          Submitted testimonials are cryptographically tied to verified completion certificates and cannot be manipulated.
        </span>
      </div>
    </div>
  );
}

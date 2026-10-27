"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/volunteer/review-form";
import { ReviewList } from "@/components/volunteer/review-list";
import type { Application, ReviewItem } from "@/types/volunteer";
import { getMockApplications, getMockReviews } from "@/lib/volunteer-mock-adapter";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    setError(null);

    Promise.all([getMockReviews(), getMockApplications()])
      .then(([revData, appData]) => {
        setReviews(revData);
        setApplications(appData);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load reviews and drive records. Please retry.");
        setLoading(false);
      });
  }

  function handleReviewSubmitted(newReview: ReviewItem) {
    setReviews((prev) => [newReview, ...prev]);
  }

  const completedCount = applications.filter(
    (app) => app.status === "completed" || app.status === "selected" || app.status === "accepted"
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Reviews &amp; Testimonials
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submit ratings for completed volunteer drives and review past feedback to help organisations thrive.
          </p>
        </div>
        <Link href="/volunteer/applications">
          <Button variant="outline" className="self-start sm:self-auto gap-2">
            <span>📋</span> View My Applications
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <ReviewForm
            completedApplications={applications}
            onReviewSubmitted={handleReviewSubmitted}
          />

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-800">Review Guidelines</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Only completed or confirmed drives can receive feedback.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Constructive comments help partner NGOs improve their volunteer safety and logistics.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Ratings directly contribute to the host organisation&apos;s verified public score.</span>
              </li>
            </ul>
            <div className="pt-2 border-t border-sky-50 text-[11px] text-slate-400">
              Eligible completed drives: {completedCount}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Submitted Reviews ({reviews.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={loadData} className="text-xs text-sky-600">
              Refresh List
            </Button>
          </div>

          {loading && (
            <div className="flex min-h-[30vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-xs font-semibold text-red-700">{error}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={loadData}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && (
            <ReviewList reviews={reviews} />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Reviews Backend Integration Note:</p>
        <p className="mt-0.5">
          Reviews are submitted to the actual backend endpoint `POST /api/reviews`. Because the backend lacks a volunteer-scoped review query route (`GET /api/reviews/my`), initial review history is hydrated from the volunteer mock adapter and seamlessly appended with your live submissions during the session.
        </p>
      </div>
    </div>
  );
}

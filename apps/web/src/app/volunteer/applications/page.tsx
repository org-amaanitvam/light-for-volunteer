"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationCard } from "@/components/volunteer/application-card";
import type { Application } from "@/types/volunteer";
import { api } from "@/lib/api";

type FilterTab = "all" | "active" | "selected" | "completed" | "closed";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadApplications();
    const refreshTimer = window.setInterval(() => void loadApplications(), 20_000);
    window.addEventListener("focus", loadApplications);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", loadApplications);
    };
  }, []);

  async function loadApplications() {
    setError(null);
    try {
      const data = await api.getMyApplications();
      setApplications(data.map((item) => ({
        id: item.id,
        opportunityId: item.opportunity_id,
        opportunityTitle: item.opportunity_title,
        organisation: item.organisation,
        status: item.status,
        appliedAt: item.applied_at,
        updatedAt: item.applied_at,
        pitchText: item.pitch_text,
      })));
    } catch {
      setError("Failed to load applications. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  const counts = {
    all: applications.length,
    active: applications.filter(
      (a) => a.status === "applied" || a.status === "pending" || a.status === "shortlisted"
    ).length,
    selected: applications.filter((a) => a.status === "selected" || a.status === "accepted").length,
    completed: applications.filter((a) => a.status === "completed").length,
    closed: applications.filter((a) => a.status === "rejected" || a.status === "withdrawn").length,
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.opportunityTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.organisation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.location ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "active") {
      return app.status === "applied" || app.status === "pending" || app.status === "shortlisted";
    }
    if (activeTab === "selected") {
      return app.status === "selected" || app.status === "accepted";
    }
    if (activeTab === "completed") {
      return app.status === "completed";
    }
    if (activeTab === "closed") {
      return app.status === "rejected" || app.status === "withdrawn";
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track status updates, coordinator responses, and next steps for your volunteer drives.
          </p>
        </div>
        <Link href="/#opportunities">
          <Button className="self-start sm:self-auto gap-1.5 shadow-md shadow-sky-500/20">
            <span>+</span> Find New Opportunities
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-sky-100/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-slate-900">{counts.all}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Total Applied
            </p>
          </CardContent>
        </Card>
        <Card className="border-sky-100/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-amber-600">{counts.active}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Under Review
            </p>
          </CardContent>
        </Card>
        <Card className="border-sky-100/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-emerald-600">{counts.selected}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Confirmed
            </p>
          </CardContent>
        </Card>
        <Card className="border-sky-100/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-sky-600">{counts.completed}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-sky-100 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "all"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-slate-600 hover:text-sky-700"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "active"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-slate-600 hover:text-sky-700"
            }`}
          >
            Review ({counts.active})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("selected")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "selected"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-slate-600 hover:text-sky-700"
            }`}
          >
            Confirmed ({counts.selected})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "completed"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-slate-600 hover:text-sky-700"
            }`}
          >
            Completed ({counts.completed})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("closed")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "closed"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-slate-600 hover:text-sky-700"
            }`}
          >
            Archived ({counts.closed})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drive or NGO..."
            className="h-10 text-xs"
          />
        </div>
      </div>

      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            <p className="text-xs font-medium text-slate-500">Retrieving application history...</p>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50/40 p-6 text-center">
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <Button variant="outline" size="sm" onClick={loadApplications}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredApplications.length === 0 && (
        <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl">
            📋
          </div>
          <h3 className="text-base font-bold text-slate-900">No applications match your selection</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? "Try adjusting your search keywords or resetting your filter tabs."
              : "You haven't submitted any applications under this category yet."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
            <Link href="/#opportunities">
              <Button size="sm">Explore Drives</Button>
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && filteredApplications.length > 0 && (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 text-xs text-slate-500">
        <p>Application status refreshes from your account data each time you open this page.</p>
      </div>
    </div>
  );
}

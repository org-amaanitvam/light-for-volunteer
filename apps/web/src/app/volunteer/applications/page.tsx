"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationCard } from "@/components/volunteer/application-card";
import type { Application } from "@/types/volunteer";
import { api } from "@/lib/api";
import {
  Search,
  X,
  Plus,
  RefreshCw,
  Inbox,
  AlertCircle,
} from "lucide-react";

type FilterTab = "all" | "active" | "selected" | "completed" | "closed";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadApplications();
    const refreshTimer = window.setInterval(() => {
      if (!document.hidden) void loadApplications();
    }, 20_000);
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
      setApplications(
        data.map((item) => ({
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
    } catch {
      setError("Failed to load applications. Please check your network connection and retry.");
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f2a43]">
            My Applications
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5a7b9d] leading-relaxed">
            Monitor review milestones, host evaluations, and service assignments across all drives.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadApplications}
            disabled={loading}
            className="border-[#bae6fd] text-[#0369a1] hover:bg-[#f4f9ff] text-xs font-semibold gap-1.5"
            aria-label="Refresh applications"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Link
            href="/opportunities"
            className={buttonVariants({
              size: "sm",
              className: "bg-[#0369a1] hover:bg-[#075985] text-white text-xs font-bold gap-1.5 shadow-sm",
            })}
          >
            <Plus className="h-4 w-4" />
            <span>Explore Drives</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-[#bae6fd]/80 bg-white">
          <CardContent className="p-4 text-center">
            <p className="font-mono text-2xl font-black text-[#0f2a43] tabular-nums">{counts.all}</p>
            <p className="text-[11px] font-bold text-[#5a7b9d] uppercase tracking-wider mt-0.5">
              Total Applied
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#bae6fd]/80 bg-white">
          <CardContent className="p-4 text-center">
            <p className="font-mono text-2xl font-black text-[#0369a1] tabular-nums">{counts.active}</p>
            <p className="text-[11px] font-bold text-[#5a7b9d] uppercase tracking-wider mt-0.5">
              Under Review
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#bae6fd]/80 bg-white">
          <CardContent className="p-4 text-center">
            <p className="font-mono text-2xl font-black text-[#075985] tabular-nums">{counts.selected}</p>
            <p className="text-[11px] font-bold text-[#5a7b9d] uppercase tracking-wider mt-0.5">
              Confirmed
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#bae6fd]/80 bg-white">
          <CardContent className="p-4 text-center">
            <p className="font-mono text-2xl font-black text-[#0369a1] tabular-nums">{counts.completed}</p>
            <p className="text-[11px] font-bold text-[#5a7b9d] uppercase tracking-wider mt-0.5">
              Completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tab Pills */}
        <div
          role="tablist"
          aria-label="Filter applications by status"
          className="flex flex-wrap gap-1 rounded-xl border border-[#bae6fd]/80 bg-white p-1 shadow-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
              activeTab === "all"
                ? "bg-[#0369a1] text-white shadow-sm"
                : "text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "active"}
            onClick={() => setActiveTab("active")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
              activeTab === "active"
                ? "bg-[#0369a1] text-white shadow-sm"
                : "text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
            }`}
          >
            In Review ({counts.active})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "selected"}
            onClick={() => setActiveTab("selected")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
              activeTab === "selected"
                ? "bg-[#0369a1] text-white shadow-sm"
                : "text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
            }`}
          >
            Confirmed ({counts.selected})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "completed"}
            onClick={() => setActiveTab("completed")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
              activeTab === "completed"
                ? "bg-[#0369a1] text-white shadow-sm"
                : "text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
            }`}
          >
            Completed ({counts.completed})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "closed"}
            onClick={() => setActiveTab("closed")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
              activeTab === "closed"
                ? "bg-[#0369a1] text-white shadow-sm"
                : "text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
            }`}
          >
            Archived ({counts.closed})
          </button>
        </div>

        {/* Search Input with Clear Button */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5a7b9d]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drive or organisation…"
            className="h-10 pl-9 pr-8 text-xs border-[#bae6fd] bg-white focus-visible:ring-[#0369a1]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5a7b9d] hover:text-[#0f2a43]"
              aria-label="Clear search query"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex min-h-[35vh] items-center justify-center" role="status" aria-label="Loading applications">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0369a1] border-t-transparent" />
            <p className="text-xs font-semibold text-[#335577]">Retrieving application history…</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
          <Button variant="outline" size="sm" onClick={loadApplications} className="text-xs">
            Retry Connection
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredApplications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#bae6fd] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0369a1]">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#0f2a43]">No applications match your selection</h3>
          <p className="mt-1 text-xs text-[#5a7b9d] max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? "Try adjusting your search keywords or clearing active filters."
              : "You have not submitted applications under this status category."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="text-xs border-[#bae6fd]"
              >
                Clear Search
              </Button>
            )}
            <Link
              href="/opportunities"
              className={buttonVariants({
                size: "sm",
                className: "bg-[#0369a1] hover:bg-[#075985] text-white text-xs font-bold",
              })}
            >
              Explore Drives
            </Link>
          </div>
        </div>
      )}

      {/* Applications Cards List */}
      {!loading && !error && filteredApplications.length > 0 && (
        <div className="space-y-4" role="region" aria-label="Applications list">
          {filteredApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}

      {/* Civic Transparency Notice */}
      <div className="rounded-xl border border-[#bae6fd]/80 bg-[#f4f9ff] p-4 text-xs text-[#335577] flex items-center gap-2">
        <span className="font-semibold text-[#0369a1]">Status Policy:</span>
        <span>
          Applications update in real time as host organisations review submissions and mark milestone completions.
        </span>
      </div>
    </div>
  );
}

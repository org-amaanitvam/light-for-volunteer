"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  api, 
  ApplicationItem, 
  OpportunityItem 
} from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { 
  Plus, 
  Search, 
  X, 
  Users, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Edit3, 
  Trash2, 
  Send, 
  Lock, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Award,
  Building2,
  Check,
  ArrowRight
} from "lucide-react";

type Opportunity = {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  slots: number;
  description: string;
  status: string;
  applicantCount: number;
  selectedCount: number;
};

const CATEGORIES = [
  "Education & Literacy",
  "Environment",
  "Healthcare",
  "Community Outreach",
  "Animal Welfare",
  "Other",
];

const EMPTY_FORM = {
  title: "",
  category: "Community Outreach",
  location: "",
  date: "",
  slots: "5",
  description: "",
};

function toDashboardOpportunity(item: OpportunityItem): Opportunity {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    location: item.city || item.locationType || item.location_type || "On-site",
    date: (item.deadline || "").slice(0, 10),
    slots: item.openings || 1,
    description: item.description,
    status: item.status.toLowerCase(),
    applicantCount: item.applications_count ?? item.applicant_stats?.total ?? 0,
    selectedCount: item.applicant_stats?.selected ?? 0,
  };
}

function getTodayISO() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function OrganisationDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Drive form state
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Applicant management state
  const [activeApplicantListing, setActiveApplicantListing] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Record<string, ApplicationItem[]>>({});
  const [applicantLoading, setApplicantLoading] = useState(false);
  const [reviewedApplications, setReviewedApplications] = useState<Set<string>>(new Set());
  const [reviewRatings, setReviewRatings] = useState<Record<string, number>>({});
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [hoursModalApp, setHoursModalApp] = useState<{ id: string; oppId: string; volunteerName: string } | null>(null);
  const [verifiedHoursInput, setVerifiedHoursInput] = useState("4");
  const [todayISO] = useState("2026-11-11");

  // Filter & Search
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "organisation" && user.role !== "admin") router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || (user?.role !== "organisation" && user?.role !== "admin")) return;
    let mounted = true;
    api.getMyOpportunities()
      .then((items) => {
        if (mounted) setOpportunities(items.map(toDashboardOpportunity));
      })
      .catch((error: unknown) => {
        if (mounted) {
          setFeedbackMessage({
            type: "error",
            text: error instanceof Error ? error.message : "Could not load your organisation opportunities."
          });
        }
      })
      .finally(() => {
        if (mounted) setDataLoading(false);
      });
    return () => { mounted = false; };
  }, [authLoading, user]);

  // Operational metrics
  const totalDrives = opportunities.length;
  const liveCount = opportunities.filter((item) => item.status === "live").length;
  const pendingReviewCount = opportunities.filter((item) => item.status === "pending_review").length;
  const totalApplicants = opportunities.reduce((total, item) => total + item.applicantCount, 0);
  const totalSelected = opportunities.reduce((total, item) => total + item.selectedCount, 0);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesFilter = 
        filter === "All" || 
        (filter === "Live" && item.status === "live") ||
        (filter === "Pending Review" && item.status === "pending_review") ||
        (filter === "Draft" && item.status === "draft") ||
        (filter === "Closed" && item.status === "closed");

      return matchesSearch && matchesFilter;
    });
  }, [opportunities, search, filter]);

  async function toggleApplicants(opportunityId: string) {
    if (activeApplicantListing === opportunityId) {
      setActiveApplicantListing(null);
      return;
    }
    setActiveApplicantListing(opportunityId);
    setApplicantLoading(true);
    try {
      const [result, reviews] = await Promise.all([
        api.getOpportunityApplicants(opportunityId),
        api.request<{ applicationId?: string }[]>("/reviews/mine").catch(() => []),
      ]);
      setApplicants((previous) => ({ ...previous, [opportunityId]: result }));
      setReviewedApplications((previous) => new Set([...previous, ...reviews.map((r) => r.applicationId).filter((id): id is string => Boolean(id))]));
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not load applicants for this opportunity."
      });
    } finally {
      setApplicantLoading(false);
    }
  }

  async function handleStatusChange(applicationId: string, status: ApplicationItem["status"], opportunityId: string) {
    if (status === "completed") {
      const targetApp = applicants[opportunityId]?.find(a => a.id === applicationId);
      setHoursModalApp({
        id: applicationId,
        oppId: opportunityId,
        volunteerName: targetApp?.volunteer?.name || "the volunteer"
      });
      return;
    }

    try {
      const updated = await api.updateApplicationStatus(applicationId, status);
      setApplicants((previous) => ({
        ...previous,
        [opportunityId]: (previous[opportunityId] || []).map((item) =>
          item.id === updated.id ? { ...item, ...updated, volunteer: item.volunteer } : item
        ),
      }));
      setFeedbackMessage({
        type: "success",
        text: `Applicant status updated to ${status}.`
      });
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not update applicant status."
      });
    }
  }

  async function confirmCompletionWithHours() {
    if (!hoursModalApp) return;
    const hours = Number(verifiedHoursInput);
    if (!Number.isInteger(hours) || hours < 1 || hours > 500) {
      setFeedbackMessage({
        type: "error",
        text: "Please enter a valid whole number of hours between 1 and 500."
      });
      return;
    }

    try {
      const updated = await api.updateApplicationStatus(hoursModalApp.id, "completed", hours);
      setApplicants((previous) => ({
        ...previous,
        [hoursModalApp.oppId]: (previous[hoursModalApp.oppId] || []).map((item) =>
          item.id === updated.id ? { ...item, ...updated, volunteer: item.volunteer } : item
        ),
      }));
      setFeedbackMessage({
        type: "success",
        text: `Verified completion of ${hours} hours for ${hoursModalApp.volunteerName}. Completion certificate is now available to the volunteer.`
      });
      setHoursModalApp(null);
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to record drive completion."
      });
    }
  }

  async function submitApplicantReview(application: ApplicationItem) {
    const comment = reviewComments[application.id]?.trim() || "";
    if (comment.length < 10) {
      setFeedbackMessage({
        type: "error",
        text: "Please write at least 10 characters of constructive feedback for the volunteer."
      });
      return;
    }

    try {
      await api.request("/reviews", {
        method: "POST",
        body: JSON.stringify({
          applicationId: application.id,
          rating: reviewRatings[application.id] || 5,
          comment,
        }),
      });
      setReviewedApplications((previous) => new Set(previous).add(application.id));
      setFeedbackMessage({
        type: "success",
        text: `Your review for ${application.volunteer?.name || "the volunteer"} has been published to their ledger.`
      });
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not submit review."
      });
    }
  }

  function startCreate() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setStep(1);
    setShowForm(true);
    setFeedbackMessage(null);
  }

  function startEdit(opportunity: Opportunity) {
    setForm({
      title: opportunity.title,
      category: opportunity.category,
      location: opportunity.location,
      date: opportunity.date,
      slots: String(opportunity.slots),
      description: opportunity.description,
    });
    setEditingId(opportunity.id);
    setStep(1);
    setShowForm(true);
    setFeedbackMessage(null);
  }

  async function saveOpportunity() {
    if (!form.title.trim() || !form.category) {
      setFeedbackMessage({ type: "error", text: "Please enter a title and select a category." });
      setStep(1);
      return;
    }
    const slots = Number(form.slots);
    if (!form.location.trim() || !form.date || form.date < getTodayISO() || !Number.isInteger(slots) || slots < 1) {
      setFeedbackMessage({ type: "error", text: "Enter a valid location, upcoming date, and positive whole number of openings." });
      setStep(2);
      return;
    }
    if (!form.description.trim()) {
      setFeedbackMessage({ type: "error", text: "Please provide a description of the volunteer drive." });
      setStep(3);
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: "Volunteering",
      category: form.category,
      locationType: "On-site",
      city: form.location.trim(),
      duration: "Flexible",
      openings: slots,
      deadline: form.date,
    };

    try {
      if (editingId) {
        const updated = await api.updateOpportunity(editingId, payload);
        setOpportunities((previous) =>
          previous.map((item) => (item.id === editingId ? toDashboardOpportunity(updated) : item))
        );
        setFeedbackMessage({ type: "success", text: "Opportunity updated successfully." });
      } else {
        const created = await api.createOpportunity(payload);
        setOpportunities((previous) => [toDashboardOpportunity(created), ...previous]);
        setFeedbackMessage({ 
          type: "success", 
          text: "Opportunity drafted. You can now submit it for admin verification." 
        });
      }
      setShowForm(false);
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save opportunity."
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleOpportunityAction(id: string, action: "submit" | "close" | "reopen" | "delete") {
    try {
      if (action === "submit") {
        const updated = await api.submitOpportunityForReview(id);
        setOpportunities((prev) => prev.map((o) => (o.id === id ? toDashboardOpportunity(updated) : o)));
        setFeedbackMessage({ type: "success", text: "Opportunity submitted for Amaanitvam admin verification." });
      } else if (action === "close") {
        const updated = await api.closeOpportunity(id);
        setOpportunities((prev) => prev.map((o) => (o.id === id ? toDashboardOpportunity(updated) : o)));
        setFeedbackMessage({ type: "info", text: "Opportunity has been marked closed." });
      } else if (action === "reopen") {
        const updated = await api.reopenOpportunity(id);
        setOpportunities((prev) => prev.map((o) => (o.id === id ? toDashboardOpportunity(updated) : o)));
        setFeedbackMessage({ type: "success", text: "Opportunity reopened and pending review." });
      } else if (action === "delete") {
        if (!window.confirm("Are you sure you want to delete this opportunity? This action cannot be undone.")) return;
        await api.deleteOpportunity(id);
        setOpportunities((prev) => prev.filter((o) => o.id !== id));
        setFeedbackMessage({ type: "info", text: "Opportunity removed from your ledger." });
      }
    } catch (error) {
      setFeedbackMessage({
        type: "error",
        text: error instanceof Error ? error.message : `Failed to execute ${action}.`
      });
    }
  }

  function renderStatusPill(status: string) {
    switch (status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600 animate-pulse" />
            Live / Active
          </span>
        );
      case "pending_review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <Clock className="h-3 w-3 text-amber-600" />
            Pending Verification
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            <FileText className="h-3 w-3 text-slate-500" />
            Draft
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            <Lock className="h-3 w-3 text-slate-400" />
            Closed
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 uppercase">
            {status}
          </span>
        );
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Feedback Alert */}
      {feedbackMessage && (
        <div 
          role="status"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium shadow-xs transition-all ${
            feedbackMessage.type === "success" 
              ? "border-sky-200 bg-sky-50 text-sky-900" 
              : feedbackMessage.type === "error"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-slate-200 bg-slate-100 text-slate-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" && <CheckCircle2 className="h-4 w-4 text-sky-700 shrink-0" />}
            {feedbackMessage.type === "error" && <AlertCircle className="h-4 w-4 text-red-700 shrink-0" />}
            {feedbackMessage.type === "info" && <Clock className="h-4 w-4 text-slate-700 shrink-0" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFeedbackMessage(null)}
            className="text-xs underline hover:no-underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Architectural Civic Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-sky-900/40 bg-gradient-to-br from-[#0C4A6E] via-[#075985] to-[#0284C7] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-950/40 px-3 py-1 text-xs font-medium tracking-wide text-sky-200 backdrop-blur-xs">
              <Building2 className="h-3.5 w-3.5 text-sky-300" />
              <span>Organisation Operations Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Civic Drives & Volunteer Engagement Ledger
            </h1>
            <p className="text-sm sm:text-base text-sky-100 leading-relaxed">
              Publish community drives, review prospective volunteers, track active participation, and issue verified completion records under Amaanitvam Foundation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#075985] shadow-sm hover:bg-sky-50 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4 text-[#075985]" />
              Host New Civic Drive
            </button>
          </div>
        </div>

        {/* Civic Ledger Architectural Grid Decor */}
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"
        />
      </section>

      {/* 4 Operational Metric Cards */}
      <section aria-label="Operational Key Metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Drives</span>
            <FileText className="h-4 w-4 text-sky-700" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {totalDrives}
          </p>
          <p className="mt-1 text-xs text-slate-500">Hosted on civic platform</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Live Drives</span>
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-sky-900 tabular-nums">
            {liveCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">{pendingReviewCount} pending verification</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Volunteer Applicants</span>
            <Users className="h-4 w-4 text-sky-700" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {totalApplicants}
          </p>
          <p className="mt-1 text-xs text-slate-500">Pitches submitted</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Selected / Completed</span>
            <Award className="h-4 w-4 text-sky-700" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-sky-800 tabular-nums">
            {totalSelected}
          </p>
          <p className="mt-1 text-xs text-slate-500">Volunteers deployed & verified</p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {["All", "Live", "Pending Review", "Draft", "Closed"].map((tab) => {
            const count = 
              tab === "All" ? opportunities.length :
              tab === "Live" ? liveCount :
              tab === "Pending Review" ? pendingReviewCount :
              tab === "Draft" ? opportunities.filter(o => o.status === "draft").length :
              opportunities.filter(o => o.status === "closed").length;
            const isSelected = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border border-sky-300 bg-sky-50 text-sky-900 font-semibold shadow-2xs"
                    : "border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{tab}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? "bg-sky-200 text-sky-900" : "bg-slate-200 text-slate-700"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drives by title, city..."
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* Opportunities Ledger List */}
      <section aria-label="Organisations Opportunities Ledger" className="space-y-4">
        {dataLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            <Clock className="mx-auto h-8 w-8 text-sky-600 animate-spin" />
            <p className="mt-3 text-sm font-medium">Loading organisation drives from civic ledger...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <FileText className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-base font-bold text-slate-900">No opportunities found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {search || filter !== "All"
                ? "No drives match your current filter or query criteria."
                : "You have not published any volunteer drives yet. Create your first civic initiative to mobilize volunteers."}
            </p>
            <button
              type="button"
              onClick={startCreate}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Host New Drive
            </button>
          </div>
        ) : (
          filteredOpportunities.map((opportunity) => {
            const isApplicantsOpen = activeApplicantListing === opportunity.id;
            const oppApplicants = applicants[opportunity.id] || [];

            return (
              <div 
                key={opportunity.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* Opportunity Header Row */}
                <div className="p-5 sm:p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderStatusPill(opportunity.status)}
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {opportunity.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {opportunity.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Target Date: {opportunity.date || "Ongoing"}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {opportunity.title}
                    </h2>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {opportunity.description}
                    </p>
                  </div>

                  {/* Actions & Applicant Counter */}
                  <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end lg:gap-3 shrink-0 pt-2 lg:pt-0 border-t border-slate-100 lg:border-t-0">
                    <button
                      type="button"
                      onClick={() => toggleApplicants(opportunity.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isApplicantsOpen 
                          ? "bg-sky-100 text-sky-900 border border-sky-300"
                          : "bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100"
                      }`}
                    >
                      <Users className="h-3.5 w-3.5 text-sky-700" />
                      <span>{opportunity.applicantCount} Applicants</span>
                      {isApplicantsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {opportunity.status === "draft" && (
                        <button
                          type="button"
                          onClick={() => handleOpportunityAction(opportunity.id, "submit")}
                          className="inline-flex items-center gap-1 rounded-md bg-sky-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-800 cursor-pointer"
                          title="Submit to Amaanitvam for verification"
                        >
                          <Send className="h-3 w-3" />
                          Submit Review
                        </button>
                      )}

                      {opportunity.status === "live" && (
                        <button
                          type="button"
                          onClick={() => handleOpportunityAction(opportunity.id, "close")}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                          title="Close drive to new applications"
                        >
                          <Lock className="h-3 w-3 text-slate-500" />
                          Close Drive
                        </button>
                      )}

                      {opportunity.status === "closed" && (
                        <button
                          type="button"
                          onClick={() => handleOpportunityAction(opportunity.id, "reopen")}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                          title="Reopen closed drive"
                        >
                          <RotateCcw className="h-3 w-3 text-slate-500" />
                          Reopen
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => startEdit(opportunity)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
                        title="Edit opportunity parameters"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpportunityAction(opportunity.id, "delete")}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        title="Delete opportunity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Applicant Dossier Drawer */}
                {isApplicantsOpen && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-sky-700" />
                        <h3 className="text-sm font-bold text-slate-900">
                          Applicant Roster ({oppApplicants.length} Registered)
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500">
                        {opportunity.slots} Total Volunteer Slots Planned
                      </span>
                    </div>

                    {applicantLoading ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        <Clock className="mx-auto h-5 w-5 text-sky-600 animate-spin" />
                        <p className="mt-2">Loading applicant dossiers...</p>
                      </div>
                    ) : oppApplicants.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
                        No volunteer applications received for this drive yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {oppApplicants.map((app) => {
                          const isReviewed = reviewedApplications.has(app.id);
                          return (
                            <div 
                              key={app.id}
                              className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">
                                      {app.volunteer?.name || "Anonymous Volunteer"}
                                    </span>
                                    <span className="text-xs text-slate-400">({app.volunteer?.email})</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    {app.volunteer?.city && <span>📍 {app.volunteer.city}</span>}
                                    <span>• Applied: {(app.applied_at || "").slice(0, 10)}</span>
                                    {app.completed_hours ? (
                                      <span className="font-semibold text-sky-700">
                                        • Verified Hours: {app.completed_hours}h
                                      </span>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    app.status === "completed" ? "bg-sky-100 text-sky-900 border border-sky-300" :
                                    app.status === "selected" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                                    app.status === "shortlisted" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                                    app.status === "rejected" ? "bg-red-50 text-red-800 border border-red-200" :
                                    "bg-slate-100 text-slate-700"
                                  }`}>
                                    Status: {app.status}
                                  </span>

                                  {/* Status Machine Triggers */}
                                  {app.status === "applied" && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(app.id, "shortlisted", opportunity.id)}
                                        className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
                                      >
                                        Shortlist
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(app.id, "selected", opportunity.id)}
                                        className="rounded-md border border-sky-300 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800 hover:bg-sky-100"
                                      >
                                        Select
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(app.id, "rejected", opportunity.id)}
                                        className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {app.status === "shortlisted" && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(app.id, "selected", opportunity.id)}
                                        className="rounded-md border border-sky-300 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800 hover:bg-sky-100"
                                      >
                                        Select Volunteer
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(app.id, "rejected", opportunity.id)}
                                        className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {app.status === "selected" && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(app.id, "completed", opportunity.id)}
                                        className="rounded-md bg-sky-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-sky-800"
                                      >
                                        Verify Completion
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(app.id, "rejected", opportunity.id)}
                                        className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                      >
                                        Mark No-Show
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Volunteer Pitch Text */}
                              {app.pitch_text && (
                                <div className="rounded-md bg-slate-50 border border-slate-100 p-2.5 text-xs text-slate-700">
                                  <span className="font-semibold text-slate-800">Volunteer Pitch: </span>
                                  <span className="italic">&ldquo;{app.pitch_text}&rdquo;</span>
                                </div>
                              )}

                              {/* Review Section for Completed Applications */}
                              {app.status === "completed" && (
                                <div className="mt-2 border-t border-slate-100 pt-2 text-xs">
                                  {isReviewed ? (
                                    <span className="inline-flex items-center gap-1 font-semibold text-sky-700">
                                      <Check className="h-3 w-3" />
                                      You have submitted verified feedback for this volunteer.
                                    </span>
                                  ) : (
                                    <div className="space-y-2 bg-sky-50/40 rounded-lg p-3 border border-sky-100">
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-800">
                                          Leave Volunteer Testimonial & Rating:
                                        </span>
                                        <div className="flex items-center gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              type="button"
                                              onClick={() => setReviewRatings(prev => ({ ...prev, [app.id]: star }))}
                                              className="p-0.5 text-amber-500 hover:scale-110 transition-transform"
                                            >
                                              <Star className={`h-3.5 w-3.5 ${
                                                (reviewRatings[app.id] || 5) >= star ? "fill-amber-400" : "text-slate-300"
                                              }`} />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <textarea
                                        rows={2}
                                        value={reviewComments[app.id] || ""}
                                        onChange={(e) => setReviewComments(prev => ({ ...prev, [app.id]: e.target.value }))}
                                        placeholder="Write constructive civic feedback (min 10 characters)..."
                                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
                                      />
                                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                                        <span>{(reviewComments[app.id] || "").length}/10 chars minimum</span>
                                        <button
                                          type="button"
                                          onClick={() => submitApplicantReview(app)}
                                          className="rounded-md bg-sky-700 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-800"
                                        >
                                          Publish Review
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Multi-Step Opportunity Creation / Editing Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? "Update Civic Opportunity" : "Create Civic Opportunity"}
                </h3>
                <p className="text-xs text-slate-500">
                  Step {step} of 3: {step === 1 ? "Mission Scope" : step === 2 ? "Logistics & Capacity" : "Mission Description"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Opportunity Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Weekend Clean Water Distribution Drive"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-sky-600 focus:outline-hidden"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Location / City *
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Pune, Maharashtra (or Remote)"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-sky-600 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Target Date / Deadline *
                      </label>
                      <input
                        type="date"
                        min={todayISO || undefined}
                        value={form.date}
                        onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-sky-600 focus:outline-hidden"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Volunteer Openings *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={form.slots}
                        onChange={(e) => setForm(prev => ({ ...prev, slots: e.target.value }))}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-sky-600 focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Mission Description & Volunteer Responsibilities *
                    </label>
                    <textarea
                      rows={5}
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what volunteers will do, required skills, and impact..."
                      className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-sky-600 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Back
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && (!form.title.trim() || !form.category)) {
                        setFeedbackMessage({ type: "error", text: "Please enter a title." });
                        return;
                      }
                      if (step === 2 && (!form.location.trim() || !form.date || Number(form.slots) < 1)) {
                        setFeedbackMessage({ type: "error", text: "Enter location, upcoming date, and openings." });
                        return;
                      }
                      setStep(prev => prev + 1);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-800 cursor-pointer"
                  >
                    Continue
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveOpportunity}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Saving..." : editingId ? "Save Changes" : "Draft Drive"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verified Hours Completion Modal */}
      {hoursModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Verify Volunteer Hours
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Record verified hours for <strong className="text-slate-800">{hoursModalApp.volunteerName}</strong>. This will issue their official completion certificate and credit their civic ledger.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Verified Hours (1 - 500)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={verifiedHoursInput}
                onChange={(e) => setVerifiedHoursInput(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-sm font-semibold text-slate-900 focus:border-sky-600 focus:outline-hidden"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setHoursModalApp(null)}
                className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCompletionWithHours}
                className="rounded-lg bg-sky-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-800"
              >
                Verify & Issue Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

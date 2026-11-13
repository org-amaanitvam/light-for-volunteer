"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  api, 
  OpportunityItem 
} from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { 
  ShieldCheck, 
  Building2, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  LayoutDashboard, 
  ArrowRight,
  Info,
  Check,
  X
} from "lucide-react";

type OrganisationStatus = "Pending" | "Verified" | "Rejected";
type ListingStatus = "Pending" | "Approved" | "Rejected";
type ReportStatus = "Pending" | "Dismissed" | "Removed";

type Organisation = {
  id: string;
  name: string;
  email: string;
  location: string;
  category: string;
  submitted: string;
  status: OrganisationStatus;
  verificationDocUrl: string | null;
};

type Listing = {
  id: string;
  title: string;
  organisation: string;
  category: string;
  location: string;
  submitted: string;
  status: ListingStatus;
  description: string;
};

type ReportedReview = {
  id: string;
  organisation: string;
  reviewer: string;
  rating: number;
  comment: string;
  reason: string;
  submitted: string;
  status: ReportStatus;
};

type AuditLogItem = { 
  id: string; 
  action: string; 
  entityType: string; 
  entityId: string | null; 
  createdAt: string; 
  admin: { name: string; email: string } | null 
};

type Tab = "organisations" | "listings" | "reports" | "audit";

function toAdminListing(item: OpportunityItem): Listing {
  return {
    id: item.id,
    title: item.title,
    organisation: item.organisation?.org_name || "Organisation",
    category: item.category,
    location: item.city || item.locationType || item.location_type || "On-site",
    submitted: (item.created_at || "").slice(0, 10),
    status: "Pending",
    description: item.description,
  };
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const isPlatformAdmin = user?.role === "admin";
  const isOrganisation = user?.role === "organisation";

  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<ReportedReview[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>("organisations");
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !isPlatformAdmin) return;

    let active = true;
    Promise.all([
      api.getPendingOrganisations().catch(() => []),
      api.getPendingOpportunities().catch(() => []),
      api.getPendingReports().catch(() => []),
      api.getAdminAuditLogs().catch(() => ({ data: [], meta: { total: 0 } })),
    ])
      .then(([orgItems, opportunityItems, reportItems, audit]) => {
        if (!active) return;
        setOrganisations(
          orgItems.map((item) => ({
            id: item.id,
            name: item.org_name,
            email: item.user?.email || "",
            location: item.user?.city || "",
            category: item.registration_type || "Organisation",
            submitted: "",
            status: "Pending",
            verificationDocUrl: item.verification_doc_url,
          }))
        );
        setListings(opportunityItems.map(toAdminListing));
        setReports(
          reportItems.map((item) => ({
            id: item.id,
            organisation: `${item.target_type} ${item.target_id.slice(0, 8)}`,
            reviewer: item.reporter?.name || "Account holder",
            rating: 0,
            comment: `Reported ${item.target_type} content`,
            reason: item.reason,
            submitted: item.created_at.slice(0, 10),
            status: "Pending",
          }))
        );
        setAuditLogs(audit.data);
      })
      .catch((error: unknown) => {
        if (active) {
          setFeedback({
            type: "error",
            text: error instanceof Error ? error.message : "Could not load administrative console data."
          });
        }
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });

    return () => { active = false; };
  }, [authLoading, isPlatformAdmin]);

  // Admin Verification Actions
  async function handleVerifyOrg(id: string, decision: "verified" | "rejected") {
    try {
      await api.reviewOrganisation(id, decision);
      setOrganisations((prev) => prev.filter((o) => o.id !== id));
      setFeedback({
        type: "success",
        text: `Organisation registration marked ${decision}. Notification issued to organisation lead.`
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : `Failed to ${decision} organisation.`
      });
    }
  }

  async function handleReviewListing(id: string, decision: "approved" | "rejected") {
    try {
      await api.reviewOpportunity(id, decision);
      setListings((prev) => prev.filter((l) => l.id !== id));
      setFeedback({
        type: "success",
        text: `Opportunity listing has been ${decision}.`
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : `Failed to ${decision} opportunity.`
      });
    }
  }

  async function handleResolveReport(id: string, action: "dismiss" | "remove") {
    try {
      await api.resolveReport(id, action === "dismiss" ? "dismiss_report" : "remove_content");
      setReports((prev) => prev.filter((r) => r.id !== id));
      setFeedback({
        type: "success",
        text: `Report ${action === "dismiss" ? "dismissed" : "resolved and content removed"}.`
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to resolve report."
      });
    }
  }

  async function openVerificationDoc(docKey: string) {
    try {
      const downloadUrl = await api.getStorageDownloadUrl(docKey);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Could not generate secure verification document link."
      });
    }
  }

  // Non-Admin Organisation Lead View (Role-Protected Architectural Notice)
  if (!isPlatformAdmin && isOrganisation) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-2xl border border-sky-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-800">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                Organisation Administrator Scope
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Administrative Permissions & Civic Boundaries
              </h1>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
            <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-950">Platform Governance Separation:</strong>{" "}
              You are authenticated with the <strong className="font-mono">organisation</strong> role. 
              Platform-wide verification of other civic organisations, global listing approvals, and trust audit logs are restricted to Amaanitvam Foundation Trust Platform Administrators.
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Your Permitted Administrative Controls
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Drive & Opportunity Operations</h3>
                  <LayoutDashboard className="h-4 w-4 text-sky-700" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Publish, edit, close, and reopen volunteer opportunities hosted by your organisation. Review applicant pitches, shortlist candidates, and verify volunteer hours.
                </p>
                <Link
                  href="/organisation/dashboard"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 pt-1"
                >
                  Go to Drives & Operations
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Legal Identity & Verification</h3>
                  <Building2 className="h-4 w-4 text-sky-700" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manage your organisation profile, contact information, official website, and upload PDF verification documentation for Foundation review.
                </p>
                <Link
                  href="/organisation/profile"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 pt-1"
                >
                  Go to Organisation Dossier
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Enforced by NestJS RolesGuard & Server-Side Security Policies</span>
            <span className="font-mono text-[11px] text-slate-400">UUID: {user?.id}</span>
          </div>
        </div>
      </div>
    );
  }

  // Non-privileged volunteer / public view
  if (!isPlatformAdmin && !isOrganisation) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <Lock className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-900">Restricted Civic Area</h2>
        <p className="text-xs text-slate-500">
          This portal requires Organisation Lead or Platform Administrator authentication.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Full Platform Administrator Console (user.role === 'admin')
  // -------------------------------------------------------------
  const pendingOrgCount = organisations.length;
  const pendingListingCount = listings.length;
  const pendingReportCount = reports.length;
  const auditEventCount = auditLogs.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Feedback Banner */}
      {feedback && (
        <div 
          role="status"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium shadow-2xs ${
            feedback.type === "success" 
              ? "border-sky-200 bg-sky-50 text-sky-900" 
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4 text-sky-700" /> : <XCircle className="h-4 w-4 text-red-700" />}
            <span>{feedback.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFeedback(null)} 
            className="text-xs underline hover:no-underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Architectural Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-sky-950/40 bg-gradient-to-br from-[#0C4A6E] via-[#075985] to-[#0284C7] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-950/50 px-3 py-1 text-xs font-medium text-sky-200 backdrop-blur-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
            <span>Amaanitvam Foundation Platform Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Civic Trust, Verification & Governance Console
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
            Verify newly registered non-profits, review community opportunity submissions, resolve content reports, and inspect the platform-wide immutable civic audit ledger.
          </p>
        </div>
      </section>

      {/* 4 Platform Governance Metric Cards */}
      <section aria-label="Governance Metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending NGOs</span>
            <Building2 className="h-4 w-4 text-sky-700" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {pendingOrgCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Registrations awaiting verification</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Drives</span>
            <FileText className="h-4 w-4 text-sky-700" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {pendingListingCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Submitted for review</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Content Reports</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {pendingReportCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Community flags to moderate</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Audit Logs</span>
            <ShieldCheck className="h-4 w-4 text-sky-700" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-sky-900 tabular-nums">
            {auditEventCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Recorded admin actions</p>
        </div>
      </section>

      {/* Management Navigation Tabs */}
      <section className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "organisations", label: "Organisation Verification", count: pendingOrgCount },
            { id: "listings", label: "Opportunity Reviews", count: pendingListingCount },
            { id: "reports", label: "Content Reports", count: pendingReportCount },
            { id: "audit", label: "Civic Audit Trail", count: auditEventCount },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected 
                    ? "border border-sky-300 bg-sky-50 text-sky-900 shadow-2xs" 
                    : "border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? "bg-sky-200 text-sky-900" : "bg-slate-200 text-slate-700"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Console Tab Content */}
      <div className="space-y-4">
        {dataLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
            <Clock className="mx-auto h-6 w-6 text-sky-600 animate-spin" />
            <p className="mt-2">Loading administrative governance data...</p>
          </div>
        ) : (
          <>
            {/* Tab 1: Organisation Verification */}
            {activeTab === "organisations" && (
              <div className="space-y-4">
                {organisations.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-sky-600" />
                    <p className="mt-2 font-semibold text-slate-900">All organisation registrations are verified</p>
                    <p className="mt-1 text-slate-500">No pending verification documents requiring administrative inspection.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-600">
                        <tr>
                          <th className="p-4">Organisation Name</th>
                          <th className="p-4">Registration Type</th>
                          <th className="p-4">Contact</th>
                          <th className="p-4">Documentation</th>
                          <th className="p-4 text-right">Verification Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {organisations.map((org) => (
                          <tr key={org.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-900">{org.name}</td>
                            <td className="p-4">{org.category}</td>
                            <td className="p-4">
                              <div>{org.email}</div>
                              {org.location && <div className="text-slate-400 text-[11px]">{org.location}</div>}
                            </td>
                            <td className="p-4">
                              {org.verificationDocUrl ? (
                                <button
                                  type="button"
                                  onClick={() => openVerificationDoc(org.verificationDocUrl!)}
                                  className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  Inspect PDF
                                </button>
                              ) : (
                                <span className="text-slate-400 italic">No document attached</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleVerifyOrg(org.id, "verified")}
                                  className="inline-flex items-center gap-1 rounded-md bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-800"
                                >
                                  <Check className="h-3 w-3" />
                                  Verify
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVerifyOrg(org.id, "rejected")}
                                  className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                >
                                  <X className="h-3 w-3" />
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Opportunity Reviews */}
            {activeTab === "listings" && (
              <div className="space-y-4">
                {listings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-sky-600" />
                    <p className="mt-2 font-semibold text-slate-900">Zero pending opportunity reviews</p>
                    <p className="mt-1 text-slate-500">All submitted civic drives have been reviewed.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {listings.map((listing) => (
                      <div key={listing.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold text-sky-800">{listing.organisation}</span>
                          <span>Submitted: {listing.submitted}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{listing.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-3">{listing.description}</p>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
                            {listing.category} • {listing.location}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleReviewListing(listing.id, "approved")}
                              className="rounded-md bg-sky-700 px-2.5 py-1 font-semibold text-white hover:bg-sky-800"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewListing(listing.id, "rejected")}
                              className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 font-semibold text-red-700 hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Content Moderation Reports */}
            {activeTab === "reports" && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-sky-600" />
                    <p className="mt-2 font-semibold text-slate-900">Zero active moderation reports</p>
                    <p className="mt-1 text-slate-500">The civic community ledger is free of pending flags.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">Reported Content: {report.organisation}</span>
                          <span className="text-slate-500">Filed by: {report.reviewer} on {report.submitted}</span>
                        </div>
                        <p className="rounded-md bg-slate-50 p-2.5 text-xs text-slate-700 italic border border-slate-100">
                          Reason: &ldquo;{report.reason}&rdquo;
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => handleResolveReport(report.id, "dismiss")}
                            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Dismiss Report
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveReport(report.id, "remove")}
                            className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Remove Content
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Civic Audit Trail */}
            {activeTab === "audit" && (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="p-4">Action</th>
                      <th className="p-4">Target Entity</th>
                      <th className="p-4">Admin Email</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                          No audit trail events recorded in the current window.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 font-mono text-[11px]">
                          <td className="p-4 font-bold text-slate-900">{log.action}</td>
                          <td className="p-4">{log.entityType} ({log.entityId?.slice(0, 8) || "N/A"})</td>
                          <td className="p-4">{log.admin?.email || "System"}</td>
                          <td className="p-4 text-slate-500">{log.createdAt.slice(0, 19).replace("T", " ")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

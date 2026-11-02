
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, OpportunityItem } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

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

type Tab = "organisations" | "listings" | "reports";

function toAdminListing(item: OpportunityItem): Listing {
  return {
    id: item.id,
    title: item.title,
    organisation: item.organisation?.org_name || "Organisation",
    category: item.category,
    location: item.city || item.locationType || item.location_type || "Remote",
    submitted: (item.created_at || "").slice(0, 10),
    status: "Pending",
    description: item.description,
  };
}

const tabs: { id: Tab; label: string }[] = [
  { id: "organisations", label: "Organisation Verification" },
  { id: "listings", label: "Opportunity Reviews" },
  { id: "reports", label: "Reported Reviews" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800",
    Verified: "bg-green-100 text-green-800",
    Approved: "bg-green-100 text-green-800",
    Dismissed: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Removed: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<ReportedReview[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("organisations");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [selectedListing, setSelectedListing] =
    useState<Listing | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || user?.role !== "admin") return;
    Promise.all([api.getPendingOrganisations(), api.getPendingOpportunities(), api.getPendingReports()])
      .then(([orgItems, opportunityItems, reportItems]) => {
        setOrganisations(orgItems.map((item) => ({ id: item.id, name: item.org_name, email: item.user?.email || "", location: item.user?.city || "", category: item.registration_type || "Organisation", submitted: "", status: "Pending", verificationDocUrl: item.verification_doc_url })));
        setListings(opportunityItems.map(toAdminListing));
        setReports(reportItems.map((item) => ({ id: item.id, organisation: `${item.target_type} ${item.target_id.slice(0, 8)}`, reviewer: item.reporter?.name || "Account holder", rating: 0, comment: `Reported ${item.target_type} content`, reason: item.reason, submitted: item.created_at.slice(0, 10), status: "Pending" })));
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not load pending opportunities."));
  }, [authLoading, user]);

  const pendingOrganisations = organisations.filter(
    (item) => item.status === "Pending"
  ).length;

  const pendingListings = listings.filter(
    (item) => item.status === "Pending"
  ).length;

  const pendingReports = reports.filter(
    (item) => item.status === "Pending"
  ).length;

  const filteredOrganisations = useMemo(
    () =>
      organisations.filter((item) => {
        const query = search.toLowerCase();

        const matchesSearch =
          item.name.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [organisations, search, statusFilter]
  );

  const filteredListings = useMemo(
    () =>
      listings.filter((item) => {
        const query = search.toLowerCase();

        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.organisation.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [listings, search, statusFilter]
  );

  const filteredReports = useMemo(
    () =>
      reports.filter((item) => {
        const query = search.toLowerCase();

        const matchesSearch =
          item.organisation.toLowerCase().includes(query) ||
          item.reviewer.toLowerCase().includes(query) ||
          item.reason.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [reports, search, statusFilter]
  );

  function changeTab(tab: Tab) {
    setActiveTab(tab);
    setSearch("");
    setStatusFilter("All");
    setMessage("");
    setSelectedListing(null);
  }

  async function updateOrganisation(id: string, status: OrganisationStatus) {
    const organisation = organisations.find((item) => item.id === id);
    if (status === "Pending") return;
    try {
      await api.reviewOrganisation(id, status.toLowerCase() as "verified" | "rejected");
      setOrganisations((previous) => previous.filter((item) => item.id !== id));
      setMessage(organisation ? `${organisation.name} marked as ${status.toLowerCase()}.` : "Organisation updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update organisation verification.");
    }
  }

  async function openVerificationDocument(key: string) {
    const documentWindow = window.open("about:blank", "_blank");
    if (!documentWindow) {
      setMessage("Allow pop-ups to view the verification document.");
      return;
    }
    try {
      const url = key.startsWith("https://") ? key : await api.getStorageDownloadUrl(key);
      documentWindow.opener = null;
      documentWindow.location.href = url;
    } catch (error) {
      documentWindow.close();
      setMessage(error instanceof Error ? error.message : "Could not open the verification document.");
    }
  }

  async function updateListing(id: string, status: ListingStatus) {
    const listing = listings.find((item) => item.id === id);
    try {
      await api.reviewOpportunity(id, status === "Approved" ? "approved" : "rejected");
      setListings((previous) => previous.map((item) => item.id === id ? { ...item, status } : item));
      setSelectedListing(null);
      setMessage(listing
        ? status === "Approved"
          ? `"${listing.title}" approved and published for volunteers.`
          : `"${listing.title}" rejected.`
        : "Opportunity updated.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Could not review the opportunity.");
    }
  }

  async function updateReport(id: string, status: ReportStatus) {
    if (status === "Pending") return;
    try {
      await api.resolveReport(id, status === "Dismissed" ? "dismiss_report" : "remove_content");
      setReports((previous) => previous.filter((item) => item.id !== id));
      setMessage(status === "Dismissed" ? "Report dismissed. The reported content remains." : "Report resolved and reported content removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not resolve report.");
    }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
  }

  if (authLoading || !user || user.role !== "admin") return null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">
              Platform Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Admin Console
            </h1>
            <p className="mt-2 text-slate-500">
              Review organisations, moderate opportunities and manage reports.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              A
            </div>
            <div>
              <p className="font-semibold">Administrator</p>
              <p className="text-xs text-slate-500">Demo admin session</p>
            </div>
          </div>
        </header>

        {message && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900"
          >
            <p>{message}</p>
            <button
              onClick={() => setMessage("")}
              className="font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Awaiting Organisations"
            value={organisations.length}
            description="Returned from the verification queue"
          />
          <StatCard
            label="Pending Verification"
            value={pendingOrganisations}
            description="Require verification review"
          />
          <StatCard
            label="Pending Opportunities"
            value={pendingListings}
            description="Require listing approval"
          />
          <StatCard
            label="Open Reports"
            value={pendingReports}
            description="Reported reviews to investigate"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid gap-2 md:grid-cols-3">
            {tabs.map((tab) => {
              const count =
                tab.id === "organisations"
                  ? pendingOrganisations
                  : tab.id === "listings"
                    ? pendingListings
                    : pendingReports;

              return (
                <button
                  key={tab.id}
                  onClick={() => changeTab(tab.id)}
                  className={`flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-indigo-700 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {activeTab === "organisations"
                  ? "Organisation Verification Queue"
                  : activeTab === "listings"
                    ? "Opportunity Review Queue"
                    : "Reported Reviews"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {activeTab === "organisations"
                  ? "Check organisation details before approving verification."
                  : activeTab === "listings"
                    ? "Review opportunity details before publishing."
                    : "Investigate reports and decide whether to dismiss or remove a review."}
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="self-start rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-white sm:self-auto"
            >
              Clear filters
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                activeTab === "organisations"
                  ? "Search organisation, email or location..."
                  : activeTab === "listings"
                    ? "Search opportunity or organisation..."
                    : "Search reviewer, organisation or reason..."
              }
              aria-label="Search moderation records"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-600"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              <option value="All">All statuses</option>
              {(
                activeTab === "organisations"
                  ? ["Pending", "Verified", "Rejected"]
                  : activeTab === "listings"
                    ? ["Pending", "Approved", "Rejected"]
                    : ["Pending", "Dismissed", "Removed"]
              ).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {activeTab === "organisations" && (
            <div className="space-y-4">
              {filteredOrganisations.map((organisation) => (
                <article
                  key={organisation.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-700">
                        {organisation.name.charAt(0)}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">
                            {organisation.name}
                          </h3>
                          <StatusBadge status={organisation.status} />
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {organisation.email || "Contact details are not included in the verification queue."}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {organisation.location || "Location not provided"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-lg bg-slate-100 px-3 py-1.5">
                            {organisation.category}
                          </span>
                          <span className="rounded-lg bg-slate-100 px-3 py-1.5">
                            Submitted: {organisation.submitted}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {organisation.verificationDocUrl && <button onClick={() => void openVerificationDocument(organisation.verificationDocUrl!)} className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">View verification PDF</button>}
                      {organisation.status !== "Verified" && (
                        <button
                          onClick={() =>
                            updateOrganisation(organisation.id, "Verified")
                          }
                          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                        >
                          Verify
                        </button>
                      )}

                      {organisation.status !== "Rejected" && (
                        <button
                          onClick={() =>
                            updateOrganisation(organisation.id, "Rejected")
                          }
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      )}

                    </div>
                  </div>
                </article>
              ))}

              {filteredOrganisations.length === 0 && (
                <EmptyState message="No organisations match your search or status filter." />
              )}
            </div>
          )}

          {activeTab === "listings" && (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">{listing.title}</h3>
                        <StatusBadge status={listing.status} />
                      </div>
                      <p className="mt-2 text-sm font-medium text-indigo-700">
                        {listing.organisation}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {listing.category} · {listing.location} · Submitted {listing.submitted}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {listing.description}
                      </p>

                      <button
                        onClick={() =>
                          setSelectedListing(
                            selectedListing?.id === listing.id ? null : listing
                          )
                        }
                        className="mt-3 text-sm font-semibold text-indigo-700 underline"
                      >
                        {selectedListing?.id === listing.id
                          ? "Hide review details"
                          : "View review details"}
                      </button>

                      {selectedListing?.id === listing.id && (
                        <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm">
                          <p><strong>Listing ID:</strong> {listing.id}</p>
                          <p className="mt-2">
                            <strong>Category:</strong> {listing.category}
                          </p>
                          <p className="mt-2">
                            <strong>Location:</strong> {listing.location}
                          </p>
                          <p className="mt-2">
                            <strong>Description:</strong> {listing.description}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {listing.status !== "Approved" && (
                        <button
                          onClick={() => updateListing(listing.id, "Approved")}
                          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                        >
                          Approve
                        </button>
                      )}

                      {listing.status !== "Rejected" && (
                        <button
                          onClick={() => updateListing(listing.id, "Rejected")}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      )}

                    </div>
                  </div>
                </article>
              ))}

              {filteredListings.length === 0 && (
                <EmptyState message="No opportunities match your search or status filter." />
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">
                          {report.organisation}
                        </h3>
                        <StatusBadge status={report.status} />
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Reported by: {report.reviewer}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Submitted: {report.submitted}
                      </p>

                      <div className="mt-4 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reported content</p>
                        <p className="mt-2 text-sm leading-6">{report.comment} · Reference {report.organisation}</p>
                        <p className="mt-3 text-sm">
                          <strong>Report reason:</strong> {report.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {report.status === "Pending" && (
                        <>
                          <button
                            onClick={() => updateReport(report.id, "Dismissed")}
                            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                          >
                            Dismiss Report
                          </button>
                          <button
                            onClick={() => updateReport(report.id, "Removed")}
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                          >
                            Mark for Removal
                          </button>
                        </>
                      )}

                    </div>
                  </div>
                </article>
              ))}

              {filteredReports.length === 0 && (
                <EmptyState message="No reports match your search or status filter." />
              )}
            </div>
          )}
        </section>

        <footer className="border-t border-slate-200 pt-5 text-center text-xs leading-5 text-slate-500">
          Organisation verification, opportunity review, and report resolution are saved through the API.
        </footer>
      </div>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="font-semibold text-slate-700">Nothing to display</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}


"use client";

import { useMemo, useState } from "react";

type OrganisationStatus = "Pending" | "Verified" | "Rejected";
type ListingStatus = "Pending" | "Approved" | "Rejected";
type ReportStatus = "Pending" | "Dismissed" | "Removed";

type Organisation = {
  id: number;
  name: string;
  email: string;
  location: string;
  category: string;
  submitted: string;
  status: OrganisationStatus;
};

type Listing = {
  id: number;
  title: string;
  organisation: string;
  category: string;
  location: string;
  submitted: string;
  status: ListingStatus;
  description: string;
};

type ReportedReview = {
  id: number;
  organisation: string;
  reviewer: string;
  rating: number;
  comment: string;
  reason: string;
  submitted: string;
  status: ReportStatus;
};

type Tab = "organisations" | "listings" | "reports";

const initialOrganisations: Organisation[] = [
  {
    id: 1,
    name: "Helping Hands Foundation",
    email: "contact@helpinghands.org",
    location: "Hyderabad, Telangana",
    category: "Community Service",
    submitted: "2026-10-20",
    status: "Pending",
  },
  {
    id: 2,
    name: "Green Earth Initiative",
    email: "hello@greenearth.org",
    location: "Vijayawada, Andhra Pradesh",
    category: "Environment",
    submitted: "2026-10-21",
    status: "Pending",
  },
  {
    id: 3,
    name: "Bright Future Trust",
    email: "info@brightfuture.org",
    location: "Visakhapatnam, Andhra Pradesh",
    category: "Education",
    submitted: "2026-10-18",
    status: "Verified",
  },
];

const initialListings: Listing[] = [
  {
    id: 101,
    title: "Weekend Teaching Programme",
    organisation: "Helping Hands Foundation",
    category: "Education",
    location: "Hyderabad",
    submitted: "2026-10-22",
    status: "Pending",
    description:
      "Volunteers will help school children with reading, writing and basic mathematics.",
  },
  {
    id: 102,
    title: "Community Clean-up Drive",
    organisation: "Green Earth Initiative",
    category: "Environment",
    location: "Vijayawada",
    submitted: "2026-10-23",
    status: "Pending",
    description:
      "Help clean public spaces and promote responsible waste management.",
  },
  {
    id: 103,
    title: "Food Distribution Campaign",
    organisation: "Bright Future Trust",
    category: "Community Service",
    location: "Visakhapatnam",
    submitted: "2026-10-19",
    status: "Approved",
    description:
      "Assist the organisation with distributing food packages to local communities.",
  },
];

const initialReports: ReportedReview[] = [
  {
    id: 201,
    organisation: "Helping Hands Foundation",
    reviewer: "Anonymous Volunteer",
    rating: 1,
    comment: "The volunteering experience was disappointing.",
    reason: "Potentially inappropriate content",
    submitted: "2026-10-24",
    status: "Pending",
  },
  {
    id: 202,
    organisation: "Green Earth Initiative",
    reviewer: "Volunteer 24",
    rating: 2,
    comment: "The event details did not match my expectations.",
    reason: "Reported as misleading",
    submitted: "2026-10-25",
    status: "Pending",
  },
];

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
  const [organisations, setOrganisations] =
    useState<Organisation[]>(initialOrganisations);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [reports, setReports] =
    useState<ReportedReview[]>(initialReports);

  const [activeTab, setActiveTab] = useState<Tab>("organisations");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [selectedListing, setSelectedListing] =
    useState<Listing | null>(null);

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

  function updateOrganisation(
    id: number,
    status: OrganisationStatus
  ) {
    const organisation = organisations.find((item) => item.id === id);

    setOrganisations((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    setMessage(
      organisation
        ? `${organisation.name} marked as ${status.toLowerCase()}.`
        : "Organisation updated."
    );
  }

  function updateListing(id: number, status: ListingStatus) {
    const listing = listings.find((item) => item.id === id);

    setListings((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    setSelectedListing(null);
    setMessage(
      listing
        ? `"${listing.title}" marked as ${status.toLowerCase()}.`
        : "Opportunity updated."
    );
  }

  function updateReport(id: number, status: ReportStatus) {
    setReports((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    setMessage(
      status === "Dismissed"
        ? "Report dismissed. The review remains unchanged."
        : "Reported review marked for removal in this demo."
    );
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
  }

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
            label="Total Organisations"
            value={organisations.length}
            description="Organisations in the demo"
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
                          {organisation.email}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {organisation.location}
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

                      {organisation.status !== "Pending" && (
                        <button
                          onClick={() =>
                            updateOrganisation(organisation.id, "Pending")
                          }
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                          Reset to Pending
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

                      {listing.status !== "Pending" && (
                        <button
                          onClick={() => updateListing(listing.id, "Pending")}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                          Reset to Pending
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
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Reported review
                        </p>
                        <p className="mt-2 text-amber-600">
                          {"★".repeat(report.rating)}
                          <span className="text-slate-300">
                            {"★".repeat(5 - report.rating)}
                          </span>
                          <span className="ml-2 text-sm text-slate-500">
                            {report.rating}/5
                          </span>
                        </p>
                        <p className="mt-2 text-sm leading-6">
                          {report.comment}
                        </p>
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

                      {report.status !== "Pending" && (
                        <button
                          onClick={() => updateReport(report.id, "Pending")}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                          Reopen Report
                        </button>
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
          Admin Console · Demonstration using mock data only.
          <br />
          Changes are temporary and will reset when the page is refreshed.
          Production moderation requires authenticated admin access and backend persistence.
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

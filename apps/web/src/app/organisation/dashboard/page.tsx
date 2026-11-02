
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApplicationItem, OpportunityItem } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

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

const categories = [
  "Education & Literacy",
  "Environment",
  "Healthcare",
  "Community Outreach",
  "Animal Welfare",
  "Other",
];

const emptyForm = {
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
    location: item.city || item.locationType || item.location_type || "Remote",
    date: (item.deadline || "").slice(0, 10),
    slots: item.openings || 1,
    description: item.description,
    status: item.status.toLowerCase(),
    applicantCount: item.applications_count ?? item.applicant_stats?.total ?? 0,
    selectedCount: item.applicant_stats?.selected ?? 0,
  };
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    live: "Open",
    pending_review: "Pending review",
    draft: "Draft",
    closed: "Closed",
    rejected: "Rejected",
  };
  return labels[status] || status;
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

  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeApplicantListing, setActiveApplicantListing] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Record<string, ApplicationItem[]>>({});
  const [applicantLoading, setApplicantLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

  async function toggleApplicants(opportunityId: string) {
    if (activeApplicantListing === opportunityId) {
      setActiveApplicantListing(null);
      return;
    }
    setActiveApplicantListing(opportunityId);
    setApplicantLoading(true);
    try {
      const result = await api.getOpportunityApplicants(opportunityId);
      setApplicants((previous) => ({ ...previous, [opportunityId]: result }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load applicants.");
    } finally {
      setApplicantLoading(false);
    }
  }

  async function changeApplicantStatus(applicationId: string, status: ApplicationItem["status"], opportunityId: string) {
    try {
      const updated = await api.updateApplicationStatus(applicationId, status);
      setApplicants((previous) => ({
        ...previous,
        [opportunityId]: (previous[opportunityId] || []).map((item) => item.id === updated.id ? { ...item, ...updated, volunteer: item.volunteer } : item),
      }));
      setMessage(`Applicant status updated to ${status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update applicant status.");
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "organisation") router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || user?.role !== "organisation") return;
    let mounted = true;
    api.getMyOpportunities()
      .then((items) => {
        if (mounted) setOpportunities(items.map(toDashboardOpportunity));
      })
      .catch((error: unknown) => {
        if (mounted) setMessage(error instanceof Error ? error.message : "Could not load your opportunities.");
      })
      .finally(() => {
        if (mounted) setDataLoading(false);
      });
    return () => { mounted = false; };
  }, [authLoading, user]);

  const openCount = opportunities.filter(
    (item) => item.status === "live"
  ).length;

  const totalApplicants = opportunities.reduce(
    (total, item) => total + item.applicantCount,
    0
  );

  const selectedCount = opportunities.reduce(
    (total, item) =>
      total +
      item.selectedCount,
    0
  );

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query);

      const matchesFilter = filter === "All" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [opportunities, search, filter]);

  function updateForm(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setMessage("");
  }

  function startCreate() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setStep(1);
    setShowForm(true);
    setMessage("");
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
    setMessage("");
  }

  function continueForm() {
    if (step === 1) {
      if (!form.title.trim() || !form.category) {
        setMessage(
          "Please enter an opportunity title and select a category."
        );
        return;
      }
    }

    if (step === 2) {
      const slots = Number(form.slots);

      if (
        !form.location.trim() ||
        !form.date ||
        form.date < getTodayISO() ||
        !Number.isInteger(slots) ||
        slots < 1
      ) {
        setMessage(
          "Enter a valid location, date and positive whole number of volunteer slots."
        );
        return;
      }
    }

    setMessage("");
    setStep((previous) => Math.min(previous + 1, 3));
  }

  async function saveOpportunity() {
    if (!form.description.trim()) {
      setMessage("Please add a description before publishing.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.location.trim() ||
      !form.date ||
      form.date < getTodayISO() ||
      !Number.isInteger(Number(form.slots)) ||
      Number(form.slots) < 1
    ) {
      setMessage("Please check all required fields before publishing.");
      setStep(!form.title.trim() ? 1 : 2);
      return;
    }

    setSaving(true);
    setMessage("");
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: "Volunteering",
      category: form.category,
      locationType: "On-site",
      city: form.location.trim(),
      duration: "Flexible",
      openings: Number(form.slots),
      deadline: form.date,
    };

    try {
      if (editingId !== null) {
        const updated = await api.updateOpportunity(editingId, payload);
        setOpportunities((previous) => previous.map((item) => item.id === editingId ? toDashboardOpportunity(updated) : item));
        setMessage("Opportunity changes saved.");
      } else {
        const created = await api.createOpportunity({ ...payload, status: "draft" });
        const submitted = await api.submitOpportunityForReview(created.id);
        setOpportunities((previous) => [toDashboardOpportunity(submitted), ...previous]);
        setMessage("Submitted for review. Volunteers will see it after an admin approves it.");
      }

      setShowForm(false);
      setStep(1);
      setForm({ ...emptyForm });
      setEditingId(null);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Could not save the opportunity.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleListing(id: string) {
    const opportunity = opportunities.find((item) => item.id === id);
    if (!opportunity) return;
    try {
      const updated = opportunity.status === "live"
        ? await api.closeOpportunity(id)
        : await api.reopenOpportunity(id);
      setOpportunities((previous) => previous.map((item) => item.id === id ? toDashboardOpportunity(updated) : item));
      setMessage("Listing status updated.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Could not update the listing.");
    }
  }

  if (authLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading organisation dashboard…</div>;
  }
  if (!user || user.role !== "organisation") return null;
  if (dataLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading organisation dashboard…</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Organisation Portal</p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Organisation Dashboard
            </h1>

            <p className="mt-2 text-slate-500">Create opportunities, track review status and monitor applications.</p>
          </div>

          <button
            onClick={startCreate}
            className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            + Create Opportunity
          </button>
        </header>

        {message && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            <span>{message}</span>

            <button
              onClick={() => setMessage("")}
              className="font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Opportunities",
              value: opportunities.length,
            },
            {
              label: "Open Opportunities",
              value: openCount,
            },
            {
              label: "Total Applicants",
              value: totalApplicants,
            },
            {
              label: "Volunteers Selected",
              value: selectedCount,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-bold">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {showForm && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId !== null
                    ? "Edit Opportunity"
                    : "Create Opportunity"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Step {step} of 3
                </p>
              </div>

              <button
                onClick={() => {
                  setShowForm(false);
                  setMessage("");
                }}
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 flex gap-2" aria-label="Form progress">
              {[1, 2, 3].map((number) => (
                <div
                  key={number}
                  className={`h-2 flex-1 rounded-full ${
                    number <= step
                      ? "bg-emerald-600"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <div className="mt-6 space-y-5">
              {step === 1 && (
                <>
                  <h3 className="font-semibold">
                    Basic Information
                  </h3>

                  <label className="block text-sm font-medium">
                    Opportunity title *
                    <input
                      value={form.title}
                      onChange={(event) =>
                        updateForm("title", event.target.value)
                      }
                      placeholder="e.g. Weekend Teaching Programme"
                      className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-emerald-600"
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Category *
                    <select
                      value={form.category}
                      onChange={(event) =>
                        updateForm("category", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              {step === 2 && (
                <>
                  <h3 className="font-semibold">
                    Location and Schedule
                  </h3>

                  <label className="block text-sm font-medium">
                    Location *
                    <input
                      value={form.location}
                      onChange={(event) =>
                        updateForm("location", event.target.value)
                      }
                      placeholder="City or venue"
                      className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Opportunity date *
                    <input
                      type="date"
                      min={getTodayISO()}
                      value={form.date}
                      onChange={(event) =>
                        updateForm("date", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Volunteer slots *
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.slots}
                      onChange={(event) =>
                        updateForm("slots", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                    />
                  </label>
                </>
              )}

              {step === 3 && (
                <>
                  <h3 className="font-semibold">
                    Description and Review
                  </h3>

                  <label className="block text-sm font-medium">
                    Opportunity description *
                    <textarea
                      rows={5}
                      value={form.description}
                      onChange={(event) =>
                        updateForm("description", event.target.value)
                      }
                      placeholder="Explain the activity, responsibilities and skills needed..."
                      className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                    />
                  </label>

                  <div className="rounded-xl bg-slate-50 p-4 text-sm">
                    <p>
                      <strong>Title:</strong> {form.title}
                    </p>
                    <p className="mt-2">
                      <strong>Category:</strong> {form.category}
                    </p>
                    <p className="mt-2">
                      <strong>Location:</strong> {form.location}
                    </p>
                    <p className="mt-2">
                      <strong>Date:</strong> {form.date}
                    </p>
                    <p className="mt-2">
                      <strong>Slots:</strong> {form.slots}
                    </p>
                  </div>
                </>
              )}

              {message && (
                <p role="alert" className="text-sm text-red-600">
                  {message}
                </p>
              )}

              <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
                <button
                  onClick={() => {
                    if (step === 1) {
                      setShowForm(false);
                      setMessage("");
                    } else {
                      setStep((previous) => previous - 1);
                      setMessage("");
                    }
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 font-medium hover:bg-slate-50"
                >
                  {step === 1 ? "Cancel" : "Back"}
                </button>

                {step < 3 ? (
                  <button
                    onClick={continueForm}
                    className="rounded-xl bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={saveOpportunity}
                    disabled={saving}
                    className="rounded-xl bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
                  >
                    {editingId !== null
                      ? "Save Changes"
                      : saving ? "Submitting…" : "Submit for Review"}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold">
                Your Opportunities
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create listings and track their review and application counts.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or location..."
                aria-label="Search opportunities"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5"
              />

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter opportunities"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5"
              >
                <option value="All">All Statuses</option>
                <option value="live">Open</option>
                <option value="pending_review">Pending review</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredOpportunities.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold">
                No opportunities found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Try a different search or create a new opportunity.
              </p>
            </div>
          )}

          {filteredOpportunities.map((opportunity) => (
            <article
              key={opportunity.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold">
                      {opportunity.title}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        opportunity.status === "live"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {statusLabel(opportunity.status)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {opportunity.category} · {opportunity.location} ·{" "}
                    {opportunity.date}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {opportunity.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <span>
                      👥 {opportunity.applicantCount} applicants
                    </span>

                    <span>
                      🎯 {opportunity.slots} volunteer slots
                    </span>

                    <span>
                      ✓ {opportunity.selectedCount} selected
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => startEdit(opportunity)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleListing(opportunity.id)}
                    disabled={opportunity.status !== "live" && opportunity.status !== "closed"}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      opportunity.status === "live"
                        ? "border border-red-200 text-red-700 hover:bg-red-50"
                        : "bg-emerald-700 text-white hover:bg-emerald-800"
                    }`}
                  >
                    {opportunity.status === "live"
                      ? "Close Listing"
                      : opportunity.status === "closed" ? "Reopen Listing" : "Status managed by review"}
                  </button>

                  <button
                    onClick={() => void toggleApplicants(opportunity.id)}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    {activeApplicantListing === opportunity.id
                      ? "Hide Applicants"
                      : "View Applicants"}
                  </button>
                </div>
              </div>

              {activeApplicantListing === opportunity.id && (
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <h4 className="font-bold">Applicants</h4>

                  {applicantLoading && <p className="mt-3 text-sm text-slate-500">Loading applicants…</p>}
                  {!applicantLoading && (applicants[opportunity.id] || []).length === 0 && <p className="mt-3 text-sm text-slate-500">No applicants yet.</p>}
                  <div className="mt-3 divide-y divide-slate-200">
                    {(applicants[opportunity.id] || []).map((application) => (
                      <div key={application.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{application.volunteer?.name || "Volunteer"}</p>
                          <p className="text-sm text-slate-500">{application.volunteer?.email} · {application.volunteer?.city || "Location not provided"}</p>
                          <p className="mt-1 text-sm text-slate-700">{application.pitch_text}</p>
                          <p className="mt-1 text-xs capitalize text-slate-500">Status: {application.status}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {application.status === "applied" && <button onClick={() => void changeApplicantStatus(application.id, "shortlisted", opportunity.id)} className="rounded-lg border px-3 py-2 text-sm">Shortlist</button>}
                          {(application.status === "applied" || application.status === "shortlisted") && <button onClick={() => void changeApplicantStatus(application.id, "selected", opportunity.id)} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white">Select</button>}
                          {application.status === "selected" && <button onClick={() => void changeApplicantStatus(application.id, "completed", opportunity.id)} className="rounded-lg bg-sky-700 px-3 py-2 text-sm text-white">Mark completed</button>}
                          {!(["completed", "rejected"].includes(application.status)) && <button onClick={() => void changeApplicantStatus(application.id, "rejected", opportunity.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700">Reject</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>

        <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
          New listings are reviewed by an administrator before volunteers can see them.
        </footer>
      </div>
    </main>
  );
}

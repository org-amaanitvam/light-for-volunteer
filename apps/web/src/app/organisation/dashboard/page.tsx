```tsx
"use client";

import { useMemo, useState } from "react";

type ApplicantStatus =
  | "Applied"
  | "Shortlisted"
  | "Selected"
  | "Rejected";

type Applicant = {
  id: number;
  name: string;
  email: string;
  skills: string[];
  status: ApplicantStatus;
};

type Opportunity = {
  id: number;
  title: string;
  category: string;
  location: string;
  date: string;
  slots: number;
  description: string;
  status: "Open" | "Closed";
  applicants: Applicant[];
};

const initialOpportunities: Opportunity[] = [
  {
    id: 1,
    title: "Community Clean-up Drive",
    category: "Environment",
    location: "Hyderabad",
    date: "2026-11-15",
    slots: 15,
    description:
      "Help clean public spaces and spread awareness about waste management.",
    status: "Open",
    applicants: [
      {
        id: 101,
        name: "Ananya Rao",
        email: "ananya@example.com",
        skills: ["Teamwork", "Communication"],
        status: "Applied",
      },
      {
        id: 102,
        name: "Rahul Kumar",
        email: "rahul@example.com",
        skills: ["Leadership"],
        status: "Applied",
      },
      {
        id: 103,
        name: "Priya Sharma",
        email: "priya@example.com",
        skills: ["Event planning", "Social media"],
        status: "Shortlisted",
      },
    ],
  },
  {
    id: 2,
    title: "Teaching Children",
    category: "Education",
    location: "Vijayawada",
    date: "2026-11-22",
    slots: 8,
    description:
      "Support children with basic reading, writing and mathematics.",
    status: "Open",
    applicants: [
      {
        id: 201,
        name: "Sneha Reddy",
        email: "sneha@example.com",
        skills: ["Teaching", "Patience"],
        status: "Applied",
      },
      {
        id: 202,
        name: "Arjun Das",
        email: "arjun@example.com",
        skills: ["Mathematics"],
        status: "Selected",
      },
    ],
  },
];

const categories = [
  "Education",
  "Environment",
  "Healthcare",
  "Community Service",
  "Animal Welfare",
  "Other",
];

const emptyForm = {
  title: "",
  category: "Community Service",
  location: "",
  date: "",
  slots: "5",
  description: "",
};

function getTodayISO() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function OrganisationDashboard() {
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(initialOpportunities);

  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeApplicantListing, setActiveApplicantListing] =
    useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

  const openCount = opportunities.filter(
    (item) => item.status === "Open"
  ).length;

  const totalApplicants = opportunities.reduce(
    (total, item) => total + item.applicants.length,
    0
  );

  const selectedCount = opportunities.reduce(
    (total, item) =>
      total +
      item.applicants.filter(
        (applicant) => applicant.status === "Selected"
      ).length,
    0
  );

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || item.status === filter;

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

  function saveOpportunity() {
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

    if (editingId !== null) {
      setOpportunities((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: form.title.trim(),
                category: form.category,
                location: form.location.trim(),
                date: form.date,
                slots: Number(form.slots),
                description: form.description.trim(),
              }
            : item
        )
      );

      setMessage("Opportunity updated successfully!");
    } else {
      const newOpportunity: Opportunity = {
        id: Date.now(),
        title: form.title.trim(),
        category: form.category,
        location: form.location.trim(),
        date: form.date,
        slots: Number(form.slots),
        description: form.description.trim(),
        status: "Open",
        applicants: [],
      };

      setOpportunities((previous) => [
        newOpportunity,
        ...previous,
      ]);

      setMessage("Opportunity published successfully!");
    }

    setShowForm(false);
    setStep(1);
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  function toggleListing(id: number) {
    setOpportunities((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Open" ? "Closed" : "Open",
            }
          : item
      )
    );

    setMessage("Listing status updated successfully.");
  }

  function updateApplicant(
    opportunityId: number,
    applicantId: number,
    status: ApplicantStatus
  ) {
    setOpportunities((previous) =>
      previous.map((item) =>
        item.id === opportunityId
          ? {
              ...item,
              applicants: item.applicants.map((applicant) =>
                applicant.id === applicantId
                  ? { ...applicant, status }
                  : applicant
              ),
            }
          : item
      )
    );

    setMessage(`Applicant status updated to ${status}.`);
  }

  function applicantStatusClass(status: ApplicantStatus) {
    switch (status) {
      case "Selected":
        return "bg-green-100 text-green-800";
      case "Shortlisted":
        return "bg-blue-100 text-blue-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              Organisation Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Organisation Dashboard
            </h1>

            <p className="mt-2 text-slate-500">
              Manage opportunities, review applicants and select volunteers.
            </p>
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
                    className="rounded-xl bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800"
                  >
                    {editingId !== null
                      ? "Save Changes"
                      : "Publish Opportunity"}
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
                Manage listings and applicants from one place.
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
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
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
                        opportunity.status === "Open"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {opportunity.status}
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
                      👥 {opportunity.applicants.length} applicants
                    </span>

                    <span>
                      🎯 {opportunity.slots} volunteer slots
                    </span>

                    <span>
                      ✓{" "}
                      {
                        opportunity.applicants.filter(
                          (applicant) =>
                            applicant.status === "Selected"
                        ).length
                      }{" "}
                      selected
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
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      opportunity.status === "Open"
                        ? "border border-red-200 text-red-700 hover:bg-red-50"
                        : "bg-emerald-700 text-white hover:bg-emerald-800"
                    }`}
                  >
                    {opportunity.status === "Open"
                      ? "Close Listing"
                      : "Reopen Listing"}
                  </button>

                  <button
                    onClick={() =>
                      setActiveApplicantListing(
                        activeApplicantListing === opportunity.id
                          ? null
                          : opportunity.id
                      )
                    }
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

                  {opportunity.applicants.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">
                      No applicants yet. Applicants will appear here when available.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {opportunity.applicants.map((applicant) => (
                        <div
                          key={applicant.id}
                          className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center"
                        >
                          <div>
                            <p className="font-semibold">
                              {applicant.name}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {applicant.email}
                            </p>

                            <p className="mt-2 text-sm text-slate-600">
                              Skills: {applicant.skills.join(", ")}
                            </p>

                            <span
                              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${applicantStatusClass(applicant.status)}`}
                            >
                              {applicant.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              disabled={applicant.status === "Shortlisted"}
                              onClick={() =>
                                updateApplicant(
                                  opportunity.id,
                                  applicant.id,
                                  "Shortlisted"
                                )
                              }
                              className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-40"
                            >
                              Shortlist
                            </button>

                            <button
                              disabled={applicant.status === "Selected"}
                              onClick={() =>
                                updateApplicant(
                                  opportunity.id,
                                  applicant.id,
                                  "Selected"
                                )
                              }
                              className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-40"
                            >
                              Select
                            </button>

                            <button
                              disabled={applicant.status === "Rejected"}
                              onClick={() =>
                                updateApplicant(
                                  opportunity.id,
                                  applicant.id,
                                  "Rejected"
                                )
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </section>

        <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
          Demo dashboard · Mock data is stored in page state and resets on refresh.
        </footer>
      </div>
    </main>
  );
}
```

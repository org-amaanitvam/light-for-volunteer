
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  CalendarDays,
  Clock,
  SlidersHorizontal,
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  HeartHandshake,
  X,
} from "lucide-react";

const opportunities = [
  {
    id: "opp-1",
    title: "Youth Coding & Digital Literacy Mentor",
    org: "Hope EdTech Foundation",
    category: "Education & Literacy",
    skills: ["Teaching", "Programming", "Communication"],
    location: "New Delhi",
    locationType: "Hybrid",
    duration: "3 months",
    deadline: "2026-11-15",
    commitment: "4 hrs/week",
    type: "Volunteer",
    description:
      "Help young students develop coding skills and improve their digital literacy.",
  },
  {
    id: "opp-2",
    title: "Urban Tree Plantation Volunteer",
    org: "Green Canopy Project",
    category: "Environment & Climate",
    skills: ["Teamwork", "Communication"],
    location: "Bengaluru",
    locationType: "On-site",
    duration: "1 month",
    deadline: "2026-11-20",
    commitment: "Weekends",
    type: "Volunteer",
    description:
      "Participate in tree plantation drives and community environmental awareness.",
  },
  {
    id: "opp-3",
    title: "Community Health Camp Assistant",
    org: "Aarogya Seva Trust",
    category: "Healthcare & Mental Health",
    skills: ["Communication", "Teamwork"],
    location: "Mumbai",
    locationType: "On-site",
    duration: "2 weeks",
    deadline: "2026-11-10",
    commitment: "6 hrs/week",
    type: "Volunteer",
    description:
      "Support community health camps and help coordinate public health activities.",
  },
  {
    id: "opp-4",
    title: "Frontend Development Intern",
    org: "Digital Change Initiative",
    category: "Education & Literacy",
    skills: ["React", "JavaScript", "Programming"],
    location: "Remote",
    locationType: "Remote",
    duration: "3 months",
    deadline: "2026-12-05",
    commitment: "10 hrs/week",
    type: "Internship",
    description:
      "Build accessible web experiences for nonprofit educational initiatives.",
  },
  {
    id: "opp-5",
    title: "Animal Welfare Community Volunteer",
    org: "Paws and Care Foundation",
    category: "Animal Welfare",
    skills: ["Teamwork", "Communication"],
    location: "Pune",
    locationType: "On-site",
    duration: "1 month",
    deadline: "2026-11-25",
    commitment: "Weekends",
    type: "Volunteer",
    description:
      "Help organise animal welfare awareness campaigns and community activities.",
  },
  {
    id: "opp-6",
    title: "Social Impact Project Mentor",
    org: "Community Growth Network",
    category: "Community Outreach",
    skills: ["Leadership", "Communication", "Teaching"],
    location: "Remote",
    locationType: "Remote",
    duration: "6 months",
    deadline: "2026-12-15",
    commitment: "3 hrs/week",
    type: "Mentorship",
    description:
      "Guide volunteers as they plan and deliver meaningful community projects.",
  },
];

const categories = [
  "Education & Literacy",
  "Environment & Climate",
  "Healthcare & Mental Health",
  "Animal Welfare",
  "Community Outreach",
];

const skills = [
  "Teaching",
  "Programming",
  "React",
  "JavaScript",
  "Communication",
  "Teamwork",
  "Leadership",
];

const durations = ["2 weeks", "1 month", "3 months", "6 months"];

export default function OpportunitiesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [skill, setSkill] = useState("");
  const [locationType, setLocationType] = useState("");
  const [duration, setDuration] = useState("");
  const [deadline, setDeadline] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const searchText =
        `${opp.title} ${opp.org} ${opp.location} ${opp.category}`.toLowerCase();

      return (
        searchText.includes(query.toLowerCase().trim()) &&
        (!category || opp.category === category) &&
        (!skill || opp.skills.includes(skill)) &&
        (!locationType || opp.locationType === locationType) &&
        (!duration || opp.duration === duration) &&
        (!deadline || opp.deadline <= deadline)
      );
    });
  }, [query, category, skill, locationType, duration, deadline]);

  function clearFilters() {
    setQuery("");
    setCategory("");
    setSkill("");
    setLocationType("");
    setDuration("");
    setDeadline("");
  }

  const filters = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm font-semibold text-sky-600 hover:text-sky-800"
        >
          Clear all
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Category
        </h3>
        <div className="space-y-3">
          {categories.map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-start gap-2 text-sm text-slate-600"
            >
              <input
                type="radio"
                name="category"
                checked={category === item}
                onChange={() => setCategory(category === item ? "" : item)}
                className="mt-1 accent-sky-500"
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Skills
        </h3>
        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-sky-400"
        >
          <option value="">All skills</option>
          {skills.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Location type
        </h3>
        {["Remote", "Hybrid", "On-site"].map((item) => (
          <label
            key={item}
            className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600"
          >
            <input
              type="radio"
              name="locationType"
              checked={locationType === item}
              onChange={() =>
                setLocationType(locationType === item ? "" : item)
              }
              className="accent-sky-500"
            />
            {item}
          </label>
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Duration
        </h3>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-sky-400"
        >
          <option value="">Any duration</option>
          {durations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Apply before
        </h3>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-sky-400"
        />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-sky-100 bg-gradient-to-br from-sky-100 via-white to-cyan-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-sky-700">
            <HeartHandshake size={18} />
            Make a difference
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Discover opportunities that{" "}
            <span className="text-sky-600">matter.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Find volunteering opportunities, internships, and mentorships
            that match your interests, skills, and availability.
          </p>

          <div className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles, organisations, skills or cities..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("opportunity-results")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600"
            >
              Find opportunities <ArrowRight size={18} />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Remote", "Education & Literacy", "Programming"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (item === "Remote") setLocationType("Remote");
                  else if (item === "Programming") setSkill("Programming");
                  else setCategory(item);
                }}
                className="rounded-full border border-sky-100 bg-white/80 px-3 py-1.5 text-xs font-medium text-sky-800 transition hover:bg-sky-100"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        id="opportunity-results"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Explore Opportunities
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Find the right place to share your skills.
            </p>
          </div>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 lg:hidden"
          >
            <SlidersHorizontal size={17} /> Filters
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="sticky top-24 hidden rounded-2xl border border-slate-200 bg-white p-5 lg:block">
            {filters}
          </aside>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
                className="absolute inset-0 bg-slate-950/40"
              />
              <aside className="absolute right-0 top-0 h-full w-[min(90%,380px)] overflow-y-auto bg-white p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Refine results
                  </span>
                  <button
                    aria-label="Close filters"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-lg p-2 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                {filters}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-6 w-full rounded-xl bg-sky-500 py-3 font-semibold text-white"
                >
                  Show {filteredOpportunities.length} results
                </button>
              </aside>
            </div>
          )}

          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-900">
                  {filteredOpportunities.length}
                </span>{" "}
                opportunities found
              </p>

              <button
                onClick={clearFilters}
                className="text-sm font-medium text-sky-600 hover:underline"
              >
                Reset search & filters
              </button>
            </div>

            {filteredOpportunities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Search className="mx-auto mb-4 text-slate-400" size={36} />
                <h3 className="text-lg font-bold text-slate-900">
                  No opportunities found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different search term or remove some filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {filteredOpportunities.map((opp) => (
                  <article
                    key={opp.id}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-900/5 sm:p-6"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                        {opp.category}
                      </span>
                      {opp.type === "Internship" ? (
                        <GraduationCap
                          className="shrink-0 text-violet-500"
                          size={22}
                        />
                      ) : (
                        <BriefcaseBusiness
                          className="shrink-0 text-sky-500"
                          size={22}
                        />
                      )}
                    </div>

                    <h3 className="text-lg font-bold leading-7 text-slate-900 transition group-hover:text-sky-700">
                      {opp.title}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {opp.org}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {opp.description}
                    </p>

                    <div className="mt-5 space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={17} className="shrink-0 text-sky-500" />
                        {opp.location} · {opp.locationType}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={17} className="shrink-0 text-sky-500" />
                        {opp.commitment} · {opp.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={17}
                          className="shrink-0 text-sky-500"
                        />
                        Apply before{" "}
                        {new Date(
                          `${opp.deadline}T00:00:00`,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {opp.skills.map((item) => (
                        <span
                          key={item}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                      <span className="text-xs font-semibold text-slate-500">
                        {opp.type}
                      </span>

                      <Link
                        href={`/opportunities/${opp.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
                      >
                        View details <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}


"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  CheckCircle2,
  Users,
  X,
  RotateCcw,
} from "lucide-react";
import { api, OpportunityItem } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type OpportunityCard = {
  id: string;
  title: string;
  org: string;
  verificationStatus: string;
  category: string;
  skills: string[];
  location: string;
  locationType: string;
  duration: string | null;
  deadline: string | null;
  openings: number | null;
  pointsReward: number;
  type: string;
  description: string;
};

function toOpportunityCard(item: OpportunityItem): OpportunityCard {
  return {
    id: item.id,
    title: item.title,
    org: item.organisation?.org_name || "Social impact organisation",
    verificationStatus: item.organisation?.verification_status || "",
    category: item.category,
    skills: item.skills_required || item.skills || [],
    location: item.city || item.location || "Location in drive",
    locationType: item.location_type || item.locationType || "Remote",
    duration: item.duration?.trim() ? item.duration.trim() : null,
    deadline: item.deadline ? item.deadline.slice(0, 10) : null,
    openings: typeof item.openings === "number" ? item.openings : null,
    pointsReward: item.points_reward ?? item.pointsReward ?? 0,
    type: item.type || "Volunteer Opportunity",
    description: item.description,
  };
}

const CATEGORIES = [
  "Education & Literacy",
  "Environment & Climate",
  "Healthcare & Mental Health",
  "Community Outreach",
  "Animal Welfare",
  "Women & Child Empowerment",
  "Skill Development & Livelihood",
  "Disaster Relief",
  "Arts & Culture",
  "Technology for Good",
];

const SKILLS = [
  "Teaching",
  "Programming",
  "React",
  "JavaScript",
  "Communication",
  "Teamwork",
  "Leadership",
  "Content Writing",
  "Design",
];

const DURATIONS = ["2 weeks", "1 month", "3 months", "6 months"];

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const paramSearch = searchParams.get("search") || searchParams.get("q") || "";
  const paramCategory = searchParams.get("category") || "";

  const [opportunities, setOpportunities] = useState<OpportunityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [userQuery, setUserQuery] = useState<string | null>(null);
  const [userCategory, setUserCategory] = useState<string | null>(null);
  const [skill, setSkill] = useState("");
  const [locationType, setLocationType] = useState("");
  const [duration, setDuration] = useState("");
  const [deadline, setDeadline] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const query = userQuery !== null ? userQuery : paramSearch;
  const category = userCategory !== null ? userCategory : paramCategory;

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await api.getOpportunities({ limit: 100, sortBy: "newest" });
        if (active) {
          setOpportunities(result.data.map(toOpportunityCard));
          setLoadError("");
        }
      } catch (error) {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Could not load opportunities from server.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    window.addEventListener("focus", load);
    const refreshTimer = window.setInterval(load, 20_000);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
      window.clearInterval(refreshTimer);
    };
  }, []);

  // Filter opportunities (matching original logic)
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const searchText =
        `${opp.title} ${opp.org} ${opp.location} ${opp.category} ${opp.skills.join(" ")}`.toLowerCase();

      return (
        searchText.includes(query.toLowerCase().trim()) &&
        (!category || opp.category.toLowerCase().includes(category.toLowerCase())) &&
        (!skill || opp.skills.includes(skill)) &&
        (!locationType || opp.locationType === locationType) &&
        (!duration || opp.duration === duration) &&
        (!deadline || (opp.deadline && opp.deadline <= deadline))
      );
    });
  }, [opportunities, query, category, skill, locationType, duration, deadline]);

  function clearFilters() {
    setUserQuery("");
    setUserCategory("");
    setSkill("");
    setLocationType("");
    setDuration("");
    setDeadline("");
  }

  const activeFilterCount =
    (query ? 1 : 0) +
    (category ? 1 : 0) +
    (skill ? 1 : 0) +
    (locationType ? 1 : 0) +
    (duration ? 1 : 0) +
    (deadline ? 1 : 0);

  const filterSidebar = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#e2eaf2]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#0369a1]" />
          <h2 className="text-sm font-bold text-[#0f2a43]">Filter Drives</h2>
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0369a1] hover:text-[#075985] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Cause Category */}
      <div>
        <h3 className="mb-2.5 text-xs font-bold text-[#0c4a6e]">
          Cause Domain
        </h3>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-xs font-medium text-[#0f2a43] hover:text-[#0369a1] cursor-pointer">
            <input
              type="radio"
              name="sidebar-category"
              checked={!category}
              onChange={() => setUserCategory("")}
              className="accent-[#0369a1]"
            />
            <span>All Causes</span>
          </label>
          {CATEGORIES.map((item) => (
            <label
              key={item}
              className="flex items-start gap-2 text-xs text-[#335577] hover:text-[#0f2a43] cursor-pointer"
            >
              <input
                type="radio"
                name="sidebar-category"
                checked={category === item}
                onChange={() => setUserCategory(category === item ? "" : item)}
                className="mt-0.5 accent-[#0369a1]"
              />
              <span className="leading-tight">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Type */}
      <div className="pt-3 border-t border-[#e2eaf2]">
        <h3 className="mb-2 text-xs font-bold text-[#0c4a6e]">
          Participation Mode
        </h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-medium text-[#0f2a43] hover:text-[#0369a1] cursor-pointer">
            <input
              type="radio"
              name="sidebar-location"
              checked={!locationType}
              onChange={() => setLocationType("")}
              className="accent-[#0369a1]"
            />
            <span>All Modes</span>
          </label>
          {["Remote", "Hybrid", "On-site"].map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 text-xs text-[#335577] hover:text-[#0f2a43] cursor-pointer"
            >
              <input
                type="radio"
                name="sidebar-location"
                checked={locationType === item}
                onChange={() => setLocationType(locationType === item ? "" : item)}
                className="accent-[#0369a1]"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Required Skills */}
      <div className="pt-3 border-t border-[#e2eaf2]">
        <h3 className="mb-2 text-xs font-bold text-[#0c4a6e]">
          Required Skills
        </h3>
        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="w-full rounded-xl border border-[#bae6fd] bg-white p-2.5 text-xs text-[#0f2a43] outline-none focus:border-[#0369a1] focus:ring-1 focus:ring-[#0369a1]"
        >
          <option value="">All skills</option>
          {SKILLS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Commitment Duration */}
      <div className="pt-3 border-t border-[#e2eaf2]">
        <h3 className="mb-2 text-xs font-bold text-[#0c4a6e]">
          Commitment Duration
        </h3>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full rounded-xl border border-[#bae6fd] bg-white p-2.5 text-xs text-[#0f2a43] outline-none focus:border-[#0369a1] focus:ring-1 focus:ring-[#0369a1]"
        >
          <option value="">Any duration</option>
          {DURATIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Application Deadline */}
      <div className="pt-3 border-t border-[#e2eaf2]">
        <h3 className="mb-2 text-xs font-bold text-[#0c4a6e]">
          Application Deadline (Before)
        </h3>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-xl border border-[#bae6fd] bg-white p-2 text-xs text-[#0f2a43] outline-none focus:border-[#0369a1]"
        />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-transparent">
      {/* 
        ARCHITECTURAL CATALOGUE HEADER 
        Clear civic positioning, search input, and cause category quick pills
      */}
      <section className="relative overflow-hidden border-b border-[#bae6fd]/40 bg-[#0c4a6e]">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/Zephyr%20032.png')",
            backgroundPosition: "center 25%",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0c4a6e]/95 via-[#075985]/80 to-[#0c4a6e]/70 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-[#e0f2fe] shadow-xs">
              <HeartHandshake className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Amaanitvam Foundation Civic Directory</span>
            </div>

            <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              Explore Opportunities &amp; Civic Drives
            </h1>

            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#e0f2fe]/90 sm:text-base">
              Discover verified volunteering opportunities, internships, and mentorships hosted by registered social impact organisations. Apply directly and earn auditable service credentials.
            </p>

            {/* Search Bar */}
            <div className="mt-6 flex max-w-3xl flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0369a1]"
                />
                <input
                  value={query}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search by cause, role, organisation, skill, or city..."
                  className="h-11 w-full rounded-xl border border-white/30 bg-white/95 backdrop-blur-md pl-10 pr-4 text-sm text-[#0f2a43] placeholder:text-[#5a7b9d] outline-none transition focus:border-[#38bdf8] focus:bg-white focus:ring-2 focus:ring-[#38bdf8]/30 shadow-xs"
                />
              </div>

              <button
                onClick={() =>
                  document
                    .getElementById("catalogue-results")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] px-6 font-bold text-white shadow-sm transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] cursor-pointer border border-white/20"
              >
                Search Drives <ArrowRight size={16} />
              </button>
            </div>

            {/* Quick Filter Horizontal Category Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setUserCategory("");
                  setLocationType("");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  !category && !locationType
                    ? "border-white bg-white text-[#0c4a6e] font-bold shadow-xs"
                    : "border-white/20 bg-white/10 backdrop-blur-xs text-[#e0f2fe] hover:bg-white/20 hover:text-white"
                }`}
              >
                All Causes
              </button>
              {["Remote", "Education & Literacy", "Environment & Climate", "Healthcare & Mental Health", "Community Outreach"].map((item) => {
                const isSelected = item === "Remote" ? locationType === "Remote" : category === item;
                return (
                  <button
                    key={item}
                    onClick={() => {
                      if (item === "Remote") setLocationType(locationType === "Remote" ? "" : "Remote");
                      else setUserCategory(category === item ? "" : item);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? "border-white bg-white text-[#0c4a6e] font-bold shadow-xs"
                        : "border-white/20 bg-white/10 backdrop-blur-xs text-[#e0f2fe] hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 
        RESULTS & SIDEBAR LAYOUT
        Dual View Modes: Architectural Cards vs Structured Ledger Rows
      */}
      <section
        id="catalogue-results"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Results Action Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#bae6fd]/80 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#0f2a43]">
              Active Opportunities
            </h2>
            <p className="mt-0.5 text-xs text-[#5a7b9d]">
              Showing approved civic drives from registered non-profit partners.
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#bae6fd] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0f2a43] shadow-xs lg:hidden cursor-pointer"
          >
            <SlidersHorizontal size={14} className="text-[#0369a1]" />
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Desktop Filter Sidebar */}
          <aside className="sticky top-24 hidden rounded-2xl border border-[#bae6fd] bg-white p-5 shadow-xs lg:block">
            {filterSidebar}
          </aside>

          {/* Mobile Filter Drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
                className="absolute inset-0 bg-[#0f2a43]/40"
              />
              <aside className="absolute right-0 top-0 h-full w-[min(90%,380px)] overflow-y-auto bg-white p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between border-b border-[#e2eaf2] pb-3">
                  <span className="font-bold text-[#0f2a43] text-sm">
                    Filter Catalogue
                  </span>
                  <button
                    aria-label="Close filters"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-lg p-1.5 text-[#5a7b9d] hover:bg-[#f4f9ff] hover:text-[#0f2a43]"
                  >
                    <X size={18} />
                  </button>
                </div>
                {filterSidebar}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-6 w-full rounded-xl bg-[#0369a1] py-2.5 font-semibold text-white text-xs cursor-pointer hover:bg-[#075985]"
                >
                  Show {filteredOpportunities.length} results
                </button>
              </aside>
            </div>
          )}

          {/* Results Display Area */}
          <div>
            <div className="mb-4 flex items-center justify-between gap-3 text-xs text-[#5a7b9d]">
              <p className="font-semibold text-[#335577] tabular-nums">
                {loading
                  ? "Loading approved opportunities…"
                  : `${filteredOpportunities.length} ${filteredOpportunities.length === 1 ? "drive" : "drives"} available`}
              </p>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#0369a1] hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* Error State */}
            {loadError ? (
              <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-6 py-12 text-center text-sm text-[#b91c1c]">
                <p className="font-semibold">Unable to load drives at this time.</p>
                <p className="mt-1 text-xs text-[#991b1b]">{loadError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-xl bg-[#b91c1c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#991b1b]"
                >
                  Retry Connection
                </button>
              </div>
            ) : loading ? (
              /* Loading Skeletons */
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-64 rounded-2xl border border-[#bae6fd]/60 bg-white p-6 animate-pulse"
                  >
                    <div className="h-4 w-24 bg-[#e0f2fe] rounded-full mb-4" />
                    <div className="h-6 w-3/4 bg-[#f4f9ff] rounded mb-2" />
                    <div className="h-4 w-1/2 bg-[#f4f9ff] rounded mb-6" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-[#f4f9ff] rounded" />
                      <div className="h-3 w-5/6 bg-[#f4f9ff] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOpportunities.length === 0 ? (
              /* Empty State */
              <div className="rounded-2xl border border-[#bae6fd] bg-white px-6 py-16 text-center shadow-xs">
                <Search className="mx-auto mb-3 text-[#0369a1]" size={36} />
                <h3 className="text-base font-bold text-[#0f2a43]">
                  No matching opportunities found
                </h3>
                <p className="mt-1 text-xs text-[#5a7b9d] max-w-sm mx-auto">
                  We could not find any volunteer drives matching your current filters. Try searching with different terms or clearing applied filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-xl bg-[#0369a1] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#075985] cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              /* Architectural Opportunity Cards Grid */
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {filteredOpportunities.map((opp, index) => {
                  const isVerified = opp.verificationStatus === "verified";
                  const openingsText =
                    typeof opp.openings === "number"
                      ? opp.openings === 0
                        ? "Capacity reached"
                        : `${opp.openings} opening${opp.openings === 1 ? "" : "s"}`
                      : null;

                  return (
                    <ScrollReveal key={opp.id} delay={(index % 4) * 80} direction="up" className="h-full">
                      <article
                        className="flex flex-col justify-between rounded-2xl border border-[#bae6fd]/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,42,67,0.03)] hover:border-[#7dd3fc] hover:shadow-[0_4px_16px_rgba(3,105,161,0.08)] transition-[border-color,box-shadow,transform] duration-150 h-full"
                      >
                      <div>
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <span className="rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-xs font-semibold text-[#075985]">
                            {opp.category}
                          </span>

                          <div className="flex items-center gap-2">
                            {isVerified && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#065f46] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                                <CheckCircle2 className="w-3 h-3 text-[#047857]" /> Verified NGO
                              </span>
                            )}
                            {opp.type === "Internship" ? (
                              <GraduationCap
                                className="shrink-0 text-[#0369a1]"
                                size={18}
                                aria-label="Internship"
                              />
                            ) : (
                              <BriefcaseBusiness
                                className="shrink-0 text-[#5a7b9d]"
                                size={18}
                                aria-label="Volunteer Drive"
                              />
                            )}
                          </div>
                        </div>

                        <h3 className="text-base font-bold leading-snug text-[#0f2a43]">
                          {opp.title}
                        </h3>

                        <p className="mt-1 text-xs font-semibold text-[#335577]">
                          {opp.org}
                        </p>

                        <p className="mt-2 text-xs leading-relaxed text-[#5a7b9d] line-clamp-3">
                          {opp.description}
                        </p>

                        <div className="mt-4 space-y-2 text-xs text-[#335577]">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="shrink-0 text-[#0369a1]" />
                            <span>{opp.location} · {opp.locationType}</span>
                          </div>

                          {opp.duration && (
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="shrink-0 text-[#0369a1]" />
                              <span>{opp.duration}</span>
                            </div>
                          )}

                          {openingsText && (
                            <div className="flex items-center gap-2">
                              <Users size={14} className="shrink-0 text-[#0369a1]" />
                              <span className="tabular-nums">{openingsText}</span>
                            </div>
                          )}

                          {opp.deadline && (
                            <div className="flex items-center gap-2">
                              <CalendarDays size={14} className="shrink-0 text-[#0369a1]" />
                              <span className="tabular-nums">
                                Apply before {new Date(`${opp.deadline}T00:00:00`).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {opp.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {opp.skills.map((item) => (
                              <span
                                key={item}
                                className="rounded-md bg-[#f4f9ff] border border-[#bae6fd]/60 px-2 py-0.5 text-[11px] font-medium text-[#075985]"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e2eaf2] pt-4">
                        <span className="text-xs font-semibold text-[#0369a1] tabular-nums">
                          {opp.pointsReward > 0
                            ? `${opp.pointsReward} Impact Points`
                            : opp.type}
                        </span>

                        <Link
                          href={`/opportunities/${opp.id}`}
                          className={buttonVariants({
                            variant: "default",
                            size: "sm",
                            className: "gap-1.5 text-xs font-semibold",
                          })}
                        >
                          View Details &amp; Apply <ArrowRight size={14} />
                        </Link>
                      </div>
                    </article>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f9ff] p-12 text-center text-sm text-[#5a7b9d]">
          Loading opportunities directory…
        </div>
      }
    >
      <OpportunitiesContent />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api, OpportunityItem, OpportunityQueryParams } from "@/lib/api";
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

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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

const DEFAULT_PAGE_SIZE = 12;

function OpportunitiesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Query Parameters
  const paramSearch = searchParams.get("search") || searchParams.get("q") || "";
  const paramCategory = searchParams.get("category") || "";
  const paramLocationType = searchParams.get("locationType") || "";
  const paramSkill = searchParams.get("skill") || "";
  const paramDuration = searchParams.get("duration") || "";
  const paramDeadline = searchParams.get("deadline") || "";
  const paramPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  // Synchronize local search input with URL search param
  const [prevSearchParam, setPrevSearchParam] = useState(paramSearch);
  const [searchInput, setSearchInput] = useState(paramSearch);
  if (prevSearchParam !== paramSearch) {
    setPrevSearchParam(paramSearch);
    setSearchInput(paramSearch);
  }

  // State
  const [rawOpportunities, setRawOpportunities] = useState<OpportunityCard[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // URL synchronization helper
  const updateFilters = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      // If updating any filter criteria (other than page), reset page to 1
      const isFilterChange = Object.keys(updates).some((key) => key !== "page");
      if (isFilterChange && updates.page === undefined) {
        nextParams.delete("page");
      }

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          nextParams.delete(key);
        } else if (key === "page" && Number(value) <= 1) {
          nextParams.delete("page");
        } else {
          nextParams.set(key, String(value));
        }
      }

      // Clean up legacy `q` if `search` is set
      if (nextParams.has("search")) {
        nextParams.delete("q");
      }

      const queryString = nextParams.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl);
    },
    [router, pathname, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // Fetch opportunities using server-side filters & pagination
  const fetchOpportunities = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    setLoadError("");

    try {
      const queryParams: OpportunityQueryParams = {
        page: paramPage,
        limit: DEFAULT_PAGE_SIZE,
        sortBy: "newest",
      };

      if (paramSearch.trim()) {
        queryParams.search = paramSearch.trim();
      }
      if (paramCategory.trim()) {
        queryParams.category = paramCategory.trim();
      }
      if (paramLocationType.trim()) {
        queryParams.locationType = paramLocationType.trim();
      }
      if (paramSkill.trim()) {
        queryParams.skill = paramSkill.trim();
      }

      const result = await api.getOpportunities(queryParams);

      setRawOpportunities(result.data.map(toOpportunityCard));
      if (result.meta) {
        setMeta(result.meta);
      }
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load opportunities from server."
      );
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [paramSearch, paramCategory, paramLocationType, paramSkill, paramPage]);

  // Trigger fetch when server-relevant filters or page changes
  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const queryParams: OpportunityQueryParams = {
          page: paramPage,
          limit: DEFAULT_PAGE_SIZE,
          sortBy: "newest",
        };

        if (paramSearch.trim()) {
          queryParams.search = paramSearch.trim();
        }
        if (paramCategory.trim()) {
          queryParams.category = paramCategory.trim();
        }
        if (paramLocationType.trim()) {
          queryParams.locationType = paramLocationType.trim();
        }
        if (paramSkill.trim()) {
          queryParams.skill = paramSkill.trim();
        }

        const result = await api.getOpportunities(queryParams);

        if (active) {
          setRawOpportunities(result.data.map(toOpportunityCard));
          if (result.meta) {
            setMeta(result.meta);
          }
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load opportunities from server."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [paramSearch, paramCategory, paramLocationType, paramSkill, paramPage]);

  // Keep focus and 20s background refresh for live data updates
  useEffect(() => {
    const onFocus = () => {
      fetchOpportunities(true);
    };

    window.addEventListener("focus", onFocus);
    const intervalTimer = window.setInterval(() => {
      fetchOpportunities(true);
    }, 20_000);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(intervalTimer);
    };
  }, [fetchOpportunities]);

  // Client-side refinement for filters not supported by the backend query DTO (duration & deadline)
  const filteredOpportunities = useMemo(() => {
    return rawOpportunities.filter((opp) => {
      if (paramDuration && opp.duration !== paramDuration) {
        return false;
      }
      if (paramDeadline && (!opp.deadline || opp.deadline > paramDeadline)) {
        return false;
      }
      return true;
    });
  }, [rawOpportunities, paramDuration, paramDeadline]);

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (paramSearch) count++;
    if (paramCategory) count++;
    if (paramLocationType) count++;
    if (paramSkill) count++;
    if (paramDuration) count++;
    if (paramDeadline) count++;
    return count;
  }, [
    paramSearch,
    paramCategory,
    paramLocationType,
    paramSkill,
    paramDuration,
    paramDeadline,
  ]);

  const handleSearchSubmit = () => {
    updateFilters({ search: searchInput });
    document
      .getElementById("catalogue-results")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > meta.totalPages || newPage === meta.page) return;
    updateFilters({ page: newPage });
    document
      .getElementById("catalogue-results")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const filterSidebar = (
    <div className="space-y-5 text-sm">
      <div className="flex items-center justify-between border-b border-[#e2eaf2] pb-3">
        <span className="font-bold text-[#0f2a43] text-xs uppercase tracking-wider">
          Filter By
        </span>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-[#0369a1] hover:underline cursor-pointer"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* Cause Category */}
      <div>
        <h3 className="mb-2 text-xs font-bold text-[#0c4a6e]">Cause Category</h3>
        <select
          value={paramCategory}
          onChange={(e) => updateFilters({ category: e.target.value })}
          className="w-full rounded-xl border border-[#bae6fd] bg-white p-2.5 text-xs text-[#0f2a43] outline-none focus:border-[#0369a1] focus:ring-1 focus:ring-[#0369a1]"
        >
          <option value="">All causes</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
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
              checked={!paramLocationType}
              onChange={() => updateFilters({ locationType: "" })}
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
                checked={paramLocationType === item}
                onChange={() =>
                  updateFilters({
                    locationType: paramLocationType === item ? "" : item,
                  })
                }
                className="accent-[#0369a1]"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Required Skills */}
      <div className="pt-3 border-t border-[#e2eaf2]">
        <h3 className="mb-2 text-xs font-bold text-[#0c4a6e]">Required Skills</h3>
        <select
          value={paramSkill}
          onChange={(e) => updateFilters({ skill: e.target.value })}
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

      {/* Commitment Duration (client-side refinement) */}
      <div className="pt-3 border-t border-[#e2eaf2]">
        <h3 className="mb-2 text-xs font-bold text-[#0c4a6e]">
          Commitment Duration
        </h3>
        <select
          value={paramDuration}
          onChange={(e) => updateFilters({ duration: e.target.value })}
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

      {/* Application Deadline (client-side refinement) */}
      <div className="pt-3 border-t border-[#e2eaf2]">
        <h3 className="mb-2 text-xs font-bold text-[#0c4a6e]">
          Application Deadline (Before)
        </h3>
        <input
          type="date"
          value={paramDeadline}
          onChange={(e) => updateFilters({ deadline: e.target.value })}
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
      <section className="relative overflow-hidden border-b border-[#bae6fd]/80 bg-white">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/Zephyr%20032.png')",
            backgroundPosition: "center 22%",
          }}
          aria-hidden="true"
        />
        {/* Soft balanced daylight gradient wash preserving landscape details */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/45 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#bae6fd] bg-white/95 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-[#0369a1] shadow-xs">
              <HeartHandshake className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Amaanitvam Foundation Civic Directory</span>
            </div>

            <h1 className="max-w-3xl text-3xl font-black tracking-tight text-[#0f2a43] sm:text-4xl">
              Explore Opportunities &amp; <span className="text-[#0284c7]">Civic Drives</span>
            </h1>

            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#335577] sm:text-base">
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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  placeholder="Search by cause, role, organisation, skill, or city..."
                  className="h-11 w-full rounded-xl border border-[#bae6fd] bg-white/95 backdrop-blur-md pl-10 pr-4 text-sm text-[#0f2a43] placeholder:text-[#5a7b9d] outline-none transition focus:border-[#0369a1] focus:bg-white focus:ring-2 focus:ring-[#0369a1]/20 shadow-xs"
                />
              </div>

              <button
                onClick={handleSearchSubmit}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0369a1] hover:bg-[#075985] px-6 font-bold text-white shadow-xs transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] cursor-pointer"
              >
                Search Drives <ArrowRight size={16} />
              </button>
            </div>

            {/* Quick Filter Horizontal Category Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  updateFilters({ category: "", locationType: "" });
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  !paramCategory && !paramLocationType
                    ? "border-[#0369a1] bg-[#0369a1] text-white font-bold shadow-xs"
                    : "border-[#bae6fd] bg-white/90 backdrop-blur-xs text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
                }`}
              >
                All Causes
              </button>
              {[
                "Remote",
                "Education & Literacy",
                "Environment & Climate",
                "Healthcare & Mental Health",
                "Community Outreach",
              ].map((item) => {
                const isSelected =
                  item === "Remote"
                    ? paramLocationType === "Remote"
                    : paramCategory === item;
                return (
                  <button
                    key={item}
                    onClick={() => {
                      if (item === "Remote") {
                        updateFilters({
                          locationType: paramLocationType === "Remote" ? "" : "Remote",
                        });
                      } else {
                        updateFilters({
                          category: paramCategory === item ? "" : item,
                        });
                      }
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? "border-[#0369a1] bg-[#0369a1] text-white font-bold shadow-xs"
                        : "border-[#bae6fd] bg-white/90 backdrop-blur-xs text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
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
            <span>
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
            </span>
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
                  Show {meta.total} results
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
                  : `${meta.total} ${meta.total === 1 ? "drive" : "drives"} available`}
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
                <p className="font-semibold">
                  Unable to load drives at this time.
                </p>
                <p className="mt-1 text-xs text-[#991b1b]">{loadError}</p>
                <button
                  onClick={() => fetchOpportunities()}
                  className="mt-4 rounded-xl bg-[#b91c1c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#991b1b] cursor-pointer"
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
                  We could not find any volunteer drives matching your current
                  filters. Try searching with different terms or clearing applied
                  filters.
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
              <div className="space-y-8">
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
                      <ScrollReveal
                        key={opp.id}
                        delay={(index % 4) * 80}
                        direction="up"
                        className="h-full"
                      >
                        <article className="flex flex-col justify-between rounded-2xl border border-[#bae6fd]/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,42,67,0.03)] hover:border-[#7dd3fc] hover:shadow-[0_4px_16px_rgba(3,105,161,0.08)] transition-[border-color,box-shadow,transform] duration-150 h-full">
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
                                <MapPin
                                  size={14}
                                  className="shrink-0 text-[#0369a1]"
                                />
                                <span>
                                  {opp.location} · {opp.locationType}
                                </span>
                              </div>

                              {opp.duration && (
                                <div className="flex items-center gap-2">
                                  <Clock
                                    size={14}
                                    className="shrink-0 text-[#0369a1]"
                                  />
                                  <span>{opp.duration}</span>
                                </div>
                              )}

                              {openingsText && (
                                <div className="flex items-center gap-2">
                                  <Users
                                    size={14}
                                    className="shrink-0 text-[#0369a1]"
                                  />
                                  <span className="tabular-nums">
                                    {openingsText}
                                  </span>
                                </div>
                              )}

                              {opp.deadline && (
                                <div className="flex items-center gap-2">
                                  <CalendarDays
                                    size={14}
                                    className="shrink-0 text-[#0369a1]"
                                  />
                                  <span className="tabular-nums">
                                    Apply before{" "}
                                    {new Date(
                                      `${opp.deadline}T00:00:00`
                                    ).toLocaleDateString("en-IN", {
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

                {/* Pagination Controls */}
                {meta.totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#bae6fd]/80 pt-6">
                    <p className="text-xs text-[#5a7b9d]">
                      Showing page{" "}
                      <span className="font-semibold text-[#0f2a43]">
                        {meta.page}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-[#0f2a43]">
                        {meta.totalPages}
                      </span>{" "}
                      ({meta.total} total drives)
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(meta.page - 1)}
                        disabled={!meta.hasPreviousPage || meta.page <= 1}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#bae6fd] bg-white px-3 py-1.5 text-xs font-medium text-[#0f2a43] shadow-xs transition hover:bg-[#f4f9ff] hover:text-[#0369a1] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft size={14} />
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: meta.totalPages },
                          (_, i) => i + 1
                        )
                          .filter(
                            (pageNumber) =>
                              pageNumber === 1 ||
                              pageNumber === meta.totalPages ||
                              Math.abs(pageNumber - meta.page) <= 1
                          )
                          .map((pageNumber, idx, arr) => {
                            const prev = arr[idx - 1];
                            const showEllipsis = prev && pageNumber - prev > 1;

                            return (
                              <span key={pageNumber} className="flex items-center">
                                {showEllipsis && (
                                  <span className="px-1 text-xs text-[#5a7b9d]">
                                    …
                                  </span>
                                )}
                                <button
                                  onClick={() => handlePageChange(pageNumber)}
                                  className={`h-8 min-w-[32px] rounded-lg px-2 text-xs font-semibold transition ${
                                    pageNumber === meta.page
                                      ? "bg-[#0369a1] text-white shadow-xs"
                                      : "border border-[#bae6fd] bg-white text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
                                  }`}
                                >
                                  {pageNumber}
                                </button>
                              </span>
                            );
                          })}
                      </div>

                      <button
                        onClick={() => handlePageChange(meta.page + 1)}
                        disabled={!meta.hasNextPage || meta.page >= meta.totalPages}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#bae6fd] bg-white px-3 py-1.5 text-xs font-medium text-[#0f2a43] shadow-xs transition hover:bg-[#f4f9ff] hover:text-[#0369a1] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
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

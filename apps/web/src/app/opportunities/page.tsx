"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { api, type OpportunityItem, type PaginationMeta } from "@/lib/api";

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

function OpportunitiesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const skillParam = searchParams.get("skill") || searchParams.get("skills") || "";
  const locationTypeParam = searchParams.get("locationType") || searchParams.get("location_type") || "";
  const durationParam = searchParams.get("duration") || "";
  const deadlineParam = searchParams.get("deadline") || "";
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [prevQuery, setPrevQuery] = useState(searchQuery);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  if (prevQuery !== searchQuery) {
    setPrevQuery(searchQuery);
    setSearchInput(searchQuery);
  }

  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateFilters = useCallback(
    (updates: Record<string, string | number | undefined | null>) => {
      setIsLoading(true);
      const current = new URLSearchParams(searchParams.toString());

      const isFilterChange = Object.keys(updates).some((key) => key !== "page");
      if (isFilterChange && updates.page === undefined) {
        current.delete("page");
      }

      Object.entries(updates).forEach(([key, val]) => {
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (key === "page" && Number(val) <= 1)
        ) {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });

      const qs = current.toString();
      const target = qs ? `${pathname}?${qs}` : pathname;
      router.push(target, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const queryParams: Record<string, string | number> = {
          page: pageParam,
          limit: 10,
        };

        if (searchQuery.trim()) {
          queryParams.search = searchQuery.trim();
        }
        if (categoryParam) {
          queryParams.category = categoryParam;
        }
        if (locationTypeParam) {
          queryParams.locationType = locationTypeParam;
        }
        if (skillParam) {
          queryParams.skills = skillParam;
        }

        const res = await api.getOpportunities(queryParams);
        if (isMounted) {
          setOpportunities(res.data || []);
          setMeta(res.meta || null);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Unable to load opportunities. Please try again.";
          setError(message);
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, categoryParam, locationTypeParam, skillParam, pageParam]);

  const filteredOpportunities = useMemo(() => {
    if (!durationParam && !deadlineParam) {
      return opportunities;
    }
    return opportunities.filter((opp) => {
      const matchDuration =
        !durationParam ||
        (opp.duration && opp.duration.toLowerCase().includes(durationParam.toLowerCase()));
      const matchDeadline = !deadlineParam || (opp.deadline && opp.deadline <= deadlineParam);
      return matchDuration && matchDeadline;
    });
  }, [opportunities, durationParam, deadlineParam]);

  function clearFilters() {
    setIsLoading(true);
    setSearchInput("");
    router.push(pathname, { scroll: false });
  }

  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? pageParam;
  const totalCount = meta?.total ?? opportunities.length;

  function goToPage(p: number) {
    if (p < 1 || p > totalPages || p === currentPage) return;
    updateFilters({ page: p });
    document.getElementById("opportunity-results")?.scrollIntoView({ behavior: "smooth" });
  }

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

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
                checked={categoryParam === item}
                onChange={() =>
                  updateFilters({ category: categoryParam === item ? "" : item })
                }
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
          value={skillParam}
          onChange={(e) => updateFilters({ skill: e.target.value })}
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
              checked={locationTypeParam === item}
              onChange={() =>
                updateFilters({
                  locationType: locationTypeParam === item ? "" : item,
                })
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
          value={durationParam}
          onChange={(e) => updateFilters({ duration: e.target.value })}
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
          value={deadlineParam}
          onChange={(e) => updateFilters({ deadline: e.target.value })}
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateFilters({ search: searchInput });
                    document
                      .getElementById("opportunity-results")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                placeholder="Search roles, organisations, skills or cities..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <button
              onClick={() => {
                updateFilters({ search: searchInput });
                document
                  .getElementById("opportunity-results")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
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
                  if (item === "Remote") updateFilters({ locationType: "Remote" });
                  else if (item === "Programming") updateFilters({ skill: "Programming" });
                  else updateFilters({ category: item });
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
                  Show {totalCount} results
                </button>
              </aside>
            </div>
          )}

          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-900">
                  {totalCount}
                </span>{" "}
                {totalCount === 1 ? "opportunity" : "opportunities"} found
                {meta && meta.totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ""}
              </p>

              <button
                onClick={clearFilters}
                className="text-sm font-medium text-sky-600 hover:underline"
              >
                Reset search & filters
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="h-6 w-28 rounded-full bg-slate-200" />
                      <div className="h-6 w-6 rounded-full bg-slate-200" />
                    </div>
                    <div className="h-6 w-3/4 rounded-lg bg-slate-200 mb-2" />
                    <div className="h-4 w-1/3 rounded-lg bg-slate-100 mb-4" />
                    <div className="space-y-2 mb-6">
                      <div className="h-4 w-full rounded bg-slate-100" />
                      <div className="h-4 w-5/6 rounded bg-slate-100" />
                    </div>
                    <div className="space-y-2 mt-auto pt-4 border-t border-slate-100">
                      <div className="h-4 w-1/2 rounded bg-slate-100" />
                      <div className="h-4 w-1/3 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <AlertCircle className="mx-auto mb-3 text-red-500" size={36} />
                <h3 className="text-lg font-bold text-red-900">
                  Failed to load opportunities
                </h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <button
                  onClick={() => updateFilters({})}
                  className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredOpportunities.length === 0 ? (
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
              <>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {filteredOpportunities.map((opp) => {
                    const orgName = opp.org || opp.organisation?.org_name || "Organisation";
                    const oppSkills = opp.skills || opp.skills_required || [];
                    const oppLocation =
                      opp.location || opp.city || (opp.locationType === "Remote" || opp.location_type === "Remote" ? "Remote" : "Various");
                    const oppLocType = opp.locationType || opp.location_type || "On-site";
                    const deadlineFormatted = opp.deadline
                      ? (() => {
                          try {
                            const dateStr = opp.deadline.includes("T") ? opp.deadline : `${opp.deadline}T00:00:00`;
                            const d = new Date(dateStr);
                            return isNaN(d.getTime())
                              ? opp.deadline
                              : d.toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                });
                          } catch {
                            return opp.deadline;
                          }
                        })()
                      : null;

                    return (
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
                          {orgName}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {opp.description}
                        </p>

                        <div className="mt-5 space-y-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <MapPin size={17} className="shrink-0 text-sky-500" />
                            {oppLocation} · {oppLocType}
                          </div>
                          {(opp.duration || opp.points_reward || opp.pointsReward) && (
                            <div className="flex items-center gap-2">
                              <Clock size={17} className="shrink-0 text-sky-500" />
                              {opp.duration || "Flexible duration"}
                              {opp.points_reward ? ` · ${opp.points_reward} points` : ""}
                            </div>
                          )}
                          {deadlineFormatted && (
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={17}
                                className="shrink-0 text-sky-500"
                              />
                              Apply before {deadlineFormatted}
                            </div>
                          )}
                        </div>

                        {oppSkills.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {oppSkills.map((item) => (
                              <span
                                key={item}
                                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}

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
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
                  >
                    <div className="text-sm text-slate-600">
                      Showing{" "}
                      <span className="font-semibold text-slate-900">
                        {(currentPage - 1) * (meta?.limit ?? 10) + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-slate-900">
                        {Math.min(currentPage * (meta?.limit ?? 10), totalCount)}
                      </span>{" "}
                      of <span className="font-semibold text-slate-900">{totalCount}</span> opportunities
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        aria-label="Previous page"
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {pageNumbers.map((p, idx) =>
                          p === "..." ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className="px-2 text-sm text-slate-400"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={`page-${p}`}
                              onClick={() => goToPage(Number(p))}
                              aria-current={p === currentPage ? "page" : undefined}
                              className={`h-9 w-9 rounded-xl text-sm font-semibold transition ${
                                p === currentPage
                                  ? "bg-sky-500 text-white shadow-sm"
                                  : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        aria-label="Next page"
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </nav>
                )}
              </>
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
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </main>
      }
    >
      <OpportunitiesContent />
    </Suspense>
  );
}

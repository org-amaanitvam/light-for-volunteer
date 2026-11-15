"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Search,
  MapPin,
  Building2,
  Calendar,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  FileCheck,
  Clock,
  Compass,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { api, OpportunityItem } from "@/lib/api";

const CATEGORIES = [
  "All",
  "Education & Literacy",
  "Environment & Climate",
  "Healthcare & Mental Health",
  "Animal Welfare",
  "Community Outreach",
  "Skill Development & Livelihood",
];

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [opportunitiesError, setOpportunitiesError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadOpportunities = async () => {
      try {
        const result = await api.getOpportunities({ limit: 6, sortBy: "newest" });
        if (mounted) {
          setOpportunities(result.data);
          setOpportunitiesError(false);
        }
      } catch {
        if (mounted) setOpportunitiesError(true);
      } finally {
        if (mounted) setOpportunitiesLoading(false);
      }
    };

    void loadOpportunities();
    const refreshOnFocus = () => void loadOpportunities();
    window.addEventListener("focus", refreshOnFocus);
    const refreshTimer = window.setInterval(loadOpportunities, 20_000);
    return () => {
      mounted = false;
      window.removeEventListener("focus", refreshOnFocus);
      window.clearInterval(refreshTimer);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/opportunities?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/opportunities");
    }
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    if (cat !== "All") {
      router.push(`/opportunities?category=${encodeURIComponent(cat)}`);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesCat =
      selectedCategory === "All" || opp.category === selectedCategory;
    const location = opp.city || opp.locationType || opp.location_type || "Remote";
    const orgName = opp.organisation?.org_name || "Social impact organisation";
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const searchable = [
      opp.title,
      opp.description,
      orgName,
      location,
      opp.category,
      ...(opp.skills_required || opp.skills || []),
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = searchable.includes(normalizedQuery);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 
        HERO SECTION — Volunteer Yatra Design Direction
        Immersive Zephyr Landscape + Sunflower Yellow CTAs + Grounded Deep Teal Anchors
      */}
      <section className="relative overflow-hidden border-b border-[#e5e7eb] pt-8 pb-12 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28">
        {/* Full-Width Responsive Hero Background (Zephyr 032.png) */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-no-repeat pointer-events-none bg-[position:center_18%] sm:bg-[position:center_25%]"
          style={{
            backgroundImage: "url('/Zephyr%20032.png')",
          }}
          aria-hidden="true"
        >
          {/* Natural atmospheric overlay: preserves vibrant blue sky, cumulus clouds, and green rolling landscape */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/25 to-white/75" />
          {/* Soft central radial wash to guarantee AAA text contrast while keeping natural landscape visible on sides */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_35%,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.3)_60%,transparent_100%)]" />
          {/* Clean seamless transition into Featured Opportunities */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <ScrollReveal direction="up" className="w-full flex flex-col items-center">
            {/* Civic Trust Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#e5e7eb] text-[11px] sm:text-xs font-semibold text-[#26505c] mb-4 sm:mb-6 shadow-xs max-w-full text-center">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f3b61f] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffe970]" />
              </span>
              <span className="truncate">Volunteer Yatra • Amaanitvam Initiative</span>
              <span className="text-[#e5e7eb] hidden sm:inline">|</span>
              <span className="text-[#356775] font-medium hidden sm:inline">2026 Social Impact Drives Live</span>
            </div>

            {/* Centered Headline with Balanced Hierarchy */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1f2d35] leading-[1.15] sm:leading-[1.12] text-balance">
              Be the Light in Someone&apos;s World.{" "}
              <span className="text-[#26505c] block sm:inline">
                Volunteer for Causes That Matter.
              </span>
            </h1>

            {/* Centered Subtitle */}
            <p className="mt-3.5 sm:mt-5 text-sm sm:text-base text-[#356775] leading-relaxed max-w-2xl mx-auto font-normal">
              Discover verified volunteer opportunities, internships, and skill-based mentorships. Join thousands of passionate individuals collaborating with registered social impact organisations.
            </p>

            {/* Centered Primary CTAs */}
            <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
              <Link
                href="/signup/volunteer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#ffe970] hover:bg-[#f3b61f] text-[#26505c] font-bold text-sm sm:text-base rounded-2xl shadow-[0_2px_10px_rgba(255,233,112,0.4)] hover:shadow-[0_4px_16px_rgba(243,182,31,0.4)] transition-all active:scale-[0.97] w-full sm:w-auto h-12 sm:h-13"
              >
                Start Volunteering <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/signup/organisation"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-[#edf3f4] text-[#26505c] border border-[#26505c]/30 font-semibold text-sm sm:text-base rounded-2xl shadow-xs transition-all active:scale-[0.97] w-full sm:w-auto h-12 sm:h-13"
              >
                <Building2 className="w-4 h-4 text-[#26505c]" /> Post Opportunities (For NGOs)
              </Link>
            </div>

            {/* Centered Search Console */}
            <div className="mt-6 sm:mt-10 w-full max-w-3xl mx-auto rounded-2xl border border-[#e5e7eb] bg-white/95 backdrop-blur-md p-3.5 sm:p-5 shadow-[0_12px_36px_rgba(38,80,92,0.08)] text-left">
              <form onSubmit={handleSearchSubmit} role="search" className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <label htmlFor="homepage-search" className="sr-only">
                    Search volunteer opportunities by role, cause, or city
                  </label>
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#26505c]" />
                  <Input
                    id="homepage-search"
                    name="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by role, cause (e.g. Teaching, Climate), or city..."
                    className="pl-10 h-11 bg-white border-[#e5e7eb] text-sm text-[#1f2d35] placeholder:text-[#607b85] focus-visible:border-[#26505c] rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto h-11 px-6 inline-flex items-center justify-center rounded-xl bg-[#ffe970] hover:bg-[#f3b61f] text-[#26505c] font-bold text-sm shadow-[0_2px_8px_rgba(255,233,112,0.4)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26505c] active:scale-[0.97]"
                >
                  Explore Causes
                </button>
              </form>

              {/* Horizontal Category Quick Filters */}
              <div className="flex items-center gap-1.5 mt-3 sm:mt-3.5 overflow-x-auto pb-1 text-xs [scrollbar-width:none] [-ms-overflow-style:none]">
                <span className="text-[#26505c] font-bold text-xs shrink-0 mr-1">
                  Popular:
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#26505c] text-white shadow-xs"
                        : "bg-[#edf3f4] text-[#26505c] border border-transparent hover:border-[#26505c]/20 hover:bg-[#e2ebec]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 
        FEATURED OPPORTUNITIES SECTION
        Live API integration, high-density card grid
      */}
      <section id="opportunities" className="py-16 sm:py-20 bg-[#edf3f4]/40 border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold text-[#26505c] uppercase tracking-wider">
                  Verified Civic Drives
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f2d35] tracking-tight mt-1">
                  Featured Opportunities
                </h2>
                <p className="text-[#356775] text-sm mt-1">
                  Active drives from verified non-profit partners seeking dedicated volunteers.
                </p>
              </div>

              <Link
                href="/opportunities"
                className="text-sm font-semibold text-[#26505c] hover:text-[#1e3f49] hover:underline inline-flex items-center gap-1 shrink-0"
              >
                Browse all drives <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opp, index) => {
              const isVerifiedOrg = opp.organisation?.verification_status === "verified";
              const locationStr = opp.city || opp.locationType || opp.location_type || "Location in drive";
              const openingsStr =
                typeof opp.openings === "number"
                  ? opp.openings === 0
                    ? "Capacity reached"
                    : `${opp.openings} opening${opp.openings === 1 ? "" : "s"}`
                  : null;

              return (
                <ScrollReveal key={opp.id} delay={(index % 3) * 100} direction="up" className="h-full">
                  <Card
                    className="border-[#e5e7eb] bg-white hover:border-[#26505c]/40 hover:shadow-[0_8px_24px_rgba(38,80,92,0.08)] flex flex-col justify-between h-full rounded-2xl"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs bg-[#edf3f4] text-[#26505c] border-none font-semibold">
                          {opp.category}
                        </Badge>
                        {isVerifiedOrg && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#065f46] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                            <CheckCircle2 className="w-3 h-3 text-[#047857]" /> Verified NGO
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#1f2d35] line-clamp-2">
                        {opp.title}
                      </h3>

                      <div className="mt-4 space-y-2 text-xs text-[#356775]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-[#26505c] shrink-0" />
                          <span className="font-semibold text-[#1f2d35] truncate">
                            {opp.organisation?.org_name || "Community Organisation"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#26505c] shrink-0" />
                          <span className="truncate">{locationStr}</span>
                        </div>
                        {opp.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#26505c] shrink-0" />
                            <span>{opp.duration}</span>
                          </div>
                        )}
                        {openingsStr && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-[#26505c] shrink-0" />
                            <span className="tabular-nums">{openingsStr}</span>
                          </div>
                        )}
                        {opp.deadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#26505c] shrink-0" />
                            <span className="tabular-nums">Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#edf3f4] flex items-center justify-between text-xs">
                        <span className="text-[#607b85]">Recognition</span>
                        <span className="text-[#26505c] font-semibold truncate max-w-[170px] tabular-nums">
                          {opp.pointsReward || opp.points_reward
                            ? `${opp.pointsReward || opp.points_reward} impact points`
                            : opp.type || "Volunteer Drive"}
                        </span>
                      </div>
                    </CardContent>

                    <div className="p-6 pt-0">
                      <Link
                        href={`/opportunities/${opp.id}`}
                        className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-[#edf3f4] hover:bg-[#26505c] hover:text-white text-[#26505c] text-xs font-semibold transition-all"
                      >
                        View Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}

            {opportunitiesLoading && (
              <div className="col-span-full py-12 text-center text-sm text-[#607b85]">
                Loading approved community drives…
              </div>
            )}

            {!opportunitiesLoading && opportunitiesError && (
              <div className="col-span-full py-12 text-center text-sm text-[#d64545] bg-[#fef2f2] rounded-2xl border border-[#fecaca]">
                Unable to load drives at this moment. Please refresh or visit the{" "}
                <Link href="/opportunities" className="underline font-semibold text-[#d64545]">
                  opportunities catalog
                </Link>
                .
              </div>
            )}

            {!opportunitiesLoading && !opportunitiesError && filteredOpportunities.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-[#607b85] bg-white rounded-2xl border border-[#e5e7eb] p-8">
                No active drives match this category or query. Browse all available opportunities in the catalog.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 
        THE TRANSPARENT LEDGER — Three Architectural Pillars
      */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold text-[#26505c] uppercase tracking-wider">
                The Transparent Ledger
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f2d35] tracking-tight mt-1">
                Accountability in every volunteer hour.
              </h2>
              <p className="mt-2 text-sm text-[#356775] leading-relaxed">
                Volunteer Yatra provides a structured framework for community participation, ensuring reliable support for non-profits and verified records for volunteers.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0} direction="up" className="h-full">
              <div className="p-7 rounded-2xl border border-[#e5e7eb] bg-[#edf3f4]/50 shadow-[0_1px_3px_rgba(31,45,53,0.03)] hover:border-[#26505c]/30 hover:bg-white hover:shadow-[0_8px_20px_rgba(38,80,92,0.06)] transition-all h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-[#26505c] text-[#ffe970] flex items-center justify-center mb-5 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1f2d35]">Verified Non-Profit Partners</h3>
                <p className="text-xs text-[#356775] mt-2 leading-relaxed">
                  Registered non-profits submit structured drives with documented goals, defined role expectations, and committed coordinator points of contact.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120} direction="up" className="h-full">
              <div className="p-7 rounded-2xl border border-[#e5e7eb] bg-[#edf3f4]/50 shadow-[0_1px_3px_rgba(31,45,53,0.03)] hover:border-[#26505c]/30 hover:bg-white hover:shadow-[0_8px_20px_rgba(38,80,92,0.06)] transition-all h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-[#26505c] text-[#ffe970] flex items-center justify-center mb-5 shadow-xs">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1f2d35]">Tracked Applications &amp; Attendance</h3>
                <p className="text-xs text-[#356775] mt-2 leading-relaxed">
                  Volunteers submit structured applications and follow step-by-step progress from review to selection, attendance confirmation, and drive completion.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={240} direction="up" className="h-full">
              <div className="p-7 rounded-2xl border border-[#e5e7eb] bg-[#edf3f4]/50 shadow-[0_1px_3px_rgba(31,45,53,0.03)] hover:border-[#26505c]/30 hover:bg-white hover:shadow-[0_8px_20px_rgba(38,80,92,0.06)] transition-all h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-[#26505c] text-[#ffe970] flex items-center justify-center mb-5 shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1f2d35]">Documented Service Credentials</h3>
                <p className="text-xs text-[#356775] mt-2 leading-relaxed">
                  Complete drives to unlock verifiable certificates of completion, documented hours of civic contribution, and community recognition badges.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 
        PARTICIPATION PATHWAYS SECTION
        Dual columns for Volunteers and Organisations
      */}
      <section className="py-16 sm:py-20 bg-[#edf3f4]/40 border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold text-[#26505c] uppercase tracking-wider">
                Participation Pathways
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f2d35] tracking-tight mt-1">
                Structured journeys for volunteers and organisations.
              </h2>
              <p className="mt-2 text-sm text-[#356775] leading-relaxed">
                Clear, step-by-step processes designed for integrity, communication, and real civic impact.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Volunteer Pathway Card */}
            <ScrollReveal delay={0} direction="up" className="h-full">
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-7 sm:p-9 flex flex-col justify-between shadow-[0_2px_8px_rgba(31,45,53,0.03)] h-full">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edf3f4] border border-[#e5e7eb] text-xs font-bold text-[#26505c] mb-4">
                    <Compass className="w-3.5 h-3.5 text-[#26505c]" />
                    <span>For Volunteers &amp; Interns</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1f2d35]">
                    Contribute skills, track hours, and build a verified service record.
                  </h3>
                  <ul className="mt-6 space-y-4 text-xs text-[#356775]">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#26505c] text-[#ffe970] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <strong className="text-[#1f2d35] block text-xs font-bold">Create your profile</strong>
                        Highlight skills, availability, and social causes that matter to you.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#26505c] text-[#ffe970] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <strong className="text-[#1f2d35] block text-xs font-bold">Apply to verified drives</strong>
                        Submit structured applications with tailored pitches directly to organisations.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#26505c] text-[#ffe970] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <strong className="text-[#1f2d35] block text-xs font-bold">Complete service &amp; earn certificates</strong>
                        Receive coordinator attendance confirmation, hours tracking, and recognized certificates.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[#edf3f4]">
                  <Link
                    href="/signup/volunteer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#ffe970] hover:bg-[#f3b61f] text-[#26505c] text-sm font-bold shadow-xs transition-all active:scale-[0.97] w-full sm:w-auto"
                  >
                    Join as Volunteer <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* Organisation Pathway Card */}
            <ScrollReveal delay={150} direction="up" className="h-full">
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-7 sm:p-9 flex flex-col justify-between shadow-[0_2px_8px_rgba(31,45,53,0.03)] h-full">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edf3f4] border border-[#e5e7eb] text-xs font-bold text-[#26505c] mb-4">
                    <Building2 className="w-3.5 h-3.5 text-[#26505c]" />
                    <span>For Non-Profit Organisations</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1f2d35]">
                    Mobilize reliable volunteers for on-ground and digital initiatives.
                  </h3>
                  <ul className="mt-6 space-y-4 text-xs text-[#356775]">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#26505c] text-[#ffe970] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <strong className="text-[#1f2d35] block text-xs font-bold">Register your organisation</strong>
                        Submit official organisation details to join the Amaanitvam verified network.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#26505c] text-[#ffe970] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <strong className="text-[#1f2d35] block text-xs font-bold">Publish structured drives</strong>
                        Define role requirements, dates, locations, openings, and impact goals.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#26505c] text-[#ffe970] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <strong className="text-[#1f2d35] block text-xs font-bold">Review &amp; certify attendance</strong>
                        Shortlist applicants, coordinate with volunteers, and mark completed drives.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[#edf3f4]">
                  <Link
                    href="/signup/organisation"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#26505c] hover:bg-[#1e3f49] text-white text-sm font-semibold shadow-xs transition-all active:scale-[0.97] w-full sm:w-auto"
                  >
                    Register Organisation <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 
        INSTITUTIONAL CIVIC ACTION BANNER
        Authoritative Deep Teal Surface with Zephyr landscape texture & Sunflower Yellow CTA
      */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-[#26505c] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/Zephyr%20032.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#26505c] via-[#26505c]/95 to-[#1e3f49]/90 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
                  Ready to start your Volunteer Yatra?
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#edf3f4]/90 leading-relaxed">
                  Join the volunteer network today to discover verified opportunities, or register your organization to post community drives.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link
                  href="/signup/volunteer"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-[#ffe970] hover:bg-[#f3b61f] text-[#26505c] font-bold text-sm sm:text-base rounded-2xl shadow-md transition-all active:scale-[0.97]"
                >
                  Join as Volunteer
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-white/40 bg-transparent text-white hover:bg-white/10 rounded-2xl text-sm sm:text-base font-semibold transition-all active:scale-[0.97]"
                >
                  About Our Mission
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

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
import { buttonVariants } from "@/components/ui/button";
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
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* 
        HERO SECTION — Cinematic Civic Azure Treatment (Zephyr 032.png)
        Full-Width Natural Landscape + Deep Blue Cinematic Color Treatment + White Typography
      */}
      <section className="relative overflow-hidden border-b border-[#bae6fd]/40 pt-16 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        {/* Full-Width Responsive Hero Background (Zephyr 032.png) */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-no-repeat pointer-events-none bg-[position:center_20%] sm:bg-[position:center_28%]"
          style={{
            backgroundImage: "url('/Zephyr%20032.png')",
          }}
          aria-hidden="true"
        >
          {/* Deep Blue Cinematic Color Treatment preserving sky, sunlight, clouds, and green rolling hill */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c4a6e]/80 via-[#075985]/60 to-[#0c4a6e]/90" />
          {/* Subtle radial focus vignette to enrich photographic depth and ensure contrast */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_35%,rgba(7,89,133,0.3)_0%,rgba(12,74,110,0.7)_100%)]" />
          {/* Intentional clean transition from the deep photographic section to clean white content */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/70 to-transparent pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <ScrollReveal direction="up" className="w-full flex flex-col items-center">
            {/* Civic Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#e0f2fe] mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38bdf8]" />
              </span>
              <span>Amaanitvam Foundation Initiative</span>
              <span className="text-white/30">|</span>
              <span className="text-[#bae6fd] font-medium">2026 Social Impact Drives Live</span>
            </div>

            {/* Centered White Headline with Strong Hierarchy */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] text-balance drop-shadow-sm">
              Be the Light in Someone&apos;s World.{" "}
              <span className="text-[#38bdf8] block sm:inline">
                Volunteer for Causes That Matter.
              </span>
            </h1>

            {/* Centered Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-[#e0f2fe]/95 leading-relaxed max-w-2xl mx-auto font-normal drop-shadow-xs">
              Discover verified volunteer opportunities, internships, and skill-based mentorships. Join thousands of passionate individuals collaborating with registered social impact organisations.
            </p>

            {/* Centered Primary CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/signup/volunteer"
                className={buttonVariants({
                  size: "lg",
                  variant: "default",
                  className: "gap-2 px-8 justify-center bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-[0_8px_25px_rgba(2,132,199,0.4)] hover:shadow-[0_10px_30px_rgba(2,132,199,0.5)] transition-all font-bold w-full sm:w-auto border border-white/20",
                })}
              >
                Start Volunteering <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/signup/organisation"
                className={buttonVariants({
                  size: "lg",
                  variant: "secondary",
                  className: "gap-2 justify-center bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md shadow-xs transition-all font-semibold w-full sm:w-auto",
                })}
              >
                <Building2 className="w-4 h-4 text-[#38bdf8]" /> Post Opportunities (For NGOs)
              </Link>
            </div>

            {/* Centered Search Console */}
            <div className="mt-10 w-full max-w-3xl mx-auto rounded-2xl border border-white/30 bg-white/95 backdrop-blur-xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(12,74,110,0.3)] text-left">
              <form onSubmit={handleSearchSubmit} role="search" className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <label htmlFor="homepage-search" className="sr-only">
                    Search volunteer opportunities by role, cause, or city
                  </label>
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0369a1]" />
                  <Input
                    id="homepage-search"
                    name="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by role, cause (e.g. Teaching, Climate), or city..."
                    className="pl-10 h-11 bg-white border-[#bae6fd] text-sm text-[#0f2a43] placeholder:text-[#5a7b9d] focus-visible:border-[#0369a1] rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto h-11 px-6 inline-flex items-center justify-center rounded-xl bg-[#0369a1] hover:bg-[#075985] text-white font-bold text-sm shadow-[0_2px_8px_rgba(3,105,161,0.25)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1]"
                >
                  Explore Causes
                </button>
              </form>

              {/* Horizontal Category Quick Filters */}
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-3.5 overflow-x-auto pb-1 text-xs [scrollbar-width:none] [-ms-overflow-style:none]">
                <span className="text-[#0c4a6e] font-bold text-xs shrink-0 mr-1">
                  Popular:
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#0369a1] text-white shadow-xs"
                        : "bg-[#f0f7ff] text-[#335577] border border-[#bae6fd] hover:bg-[#e0f2fe] hover:text-[#0369a1]"
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
        Live API integration, high-density transparent card grid
      */}
      <section id="opportunities" className="py-16 sm:py-20 bg-[#f8fafc] border-b border-[#bae6fd]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold text-[#0369a1]">
                  Verified Civic Drives
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2a43] tracking-tight mt-1">
                  Featured Opportunities
                </h2>
                <p className="text-[#335577] text-sm mt-1">
                  Active drives from verified non-profit partners seeking dedicated volunteers.
                </p>
              </div>

              <Link
                href="/opportunities"
                className="text-sm font-semibold text-[#0369a1] hover:text-[#075985] hover:underline inline-flex items-center gap-1 shrink-0"
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
                    className="border-[#bae6fd]/80 bg-white hover:border-[#7dd3fc] hover:shadow-[0_4px_16px_rgba(3,105,161,0.08)] flex flex-col justify-between h-full"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {opp.category}
                        </Badge>
                        {isVerifiedOrg && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#065f46] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                            <CheckCircle2 className="w-3 h-3 text-[#047857]" /> Verified NGO
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#0f2a43] line-clamp-2">
                        {opp.title}
                      </h3>

                      <div className="mt-4 space-y-2 text-xs text-[#335577]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                          <span className="font-semibold text-[#0f2a43] truncate">
                            {opp.organisation?.org_name || "Community Organisation"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                          <span className="truncate">{locationStr}</span>
                        </div>
                        {opp.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                            <span>{opp.duration}</span>
                          </div>
                        )}
                        {openingsStr && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                            <span className="tabular-nums">{openingsStr}</span>
                          </div>
                        )}
                        {opp.deadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                            <span className="tabular-nums">Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#e2eaf2] flex items-center justify-between text-xs">
                        <span className="text-[#5a7b9d]">Recognition</span>
                        <span className="text-[#0369a1] font-semibold truncate max-w-[170px] tabular-nums">
                          {opp.pointsReward || opp.points_reward
                            ? `${opp.pointsReward || opp.points_reward} impact points`
                            : opp.type || "Volunteer Drive"}
                        </span>
                      </div>
                    </CardContent>

                    <div className="p-6 pt-0">
                      <Link
                        href={`/opportunities/${opp.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className: "w-full justify-center text-xs font-semibold",
                        })}
                      >
                        View Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}

            {opportunitiesLoading && (
              <div className="col-span-full py-12 text-center text-sm text-[#5a7b9d]">
                Loading approved community drives…
              </div>
            )}

            {!opportunitiesLoading && opportunitiesError && (
              <div className="col-span-full py-12 text-center text-sm text-[#b91c1c] bg-[#fef2f2] rounded-2xl border border-[#fecaca]">
                Unable to load drives at this moment. Please refresh or visit the{" "}
                <Link href="/opportunities" className="underline font-semibold text-[#b91c1c]">
                  opportunities catalog
                </Link>
                .
              </div>
            )}

            {!opportunitiesLoading && !opportunitiesError && filteredOpportunities.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-[#5a7b9d] bg-white rounded-2xl border border-[#bae6fd] p-8">
                No active drives match this category or query. Browse all available opportunities in the catalog.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 
        THE TRANSPARENT LEDGER — Three Architectural Pillars
        Clear explanation of platform value, accountability, and verification
      */}
      <section className="py-16 sm:py-20 bg-white/80 backdrop-blur-xs border-b border-[#bae6fd]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold text-[#0369a1]">
                The Transparent Ledger
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2a43] tracking-tight mt-1">
                Accountability in every volunteer hour.
              </h2>
              <p className="mt-2 text-sm text-[#335577] leading-relaxed">
                Light For Volunteer provides a structured framework for community participation, ensuring reliable support for non-profits and verified records for volunteers.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0} direction="up" className="h-full">
              <div className="p-6 rounded-2xl border border-[#bae6fd]/80 bg-[#f4f9ff] shadow-[0_1px_3px_rgba(15,42,67,0.03)] h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0f2a43]">Verified Non-Profit Partners</h3>
                <p className="text-xs text-[#335577] mt-2 leading-relaxed">
                  Registered non-profits submit structured drives with documented goals, defined role expectations, and committed coordinator points of contact.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120} direction="up" className="h-full">
              <div className="p-6 rounded-2xl border border-[#bae6fd]/80 bg-[#f4f9ff] shadow-[0_1px_3px_rgba(15,42,67,0.03)] h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] flex items-center justify-center mb-4">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0f2a43]">Tracked Applications &amp; Attendance</h3>
                <p className="text-xs text-[#335577] mt-2 leading-relaxed">
                  Volunteers submit structured applications and follow step-by-step progress from review to selection, attendance confirmation, and drive completion.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={240} direction="up" className="h-full">
              <div className="p-6 rounded-2xl border border-[#bae6fd]/80 bg-[#f4f9ff] shadow-[0_1px_3px_rgba(15,42,67,0.03)] h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] flex items-center justify-center mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0f2a43]">Documented Service Credentials</h3>
                <p className="text-xs text-[#335577] mt-2 leading-relaxed">
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
      <section className="py-16 sm:py-20 bg-[#f4f9ff]/70 backdrop-blur-xs border-b border-[#bae6fd]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold text-[#0369a1]">
                Participation Pathways
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2a43] tracking-tight mt-1">
                Structured journeys for volunteers and organisations.
              </h2>
              <p className="mt-2 text-sm text-[#335577] leading-relaxed">
                Clear, step-by-step processes designed for integrity, communication, and real civic impact.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Volunteer Pathway Card */}
            <ScrollReveal delay={0} direction="up" className="h-full">
              <div className="rounded-2xl border border-[#bae6fd] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-[0_2px_8px_rgba(15,42,67,0.03)] h-full">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e0f2fe] border border-[#bae6fd] text-xs font-bold text-[#075985] mb-4">
                    <Compass className="w-3.5 h-3.5 text-[#0369a1]" />
                    <span>For Volunteers &amp; Interns</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0f2a43]">
                    Contribute skills, track hours, and build a verified service record.
                  </h3>
                  <ul className="mt-6 space-y-4 text-xs text-[#335577]">
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#075985] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <strong className="text-[#0f2a43] block text-xs font-bold">Create your profile</strong>
                        Highlight skills, availability, and social causes that matter to you.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#075985] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <strong className="text-[#0f2a43] block text-xs font-bold">Apply to verified drives</strong>
                        Submit structured applications with tailored pitches directly to organisations.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#075985] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <strong className="text-[#0f2a43] block text-xs font-bold">Complete service &amp; earn certificates</strong>
                        Receive coordinator attendance confirmation, hours tracking, and recognized certificates.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[#e2eaf2]">
                  <Link
                    href="/signup/volunteer"
                    className={buttonVariants({
                      variant: "default",
                      size: "sm",
                      className: "w-full sm:w-auto font-semibold gap-1.5",
                    })}
                  >
                    Join as Volunteer <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* Organisation Pathway Card */}
            <ScrollReveal delay={150} direction="up" className="h-full">
              <div className="rounded-2xl border border-[#bae6fd] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-[0_2px_8px_rgba(15,42,67,0.03)] h-full">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e0f2fe] border border-[#bae6fd] text-xs font-bold text-[#075985] mb-4">
                    <Building2 className="w-3.5 h-3.5 text-[#0369a1]" />
                    <span>For Non-Profit Organisations</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0f2a43]">
                    Mobilize reliable volunteers for on-ground and digital initiatives.
                  </h3>
                  <ul className="mt-6 space-y-4 text-xs text-[#335577]">
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#075985] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <strong className="text-[#0f2a43] block text-xs font-bold">Register your organisation</strong>
                        Submit official organisation details to join the Amaanitvam verified network.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#075985] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <strong className="text-[#0f2a43] block text-xs font-bold">Publish structured drives</strong>
                        Define role requirements, dates, locations, openings, and impact goals.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#075985] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <strong className="text-[#0f2a43] block text-xs font-bold">Review &amp; certify attendance</strong>
                        Shortlist applicants, coordinate with volunteers, and mark completed drives.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[#e2eaf2]">
                  <Link
                    href="/signup/organisation"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm",
                      className: "w-full sm:w-auto font-semibold gap-1.5",
                    })}
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
        Authoritative Midnight Blue Surface with Zephyr landscape texture
      */}
      <section className="relative overflow-hidden py-14 sm:py-16 bg-[#0f2a43] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/Zephyr%20032.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2a43] via-[#0f2a43]/90 to-[#075985]/80 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                  Ready to contribute to your community?
                </h2>
                <p className="mt-2 text-sm text-[#93c5fd] leading-relaxed">
                  Join the Amaanitvam volunteer network today to discover verified opportunities, or register your organization to post community drives.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link
                  href="/signup/volunteer"
                  className={buttonVariants({
                    size: "lg",
                    className: "bg-[#0369a1] hover:bg-[#075985] text-white font-semibold px-6 justify-center shadow-[0_2px_8px_rgba(3,105,161,0.4)]",
                  })}
                >
                  Join as Volunteer
                </Link>
                <Link
                  href="/about"
                  className={buttonVariants({
                    size: "lg",
                    className: "border border-white/40 bg-transparent text-white hover:bg-white/10 hover:border-white hover:text-white justify-center",
                  })}
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

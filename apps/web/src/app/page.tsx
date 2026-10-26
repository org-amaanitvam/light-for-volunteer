"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Search,
  MapPin,
  Building2,
  Calendar,
  Users,
  Award,
  BookOpen,
  Heart,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORIES = [
  { name: "All", count: "120+" },
  { name: "Education & Literacy", count: "45" },
  { name: "Environment & Climate", count: "32" },
  { name: "Healthcare & Mental Health", count: "28" },
  { name: "Animal Welfare", count: "15" },
  { name: "Community Outreach", count: "30" },
];

const FEATURED_OPPORTUNITIES = [
  {
    id: "opp-1",
    title: "Youth Coding & Digital Literacy Mentor",
    org: "Hope EdTech Foundation",
    location: "New Delhi (Hybrid)",
    category: "Education & Literacy",
    commitment: "4 hrs/week",
    stipend: "Verified Certificate & Letter of Recommendation",
    spotsLeft: 3,
    urgent: true,
  },
  {
    id: "opp-2",
    title: "Urban Tree Plantation & Soil Revival Volunteer",
    org: "Green Canopy Project",
    location: "Bengaluru, Karnataka",
    category: "Environment & Climate",
    commitment: "Weekend Drive",
    stipend: "Volunteer T-Shirt & Impact Badge",
    spotsLeft: 12,
    urgent: false,
  },
  {
    id: "opp-3",
    title: "Community Nutrition & Health Camp Assistant",
    org: "Aarogya Seva Trust",
    location: "Mumbai, Maharashtra",
    category: "Healthcare & Mental Health",
    commitment: "6 hrs/week",
    stipend: "Field Experience Certificate",
    spotsLeft: 5,
    urgent: false,
  },
];

const STATS = [
  { label: "Active Volunteers", value: "8,500+", icon: Users },
  { label: "Partner NGOs & Non-profits", value: "320+", icon: Building2 },
  { label: "Hours of Social Impact", value: "45,000+", icon: Heart },
  { label: "Badges & Certificates Issued", value: "6,200+", icon: Award },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOpportunities = FEATURED_OPPORTUNITIES.filter((opp) => {
    const matchesCat =
      selectedCategory === "All" || opp.category === selectedCategory;
    const matchesQuery =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-sky-100/70 via-sky-50/40 to-white">
        {/* Decorative backdrop elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-sky-300/20 via-cyan-200/20 to-sky-400/20 blur-3xl -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Pill announcement */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-sky-200 text-sky-700 text-xs sm:text-sm font-medium shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-4 h-4 text-sky-500 animate-spin-slow" />
            <span>Amaanitvam Foundation Initiative</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-sky-800">2026 Social Impact Drives Live</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-tight">
            Be the Light in Someone’s World.{" "}
            <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-500 bg-clip-text text-transparent">
              Volunteer for Causes That Matter.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover verified volunteer opportunities, internships, and skill-based mentorships.
            Join thousands of passionate individuals collaborating with registered social impact organisations.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup/volunteer">
              <Button size="lg" variant="gradient" className="w-full sm:w-auto gap-2 px-8">
                Start Volunteering <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/signup/organisation">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-sky-300 text-sky-800 hover:bg-sky-50">
                <Building2 className="w-4 h-4 text-sky-600" /> Post Opportunities (For NGOs)
              </Button>
            </Link>
          </div>

          {/* Search Box Card */}
          <div className="mt-12 max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl border border-sky-200 p-3 sm:p-4 shadow-xl shadow-sky-500/10">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by role, cause (e.g. Teaching, Climate), or city..."
                  className="pl-10 h-12 bg-slate-50/50 border-sky-100 text-sm placeholder:text-slate-400"
                />
              </div>
              <Button className="w-full sm:w-auto h-12 px-6 bg-sky-500 hover:bg-sky-600 text-white font-semibold">
                Explore Causes
              </Button>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-medium shrink-0">Popular:</span>
              {CATEGORIES.slice(0, 4).map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === c.name
                      ? "bg-sky-500 text-white font-medium shadow-sm"
                      : "bg-sky-50 text-sky-800 hover:bg-sky-100"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="border-y border-sky-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center text-center p-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section id="opportunities" className="py-20 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">
                <TrendingUp className="w-4 h-4" /> Fresh Drives & Internships
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Opportunities
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Verified causes looking for committed volunteers right now
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.name
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                      : "bg-white text-slate-600 border border-sky-100 hover:bg-sky-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opp) => (
              <Card
                key={opp.id}
                className="hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="secondary" className="bg-sky-100 text-sky-800 text-xs">
                      {opp.category}
                    </Badge>
                    {opp.urgent && (
                      <Badge variant="destructive" className="text-[10px] uppercase">
                        Urgent
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">
                    {opp.title}
                  </h3>

                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-sky-500" />
                      <span className="font-semibold text-slate-700">{opp.org}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-500" />
                      <span>{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      <span>Commitment: {opp.commitment}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-sky-100/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Perks:</span>
                      <span className="text-sky-700 font-medium truncate max-w-[180px]">
                        {opp.stipend}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <div className="p-6 pt-0">
                  <Link href={`/signup/volunteer?role=volunteer&apply=${opp.id}`}>
                    <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold">
                      Apply as Volunteer <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Light For Volunteer / Trust Badges */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Why Amaanitvam
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Building a Credible & Rewarding Volunteer Ecosystem
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              We bridge the gap between volunteers seeking authentic experience and organisations that need verified support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50 transition">
              <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center mb-4 shadow-md shadow-sky-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">100% Verified Non-Profits</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Every NGO undergoes document verification (80G/12A and registration validity) before listing drives on the portal.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50 transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-500 text-white flex items-center justify-center mb-4 shadow-md shadow-cyan-500/20">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Gamified Badges & Certificates</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Earn verifiable digital credentials, tracked hours, and milestone badges to showcase on your CV and LinkedIn.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50 transition">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-4 shadow-md shadow-sky-600/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Mentorship & Resources</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Gain access to workshops, volunteering toolkits, and mentor feedback to build leadership skills through service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to make an impact in your community?
          </h2>
          <p className="mt-4 text-base text-sky-100 max-w-xl mx-auto">
            Join the Amaanitvam Volunteer Network today. It takes less than 2 minutes to create your profile.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup/volunteer">
              <Button size="lg" className="bg-white text-sky-700 hover:bg-sky-50 font-bold px-8 shadow-lg">
                Create Volunteer Account
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white/60 text-white hover:bg-white/10">
                Learn About Our Mission
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ARTICLES = [
  {
    id: "guide-first-time-volunteering",
    title: "The Ultimate Guide to Starting Your Volunteering Journey in 2026",
    excerpt:
      "Everything you need to know about choosing the right cause, understanding non-profit requirements, and preparing for your first volunteer orientation.",
    category: "Guides",
    date: "Oct 12, 2026",
    readTime: "5 min read",
    author: "Ananya Sen, Volunteer Lead",
  },
  {
    id: "impact-ngo-verification",
    title: "Why Vetting Matters: How Amaanitvam Protects Social Impact Integrity",
    excerpt:
      "A deep dive into our 80G/12A verification process that gives volunteers and donors absolute confidence in the legitimacy of grassroots causes.",
    category: "Transparency",
    date: "Sep 28, 2026",
    readTime: "4 min read",
    author: "Impact Research Team",
  },
  {
    id: "skills-based-volunteering",
    title: "Skills-Based Volunteering: Accelerate Your Career While Giving Back",
    excerpt:
      "How software engineers, designers, and marketers are using pro-bono work to build portfolios, gain leadership badges, and make real community impact.",
    category: "Career & Skills",
    date: "Sep 15, 2026",
    readTime: "6 min read",
    author: "Karan Mehta, Tech For Good",
  },
];

export const metadata = {
  title: "Blog & Resources | Light For Volunteer",
  description:
    "Guides, toolkits, and inspirational stories from the Amaanitvam Volunteer Network.",
};

export default function BlogPage() {
  return (
    <div className="py-16 sm:py-24 bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-4">
            <BookOpen className="w-4 h-4" /> Resources & Stories
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Knowledge for Changemakers
          </h1>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">
            Discover volunteer best practices, NGO toolkits, and real stories of social transformation.
          </p>
        </div>

        {/* Featured Card */}
        <div className="mb-12 rounded-3xl border border-sky-200 bg-gradient-to-br from-white via-sky-50/50 to-cyan-50/30 p-8 sm:p-10 shadow-lg shadow-sky-500/5">
          <div className="max-w-3xl">
            <Badge variant="default" className="bg-sky-500 text-white mb-3 text-xs">
              Featured Resource
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Amaanitvam Volunteer Handbook & Social Leadership Guide (PDF)
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Download our comprehensive handbook covering codes of conduct, field safety guidelines,
              effective community communication, and step-by-step badge tracking.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-500" /> Updated for 2026
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" /> Free Download
              </span>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ARTICLES.map((art) => (
            <Card
              key={art.id}
              className="hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <Badge variant="secondary" className="bg-sky-100 text-sky-800">
                    {art.category}
                  </Badge>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {art.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition leading-snug">
                  {art.title}
                </h3>

                <p className="mt-2.5 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>

                <div className="mt-6 pt-4 border-t border-sky-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">{art.author}</span>
                  <span className="text-sky-600 font-semibold flex items-center gap-1">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

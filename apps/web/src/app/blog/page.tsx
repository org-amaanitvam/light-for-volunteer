import React from "react";
import { BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

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
    <div className="min-h-screen bg-[#f8fbff]">
      {/* Architectural Header Section with Zephyr Background */}
      <section className="relative overflow-hidden border-b border-[#bae6fd]/80 bg-white py-12 sm:py-16">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/Zephyr%20032.png')",
            backgroundPosition: "center 22%",
          }}
          aria-hidden="true"
        />
        {/* Daylight gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/45 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f8fbff] via-[#f8fbff]/70 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#bae6fd] text-[#0369a1] text-xs font-semibold mb-4 shadow-xs">
                <BookOpen className="w-4 h-4 text-[#0284c7]" /> Resources &amp; Stories
              </div>
              <h1 className="text-4xl font-black text-[#0f2a43] tracking-tight sm:text-5xl">
                Knowledge for <span className="text-[#0284c7]">Changemakers</span>
              </h1>
              <p className="mt-4 text-[#335577] text-sm sm:text-base">
                Discover volunteer best practices, NGO toolkits, and real stories of social transformation.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* Featured Resource Card with ScrollReveal */}
        <ScrollReveal delay={0} direction="up" className="mb-12">
          <div className="rounded-3xl border border-[#bae6fd] bg-gradient-to-br from-white via-[#f4f9ff] to-[#e0f2fe]/40 p-8 sm:p-10 shadow-xs hover:border-[#7dd3fc] hover:shadow-[0_4px_20px_rgba(3,105,161,0.08)] transition">
            <div className="max-w-3xl">
              <Badge variant="default" className="bg-[#0369a1] hover:bg-[#075985] text-white mb-3 text-xs">
                Featured Resource
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2a43] leading-tight">
                Amaanitvam Volunteer Handbook &amp; Social Leadership Guide (PDF)
              </h2>
              <p className="mt-3 text-sm text-[#335577] leading-relaxed">
                Download our comprehensive handbook covering codes of conduct, field safety guidelines,
                effective community communication, and step-by-step badge tracking.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#5a7b9d]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#0369a1]" /> Updated for 2026
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#0369a1]" /> Free Download
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Articles Grid with Staggered ScrollReveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ARTICLES.map((art, index) => (
            <ScrollReveal key={art.id} delay={(index % 3) * 100} direction="up" className="h-full">
              <Card
                className="border-[#bae6fd]/80 bg-white hover:border-[#7dd3fc] hover:shadow-[0_4px_16px_rgba(3,105,161,0.08)] transition-all flex flex-col justify-between h-full"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <Badge variant="secondary" className="bg-[#e0f2fe] text-[#075985] border border-[#bae6fd]">
                      {art.category}
                    </Badge>
                    <span className="text-[#5a7b9d] text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#0369a1]" /> {art.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0f2a43] group-hover:text-[#0369a1] transition leading-snug">
                    {art.title}
                  </h3>

                  <p className="mt-2.5 text-xs text-[#335577] line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>

                  <div className="mt-6 pt-4 border-t border-[#e2eaf2] flex items-center justify-between text-xs">
                    <span className="text-[#5a7b9d] text-[11px]">{art.author}</span>
                    <span className="text-[#0369a1] font-semibold flex items-center gap-1">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}

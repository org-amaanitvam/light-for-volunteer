import React from "react";
import Link from "next/link";
import { HeartHandshake, Target, Users2, ShieldCheck, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us | Light For Volunteer",
  description:
    "Learn about Amaanitvam Foundation and our mission with the Light For Volunteer initiative.",
};

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-24 bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-4">
            <HeartHandshake className="w-4 h-4" /> Amaanitvam Foundation Initiative
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Illuminating the Path to{" "}
            <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              Collective Social Impact
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
            Light For Volunteer was born out of a simple realization: thousands of non-profits struggle
            to find dependable, skilled volunteers, while countless passionate people seek trustworthy
            channels to give back.
          </p>
        </div>

        {/* Pillars / Values */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Purposeful Matches</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              We move beyond generic volunteering. We match skills—from tech mentors and creative
              designers to grassroots field workers—with non-profits where they make the most impact.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Trust & Transparency</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Trust is the backbone of social work. Every organisation listed on our platform is
              vetted, ensuring your time and effort truly serve beneficiaries in need.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Recognition & Growth</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Volunteering is reciprocal. We recognize your dedication through digital certificates,
              verified volunteer hours, and mentorship to help you grow as a changemaker.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-600 text-white p-8 sm:p-14">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
              Our Vision
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-2 sm:text-4xl">
              Building a culture where volunteering is accessible to all.
            </h2>
            <p className="mt-4 text-sky-100 text-sm sm:text-base leading-relaxed">
              Whether you can contribute 2 hours over the weekend planting trees or 6 months mentoring
              underprivileged students in coding, your time creates ripples of positive change.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup/volunteer">
                <Button size="lg" className="bg-white text-sky-800 hover:bg-sky-50 font-bold rounded-xl shadow-md">
                  Join the Movement <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-xl">
                  Contact Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

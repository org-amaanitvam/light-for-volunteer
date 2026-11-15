import React from "react";
import Link from "next/link";
import { HeartHandshake, Target, ShieldCheck, Award, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata = {
  title: "About Us | Light For Volunteer",
  description:
    "Learn about Amaanitvam Foundation and our mission with the Light For Volunteer initiative.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Architectural Header Section with Zephyr Background */}
      <section className="relative overflow-hidden border-b border-[#e5e7eb] bg-white py-14 sm:py-20">
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
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#e5e7eb] text-[#26505c] text-xs font-semibold mb-4 shadow-xs">
                <HeartHandshake className="w-4 h-4 text-[#f3b61f]" /> Amaanitvam Foundation Initiative
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#1f2d35] tracking-tight">
                Illuminating the Path to <span className="text-[#26505c]">Collective Social Impact</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-[#356775] leading-relaxed">
                Light For Volunteer was born out of a simple realization: thousands of non-profits struggle
                to find dependable, skilled volunteers, while countless passionate people seek trustworthy
                channels to give back.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Pillars / Values with Staggered ScrollReveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal delay={0} direction="up" className="h-full">
            <div className="p-8 rounded-2xl bg-white border border-[#e5e7eb] shadow-xs hover:border-[#26505c]/30 hover:shadow-[0_8px_24px_rgba(38,80,92,0.08)] transition h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#26505c] text-[#ffe970] shadow-xs flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1f2d35]">Purposeful Matches</h3>
              <p className="mt-3 text-sm text-[#607b85] leading-relaxed">
                We move beyond generic volunteering. We match skills—from tech mentors and creative
                designers to grassroots field workers—with non-profits where they make the most impact.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120} direction="up" className="h-full">
            <div className="p-8 rounded-2xl bg-white border border-[#e5e7eb] shadow-xs hover:border-[#26505c]/30 hover:shadow-[0_8px_24px_rgba(38,80,92,0.08)] transition h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#26505c] text-[#ffe970] shadow-xs flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1f2d35]">Trust &amp; Transparency</h3>
              <p className="mt-3 text-sm text-[#607b85] leading-relaxed">
                Trust is the backbone of social work. Every organisation listed on our platform is
                vetted, ensuring your time and effort truly serve beneficiaries in need.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={240} direction="up" className="h-full">
            <div className="p-8 rounded-2xl bg-white border border-[#e5e7eb] shadow-xs hover:border-[#26505c]/30 hover:shadow-[0_8px_24px_rgba(38,80,92,0.08)] transition h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#26505c] text-[#ffe970] shadow-xs flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1f2d35]">Recognition &amp; Growth</h3>
              <p className="mt-3 text-sm text-[#607b85] leading-relaxed">
                Volunteering is reciprocal. We recognize your dedication through digital certificates,
                verified volunteer hours, and mentorship to help you grow as a changemaker.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Story Section with Deep Teal Accent Overlay */}
        <ScrollReveal delay={150} direction="up" className="mt-20">
          <div className="relative overflow-hidden rounded-3xl bg-[#26505c] text-white p-8 sm:p-14 border border-[#26505c] shadow-lg">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none"
              style={{ backgroundImage: "url('/Zephyr%20032.png')" }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#26505c] via-[#26505c]/95 to-[#1a3840]/90 pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ffe970]">
                Our Vision
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-2 sm:text-4xl text-white">
                Building a culture where volunteering is accessible to all.
              </h2>
              <p className="mt-4 text-[#edf3f4] text-sm sm:text-base leading-relaxed">
                Whether you can contribute 2 hours over the weekend planting trees or 6 months mentoring
                underprivileged students in coding, your time creates ripples of positive change.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup/volunteer"
                  className={buttonVariants({
                    size: "lg",
                    variant: "secondary",
                    className: "font-bold text-[#26505c]",
                  })}
                >
                  Join the Movement <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
                <Link
                  href="/contact"
                  className={buttonVariants({
                    size: "lg",
                    variant: "outline",
                    className: "border-[#ffe970]/50 text-[#ffe970] hover:bg-[#ffe970]/10",
                  })}
                >
                  Contact Our Team
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

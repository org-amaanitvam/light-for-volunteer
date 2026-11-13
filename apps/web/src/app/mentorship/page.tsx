"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, MapPin, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useAuth } from "@/context/auth-context";
import { api, type MentorItem } from "@/lib/api";

export default function MentorshipPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .getMentors()
      .then((items) => {
        if (active) setMentors(items);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load mentors.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function messageMentor(mentorId: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    window.dispatchEvent(
      new CustomEvent("lfv:message-user", { detail: { recipientId: mentorId } })
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-[#0f2a43]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#bae6fd]/40 bg-[#0c4a6e] py-14 sm:py-16">
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

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-[#e0f2fe] shadow-xs">
              <Users className="h-3.5 w-3.5 text-[#38bdf8]" />
              <span>Civic Mentorship Ledger</span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Learn from people who care.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#e0f2fe]/90 sm:text-base">
              Connect with registered mentors who can share guidance on volunteering, skills, and social impact work.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Mentor Directory Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold">Unable to load mentors</p>
              <p className="mt-0.5 text-xs text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#bae6fd]/60 bg-white p-6 shadow-xs animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#e0f2fe]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-[#e2eaf2]" />
                    <div className="h-3 w-1/2 rounded bg-[#f4f9ff]" />
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="h-3 w-full rounded bg-[#f4f9ff]" />
                  <div className="h-3 w-5/6 rounded bg-[#f4f9ff]" />
                  <div className="h-3 w-4/6 rounded bg-[#f4f9ff]" />
                </div>
                <div className="mt-5 h-9 w-full rounded-xl bg-[#e0f2fe]" />
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-[#bae6fd] bg-white p-12 text-center shadow-xs sm:p-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#0369a1]">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#0f2a43]">
              No mentors have joined yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#5a7b9d] sm:text-sm">
              Register as a mentor and help volunteers build skills for their next opportunity.
            </p>
            <Button
              className="mt-6 rounded-xl bg-[#0369a1] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#075985]"
              onClick={() => router.push("/signup/mentor")}
            >
              Join as a mentor
            </Button>
          </div>
        ) : (
          /* Mentor Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor, index) => (
              <ScrollReveal key={mentor.id} delay={(index % 3) * 100} direction="up" className="h-full">
                <article
                  className="flex flex-col justify-between rounded-2xl border border-[#bae6fd]/80 bg-white p-6 shadow-xs transition duration-200 hover:border-[#7dd3fc] hover:shadow-[0_4px_20px_rgba(3,105,161,0.08)] h-full"
                >
                  <div>
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] text-base font-bold text-[#0369a1] shadow-xs">
                        {mentor.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-bold text-[#0f2a43]">
                          {mentor.name}
                        </h2>
                        {mentor.headline && (
                          <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[#0369a1]">
                            {mentor.headline}
                          </p>
                        )}
                        {mentor.city && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#5a7b9d]">
                            <MapPin className="h-3 w-3 shrink-0 text-[#0284c7]" />
                            <span className="truncate">{mentor.city}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-[#335577]">
                      {mentor.about || "A community mentor ready to support volunteers."}
                    </p>

                    {mentor.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {mentor.skills.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-[#bae6fd]/60 bg-[#f4f9ff] px-2 py-0.5 text-[11px] font-medium text-[#075985]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t border-[#e2eaf2] pt-4">
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2 rounded-xl border-[#bae6fd] bg-white text-xs font-semibold text-[#0369a1] hover:bg-[#e0f2fe]/40 hover:text-[#0c4a6e]"
                      onClick={() => messageMentor(mentor.id)}
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-[#0284c7]" />
                      <span>Message mentor</span>
                    </Button>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

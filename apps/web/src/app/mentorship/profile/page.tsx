"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export default function MentorProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "mentor") {
      router.replace("/");
      return;
    }

    let active = true;
    api
      .getMyMentorProfile()
      .then((profile) => {
        if (!active) return;
        setHeadline(profile.headline || "");
        setAbout(profile.about || "");
        setSkills(profile.skills ? profile.skills.join(", ") : "");
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setErrorMessage(
          reason instanceof Error ? reason.message : "Could not load mentor profile."
        );
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user, router]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const saved = await api.updateMyMentorProfile({
        headline,
        about,
        skills: skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setSkills(saved.skills.join(", "));
      setMessage("Your mentor profile is saved and visible in the directory.");
    } catch (reason) {
      setErrorMessage(
        reason instanceof Error ? reason.message : "Could not save mentor profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loadingProfile) {
    return (
      <main className="min-h-screen bg-transparent py-16 text-center text-xs text-[#5a7b9d]">
        Loading mentor profile…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-[#0f2a43] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/mentorship"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0369a1] hover:text-[#075985]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Mentorship Directory</span>
          </Link>
        </div>

        {/* Header Block with Consistent Zephyr Horizon */}
        <div className="relative overflow-hidden rounded-3xl border border-[#bae6fd]/80 bg-white p-6 shadow-xs sm:p-8">
          {/* Subtle top horizon image strip */}
          <div className="relative -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 p-6 sm:p-8 border-b border-[#bae6fd]/80 overflow-hidden bg-white">
            <div
              className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
              style={{
                backgroundImage: "url('/Zephyr%20032.png')",
                backgroundPosition: "center 22%",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/45 pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#bae6fd] bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[#0369a1]">
                  <UserCheck className="h-3.5 w-3.5 text-[#0284c7]" />
                  <span>Mentor Identity Ledger</span>
                </div>
                <h1 className="mt-3 text-2xl font-black tracking-tight text-[#0f2a43] sm:text-3xl">
                  Mentor Profile
                </h1>
                <p className="mt-1 text-xs leading-relaxed text-[#335577] sm:text-sm">
                  Add your focus areas and guidance scope so volunteers can discover and contact you.
                </p>
              </div>

              <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-md border border-[#bae6fd] text-[#0369a1]">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Feedback Banners */}
          {message && (
            <div
              role="status"
              className="mt-6 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-semibold text-emerald-900"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs font-semibold text-red-900"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(event) => void save(event)} className="mt-6 space-y-6">
            <div>
              <label htmlFor="headline" className="block text-xs font-bold uppercase tracking-wider text-[#0c4a6e]">
                Headline <span className="font-normal text-[#5a7b9d]">(Max 160 characters)</span>
              </label>
              <input
                id="headline"
                maxLength={160}
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="e.g. Climate education and community organising"
                className="mt-2 w-full rounded-xl border border-[#bae6fd] bg-[#f8fbff] p-3 text-xs font-normal text-[#0f2a43] outline-none transition focus:border-[#0369a1] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe]"
              />
              <p className="mt-1 text-right text-[11px] font-medium text-[#5a7b9d] tabular-nums">
                {headline.length} / 160
              </p>
            </div>

            <div>
              <label htmlFor="about" className="block text-xs font-bold uppercase tracking-wider text-[#0c4a6e]">
                About &amp; Guidance Scope <span className="font-normal text-[#5a7b9d]">(Max 3000 characters)</span>
              </label>
              <textarea
                id="about"
                maxLength={3000}
                rows={5}
                value={about}
                onChange={(event) => setAbout(event.target.value)}
                placeholder="Share your background, fields of experience, and how you support volunteers."
                className="mt-2 w-full rounded-xl border border-[#bae6fd] bg-[#f8fbff] p-3 text-xs font-normal text-[#0f2a43] outline-none transition focus:border-[#0369a1] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe]"
              />
              <p className="mt-1 text-right text-[11px] font-medium text-[#5a7b9d] tabular-nums">
                {about.length} / 3000
              </p>
            </div>

            <div>
              <label htmlFor="skills" className="block text-xs font-bold uppercase tracking-wider text-[#0c4a6e]">
                Skills and Focus Areas <span className="font-normal text-[#5a7b9d]">(Comma separated)</span>
              </label>
              <input
                id="skills"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="Fundraising, mentoring, public health, campaign strategy"
                className="mt-2 w-full rounded-xl border border-[#bae6fd] bg-[#f8fbff] p-3 text-xs font-normal text-[#0f2a43] outline-none transition focus:border-[#0369a1] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe]"
              />
              <p className="mt-1 text-[11px] text-[#5a7b9d]">
                Separate skills with commas (e.g. Grassroots Leadership, Field Logistics).
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#0369a1] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#075985] disabled:opacity-60 cursor-pointer"
              >
                {saving ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

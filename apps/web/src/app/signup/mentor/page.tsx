"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Compass,
  CalendarCheck2,
  Medal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { sanitizeRedirect } from "@/lib/utils";

export default function MentorSignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = await api.signup({
        name: name.trim(),
        email,
        password,
        role: "mentor",
        city: city.trim() || undefined,
      });
      setUser(result.user);
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      const sanitized = sanitizeRedirect(requestedNext);
      const destination = sanitized || "/mentorship/profile";
      router.push(destination);
    } catch (reason: unknown) {
      if (reason instanceof Error) {
        setError(reason.message);
      } else {
        setError("Could not establish your mentor account. Please verify all fields.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-transparent py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Mentor Charter Column */}
        <div className="lg:col-span-5 bg-[#0C4A6E] rounded-3xl p-7 sm:p-9 text-white flex flex-col justify-between shadow-[0_12px_32px_rgba(12,74,110,0.15)] relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity pointer-events-none"
            style={{ backgroundImage: "url('/Zephyr%20032.png')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C4A6E]/85 via-[#0C4A6E]/75 to-[#075985]/80 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide uppercase text-[#E0F2FE]">
              <GraduationCap className="w-3.5 h-3.5 text-[#93C5FD]" />
              Civic Advisory Council
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Guide emerging grassroots leaders
              </h1>
              <p className="text-sm text-[#E0F2FE]/90 leading-relaxed">
                Join our curated advisory registry. Mentor passionate volunteers, review grassroots project plans, and contribute your professional wisdom to civic initiatives.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#0369A1] flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4 text-[#E0F2FE]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">1-on-1 Domain Mentorship</div>
                  <div className="text-[11px] text-[#E0F2FE]/80 mt-0.5">
                    Provide directional guidance in social impact, environment, literacy, and community skills.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#0369A1] flex items-center justify-center shrink-0">
                  <CalendarCheck2 className="w-4 h-4 text-[#E0F2FE]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Autonomous Availability</div>
                  <div className="text-[11px] text-[#E0F2FE]/80 mt-0.5">
                    Set your own mentoring cadence and review volunteer advisory requests at your pace.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#0369A1] flex items-center justify-center shrink-0">
                  <Medal className="w-4 h-4 text-[#E0F2FE]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Directory Profile & Recognition</div>
                  <div className="text-[11px] text-[#E0F2FE]/80 mt-0.5">
                    Showcase your background and skills in the public mentor directory to advise active volunteers.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/15 text-[11px] text-[#E0F2FE]/70 flex items-center justify-between">
            <span>Amaanitvam Foundation Advisory</span>
            <span>Ethical Mentorship Code</span>
          </div>
        </div>

        {/* Right Form Card Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#BAE6FD] p-7 sm:p-9 shadow-[0_4px_24px_rgba(3,105,161,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E0F2FE] pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F2A43] tracking-tight">Mentor Registration</h2>
                <p className="text-xs text-[#475569] mt-0.5">Register to advise and guide active volunteers</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#F4F9FF] border border-[#BAE6FD] text-[11px] font-semibold text-[#0369A1]">
                Advisory Role
              </span>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="mentor-name"
                  className="block text-xs font-semibold text-[#0F2A43] mb-1.5"
                >
                  Full Legal Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <Input
                    id="mentor-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kulkarni"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="mentor-email"
                  className="block text-xs font-semibold text-[#0F2A43] mb-1.5"
                >
                  Official Email Address <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <Input
                    id="mentor-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh@institution.org"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="mentor-password"
                    className="block text-xs font-semibold text-[#0F2A43]"
                  >
                    Create Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <span className="text-[11px] text-[#64748B]">Minimum 8 characters</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <Input
                    id="mentor-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F2A43] p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="mentor-city"
                  className="block text-xs font-semibold text-[#0F2A43] mb-1.5"
                >
                  City / Location Base <span className="text-[11px] font-normal text-[#64748B]">(Optional)</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <Input
                    id="mentor-city"
                    type="text"
                    maxLength={128}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Hyderabad, Bengaluru, Remote"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F4F9FF] border border-[#BAE6FD] text-xs space-y-1">
                <div className="font-semibold text-[#075985] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0369A1]" />
                  Amaanitvam Mentor Community
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Upon registration, you will be directed to your profile where you can declare your domains of expertise, set your session availability, and begin advising.
                </p>
              </div>

              <Button
                type="submit"
                disabled={saving}
                variant="default"
                className="w-full mt-2 h-11 text-sm font-semibold tracking-wide"
              >
                {saving ? "Registering Mentor..." : "Complete Mentor Registration"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </div>

          <div className="mt-6 pt-5 border-t border-[#E0F2FE]">
            <p className="text-xs text-[#475569] text-center mb-2.5 font-medium">
              Looking for volunteer sign-up or organisation registration?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
              <Link
                href="/login"
                className="font-semibold text-[#0369A1] hover:text-[#075985] underline underline-offset-2"
              >
                Sign In to Existing Account
              </Link>
              <span className="text-[#CBD5E1]" aria-hidden="true">
                •
              </span>
              <Link
                href="/signup/volunteer"
                className="font-semibold text-[#0369A1] hover:text-[#075985] underline underline-offset-2"
              >
                Join as Volunteer
              </Link>
              <span className="text-[#CBD5E1]" aria-hidden="true">
                •
              </span>
              <Link
                href="/signup/organisation"
                className="font-semibold text-[#0369A1] hover:text-[#075985] underline underline-offset-2"
              >
                Register an Organisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

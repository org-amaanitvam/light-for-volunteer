"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  Users2,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export default function OrganisationSignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.signup({
        name: contactPerson.trim(),
        email,
        password,
        role: "organisation",
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
      });
      setUser(res.user);

      try {
        await api.createMyOrganisation({ orgName: orgName.trim() });
        router.push("/organisation/dashboard");
      } catch {
        // Recovery path: User account is created and authenticated.
        // Redirect to /organisation/profile so they can complete organisation profile setup without getting stuck.
        router.push("/organisation/profile");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (/already in use|conflict/i.test(err.message)) {
          setError(
            "An account with this email address already exists. If your registration was interrupted, please sign in to complete your organisation profile."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to register organisation. Please verify all fields and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-transparent py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Institutional Charter Column */}
        <div className="lg:col-span-5 bg-[#0C4A6E] rounded-3xl p-7 sm:p-9 text-white flex flex-col justify-between shadow-[0_12px_32px_rgba(12,74,110,0.15)] relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity pointer-events-none"
            style={{ backgroundImage: "url('/Zephyr%20032.png')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C4A6E]/85 via-[#0C4A6E]/75 to-[#075985]/80 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide uppercase text-[#E0F2FE]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#93C5FD]" />
              Institutional Partner Charter
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Mobilise volunteers with civic authority
              </h1>
              <p className="text-sm text-[#E0F2FE]/90 leading-relaxed">
                Empower your NGO, non-profit or institution. Post verified community drives, coordinate volunteers, and issue recognized completion certificates.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#0369A1] flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4 text-[#E0F2FE]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Institutional Trust Seal</div>
                  <div className="text-[11px] text-[#E0F2FE]/80 mt-0.5">
                    Verification pathway for NGO Darpan, Section 8, or Trust accreditation.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#0369A1] flex items-center justify-center shrink-0">
                  <Users2 className="w-4 h-4 text-[#E0F2FE]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Drive Management</div>
                  <div className="text-[11px] text-[#E0F2FE]/80 mt-0.5">
                    Screen candidate applications, coordinate volunteer roles, and record completed service hours.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#0369A1] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#E0F2FE]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Direct Certificate Issuance</div>
                  <div className="text-[11px] text-[#E0F2FE]/80 mt-0.5">
                    Issue verifiable service certificates directly to attendees upon drive completion.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/15 text-[11px] text-[#E0F2FE]/70 flex items-center justify-between">
            <span>Verified Non-Profit Portal</span>
            <span>Zero Brokerage</span>
          </div>
        </div>

        {/* Right Form Card Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#BAE6FD] p-7 sm:p-9 shadow-[0_4px_24px_rgba(3,105,161,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E0F2FE] pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F2A43] tracking-tight">Register Organisation</h2>
                <p className="text-xs text-[#475569] mt-0.5">Register your institution to launch and coordinate drives</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#F4F9FF] border border-[#BAE6FD] text-[11px] font-semibold text-[#0369A1]">
                Institutional Entity
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
                  htmlFor="org-name"
                  className="block text-xs font-semibold text-[#0F2A43] mb-1.5"
                >
                  Organisation / NGO Legal Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <Input
                    id="org-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={140}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Green Earth Foundation"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="org-contact"
                  className="block text-xs font-semibold text-[#0F2A43] mb-1.5"
                >
                  Authorized Contact Representative <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <Input
                    id="org-contact"
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Priya Nair (Executive Director)"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="org-email"
                  className="block text-xs font-semibold text-[#0F2A43] mb-1.5"
                >
                  Official Organisation Email <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <Input
                    id="org-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@greenearth.org"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="org-password"
                    className="block text-xs font-semibold text-[#0F2A43]"
                  >
                    Master Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <span className="text-[11px] text-[#64748B]">Minimum 8 characters</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <Input
                    id="org-password"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="org-phone"
                    className="block text-xs font-semibold text-[#0F2A43] mb-1.5"
                  >
                    Official Phone <span className="text-[11px] font-normal text-[#64748B]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                    <Input
                      id="org-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 11 2345 6789"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="org-city"
                    className="block text-xs font-semibold text-[#0F2A43] mb-1.5"
                  >
                    City / Headquarter <span className="text-[11px] font-normal text-[#64748B]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                    <Input
                      id="org-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New Delhi, Pune"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F4F9FF] border border-[#BAE6FD] text-xs space-y-1">
                <div className="font-semibold text-[#075985] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0369A1]" />
                  Amaanitvam Foundation Verification Review
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Following registration, submit your official documentation (such as NGO Darpan, Section 8, or Trust credentials) to receive a verified organisation badge upon administrative review.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="default"
                className="w-full mt-2 h-11 text-sm font-semibold tracking-wide"
              >
                {loading ? "Registering Organisation..." : "Complete Organisation Registration"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </div>

          <div className="mt-6 pt-5 border-t border-[#E0F2FE]">
            <p className="text-xs text-[#475569] text-center mb-2.5 font-medium">
              Looking for individual volunteer registration or existing sign-in?
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
                href="/signup/mentor"
                className="font-semibold text-[#0369A1] hover:text-[#075985] underline underline-offset-2"
              >
                Apply as Mentor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

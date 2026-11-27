"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL, api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { sanitizeRedirect } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleRole, setGoogleRole] = useState<"volunteer" | "organisation" | "mentor">("volunteer");

  useEffect(() => {
    api
      .googleAuthEnabled()
      .then(setGoogleEnabled)
      .catch(() => setGoogleEnabled(false));
  }, []);

  function continueWithGoogle() {
    if (!API_BASE_URL) return;
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    const sanitizedNext = sanitizeRedirect(requestedNext);
    localStorage.setItem("lfv_google_role", googleRole);
    localStorage.setItem("lfv_google_next", sanitizedNext || "");
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${API_BASE_URL}/auth/google`);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      const sanitized = sanitizeRedirect(requestedNext);
      let next =
        sanitized
          ? sanitized
          : res.user.role === "admin"
          ? "/organisation/admin"
          : res.user.role === "organisation"
          ? "/organisation/dashboard"
          : "/volunteer/dashboard";

      if (!sanitized && res.user.role === "organisation") {
        try {
          await api.getMyOrganisation();
        } catch {
          next = "/organisation/profile";
        }
      }

      router.push(next);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password. Please verify your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-transparent py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Dossier Information Column */}
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
              Secure Identity Ledger
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Welcome back to Light for Volunteer
              </h1>
              <p className="text-sm text-[#E0F2FE]/90 leading-relaxed">
                Access your verified civic contribution records, drive management tools, or mentorship schedules through an authoritative, transparent ledger.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#0369A1] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-[#E0F2FE]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Volunteers</div>
                  <div className="text-[11px] text-[#E0F2FE]/80">Track service hours, verified impact credits, and digital certificates.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#0369A1] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#E0F2FE]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Organisations</div>
                  <div className="text-[11px] text-[#E0F2FE]/80">Manage active drives, approve applications, and issue validated transcripts.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#0369A1] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#E0F2FE]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Mentors</div>
                  <div className="text-[11px] text-[#E0F2FE]/80">Conduct advisory sessions and guide emerging civic contributors.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/15 text-[11px] text-[#E0F2FE]/70 flex items-center justify-between">
            <span>Amaanitvam Foundation</span>
            <span>Civic Trust Protocol</span>
          </div>
        </div>

        {/* Right Form Card Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#BAE6FD] p-7 sm:p-9 shadow-[0_4px_24px_rgba(3,105,161,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E0F2FE] pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F2A43] tracking-tight">Account Sign In</h2>
                <p className="text-xs text-[#475569] mt-0.5">Enter your registered email and password to authenticate</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#F4F9FF] border border-[#BAE6FD] text-[11px] font-semibold text-[#0369A1]">
                v2.1 Secured
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
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-[#0F2A43] mb-1.5"
                >
                  Email Address <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <Input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-[#0F2A43]"
                  >
                    Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <span className="text-[11px] text-[#64748B]">Case-sensitive</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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

              <Button
                type="submit"
                disabled={loading}
                variant="default"
                className="w-full mt-2 h-11 text-sm font-semibold tracking-wide"
              >
                {loading ? "Authenticating..." : "Sign In to Account"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {googleEnabled && (
              <div className="mt-6 pt-5 border-t border-[#E0F2FE] space-y-3">
                <div className="text-center">
                  <span className="text-xs font-semibold text-[#475569]">
                    Or continue with verified Google identity
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="google-role"
                    className="block text-[11px] font-medium text-[#475569]"
                  >
                    If first-time Google sign-in, assign account role:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "volunteer", label: "Volunteer" },
                        { id: "organisation", label: "Organisation" },
                        { id: "mentor", label: "Mentor" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGoogleRole(item.id)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                          googleRole === item.id
                            ? "bg-[#E0F2FE] text-[#075985] border-[#0369A1] shadow-sm"
                            : "bg-white text-[#475569] border-[#BAE6FD] hover:bg-[#F4F9FF]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={continueWithGoogle}
                  className="w-full h-11 border-[#BAE6FD] text-[#0F2A43] hover:bg-[#F4F9FF] font-semibold"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-[#E0F2FE]">
            <p className="text-xs text-[#475569] text-center mb-2.5 font-medium">
              Don&apos;t have an account yet? Register under your role:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
              <Link
                href="/signup/volunteer"
                className="font-semibold text-[#0369A1] hover:text-[#075985] underline underline-offset-2"
              >
                Volunteer Signup
              </Link>
              <span className="text-[#CBD5E1]" aria-hidden="true">
                •
              </span>
              <Link
                href="/signup/organisation"
                className="font-semibold text-[#0369A1] hover:text-[#075985] underline underline-offset-2"
              >
                Organisation Register
              </Link>
              <span className="text-[#CBD5E1]" aria-hidden="true">
                •
              </span>
              <Link
                href="/signup/mentor"
                className="font-semibold text-[#0369A1] hover:text-[#075985] underline underline-offset-2"
              >
                Mentor Enrolment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

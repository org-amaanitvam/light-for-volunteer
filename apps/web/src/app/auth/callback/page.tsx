"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { sanitizeRedirect } from "@/lib/utils";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState("");
  const [statusStep, setStatusStep] = useState<"verifying" | "establishing" | "complete">("establishing");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let active = true;

    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      queueMicrotask(() => {
        if (active) setError("Google sign-in did not return an authorization code. Please try again.");
      });
      return () => {
        active = false;
      };
    }

    const role = localStorage.getItem("lfv_google_role");
    const chosenRole = role === "organisation" || role === "mentor" ? role : "volunteer";

    void api
      .exchangeGoogleCode(code, chosenRole)
      .then(async (result) => {
        if (!active) return;
        setUser(result.user);
        setStatusStep("complete");

        const next = localStorage.getItem("lfv_google_next") || "";
        localStorage.removeItem("lfv_google_role");
        localStorage.removeItem("lfv_google_next");

        const sanitized = sanitizeRedirect(next);
        let destination =
          sanitized
            ? sanitized
            : result.user.role === "organisation"
            ? "/organisation/dashboard"
            : result.user.role === "mentor"
            ? "/mentorship/profile"
            : result.user.role === "admin"
            ? "/organisation/admin"
            : "/volunteer/dashboard";

        if (!sanitized && result.user.role === "organisation") {
          try {
            await api.getMyOrganisation();
          } catch {
            destination = "/organisation/profile";
          }
        }

        router.replace(destination);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Google authorization exchange failed. Please verify your internet connection and try again."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [router, setUser]);

  return (
    <div className="min-h-[80vh] bg-[#F4F9FF] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <main className="max-w-md w-full bg-white rounded-3xl border border-[#BAE6FD] p-8 sm:p-10 shadow-[0_4px_24px_rgba(3,105,161,0.06)] text-center">
        {/* Verification Icon Header */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0369A1] mb-5 shadow-sm">
          {error ? (
            <AlertCircle className="w-7 h-7 text-[#DC2626]" />
          ) : statusStep === "complete" ? (
            <CheckCircle2 className="w-7 h-7 text-[#0369A1]" />
          ) : (
            <Loader2 className="w-7 h-7 animate-spin text-[#0369A1]" />
          )}
        </div>

        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F9FF] border border-[#BAE6FD] text-[11px] font-semibold uppercase tracking-wider text-[#0369A1]">
            <ShieldCheck className="w-3.5 h-3.5" />
            OAuth Verification Protocol
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2A43] tracking-tight">
            {error ? "Sign-in Verification Halted" : "Signing You In…"}
          </h1>
          <p className="text-xs text-[#475569] leading-relaxed">
            {error
              ? "We could not establish your session through Google OAuth."
              : "Exchanging cryptographic authorization tokens and configuring your role-specific dashboard."}
          </p>
        </div>

        {/* Status Stepper / Progress Ledger */}
        {!error && (
          <div className="my-6 p-4 rounded-2xl bg-[#F4F9FF] border border-[#E0F2FE] text-left space-y-2.5">
            <div className="flex items-center gap-3 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#0369A1]" />
              <span className="font-semibold text-[#0F2A43]">
                {statusStep === "verifying" ? "Validating code with server…" : "Authorization code received"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  statusStep === "establishing" || statusStep === "complete"
                    ? "bg-[#0369A1] animate-pulse"
                    : "bg-[#CBD5E1]"
                }`}
              />
              <span
                className={
                  statusStep === "establishing" || statusStep === "complete"
                    ? "font-semibold text-[#0F2A43]"
                    : "text-[#64748B]"
                }
              >
                {statusStep === "complete" ? "Session established" : "Exchanging session tokens…"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  statusStep === "complete" ? "bg-[#0369A1]" : "bg-[#CBD5E1]"
                }`}
              />
              <span className={statusStep === "complete" ? "font-semibold text-[#0F2A43]" : "text-[#64748B]"}>
                Redirecting to workspace…
              </span>
            </div>
          </div>
        )}

        {/* Error State Presentation */}
        {error && (
          <div className="space-y-5 my-6">
            <div
              role="alert"
              aria-live="assertive"
              className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs text-left"
            >
              <div className="font-bold flex items-center gap-1.5 mb-1 text-[#DC2626]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Authentication Error
              </div>
              <p className="leading-relaxed">{error}</p>
            </div>

            <div className="space-y-2.5">
              <Button
                variant="default"
                onClick={() => router.replace("/login")}
                className="w-full h-11 text-xs font-semibold"
              >
                Return to Login <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Link
                href="/"
                className="inline-block text-xs font-semibold text-[#0369A1] hover:underline"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#E0F2FE] text-[11px] text-[#64748B]">
          Light for Volunteer Identity Service · Amaanitvam Foundation
        </div>
      </main>
    </div>
  );
}

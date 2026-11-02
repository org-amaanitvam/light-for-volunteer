"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState("");
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
      return () => { active = false; };
    }
    const role = localStorage.getItem("lfv_google_role");
    const chosenRole = role === "organisation" || role === "mentor" ? role : "volunteer";
    void api.exchangeGoogleCode(code, chosenRole).then(async (result) => {
      if (!active) return;
      setUser(result.user);
      const next = localStorage.getItem("lfv_google_next") || "";
      localStorage.removeItem("lfv_google_role"); localStorage.removeItem("lfv_google_next");
      let destination = next.startsWith("/") && !next.startsWith("//") ? next : result.user.role === "organisation" ? "/organisation/dashboard" : result.user.role === "mentor" ? "/mentorship/profile" : result.user.role === "admin" ? "/organisation/admin" : "/volunteer/dashboard";
      if (!next && result.user.role === "organisation") {
        try { await api.getMyOrganisation(); } catch { destination = "/organisation/profile"; }
      }
      router.replace(destination);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Google sign-in failed. Please try again.");
    });
    return () => { active = false; };
  }, [router, setUser]);

  return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center"><h1 className="text-2xl font-bold text-slate-900">Signing you in…</h1>{error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={() => router.replace("/login")} className="ml-2 font-semibold underline">Return to login</button></div>}</main>;
}

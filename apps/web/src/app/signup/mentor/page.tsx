"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";

export default function MentorSignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const result = await api.signup({ name: name.trim(), email, password, role: "mentor", city: city.trim() || undefined });
      setUser(result.user);
      router.push("/mentorship/profile");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create your mentor account."); }
    finally { setSaving(false); }
  }

  return <main className="flex min-h-[80vh] items-center justify-center bg-sky-50/50 px-4 py-12"><form onSubmit={(event) => void submit(event)} className="w-full max-w-lg space-y-5 rounded-3xl border border-sky-100 bg-white p-7 shadow-sm sm:p-9"><div><p className="text-sm font-semibold text-sky-600">Light For Volunteer</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900">Join as a mentor</h1><p className="mt-2 text-sm text-slate-500">Share your experience and help volunteers grow.</p></div>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<label className="block text-sm font-medium">Full name<input required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm font-medium">Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm font-medium">Password<input type="password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm font-medium">City (optional)<input maxLength={128} value={city} onChange={(event) => setCity(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><button disabled={saving} className="w-full rounded-xl bg-sky-500 p-3 font-semibold text-white hover:bg-sky-600 disabled:opacity-60">{saving ? "Creating account…" : "Create mentor account"}</button><p className="text-center text-xs text-slate-500">Already registered? <Link href="/login" className="font-semibold text-sky-700">Log in</Link></p></form></main>;
}

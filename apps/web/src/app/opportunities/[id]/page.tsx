"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { api, OpportunityItem } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

function OpportunityDetailsContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [opportunity, setOpportunity] = useState<OpportunityItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [pitch, setPitch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.getOpportunityById(id)
      .then((item) => { if (active) setOpportunity(item); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load this opportunity.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!opportunity || user?.role !== "volunteer") return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.createApplication(opportunity.id, pitch.trim());
      setMessage("Your application has been submitted.");
      setPitch("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not submit your application.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || authLoading) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">Loading opportunity…</main>;
  }
  if (!opportunity) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-center"><p className="text-slate-600">{error || "Opportunity not found."}</p><Link href="/opportunities" className="mt-4 inline-block text-sky-700 underline">Browse opportunities</Link></main>;
  }

  const location = opportunity.city || opportunity.locationType || opportunity.location_type || "Remote";
  const loginHref = `/login?next=${encodeURIComponent(`/opportunities/${opportunity.id}`)}`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <Link href="/opportunities" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline"><ArrowLeft size={17} /> All opportunities</Link>
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{opportunity.category}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{opportunity.type}</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">{opportunity.title}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600">{opportunity.organisation?.org_name || "Social impact organisation"}</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2"><MapPin size={16} />{location}</span>
          <span className="inline-flex items-center gap-2"><Users size={16} />{opportunity.openings || 1} openings</span>
          {opportunity.deadline && <span className="inline-flex items-center gap-2"><CalendarDays size={16} />Apply by {new Date(`${opportunity.deadline.slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN")}</span>}
        </div>
        <section className="mt-8 border-t border-slate-100 pt-7">
          <h2 className="text-lg font-bold text-slate-900">About this opportunity</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{opportunity.description}</p>
          {opportunity.skills_required?.length ? <div className="mt-5 flex flex-wrap gap-2">{opportunity.skills_required.map((skill) => <span key={skill} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">{skill}</span>)}</div> : null}
        </section>
        <section className="mt-9 rounded-2xl bg-sky-50/70 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Apply as a volunteer</h2>
          {message && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message} <Link href="/volunteer/applications" className="font-semibold underline">View applications</Link></p>}
          {error && !loading && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!user ? <p className="mt-2 text-sm text-slate-600">Sign in with a volunteer account to send an application. <Link href={loginHref} className="font-semibold text-sky-700 underline">Sign in</Link></p> : user.role !== "volunteer" ? <p className="mt-2 text-sm text-slate-600">Applications can be submitted from a volunteer account.</p> : <form onSubmit={apply} className="mt-4 space-y-3">
            <label htmlFor="application-pitch" className="block text-sm font-medium text-slate-700">Tell the organisation why you’re interested</label>
            <textarea id="application-pitch" required minLength={10} maxLength={5000} value={pitch} onChange={(event) => setPitch(event.target.value)} rows={5} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" placeholder="Share relevant skills, experience, and availability." />
            <button disabled={saving} className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">{saving ? "Submitting…" : "Submit application"}</button>
          </form>}
        </section>
      </article>
    </main>
  );
}

export default function OpportunityDetailsPage() {
  return <Suspense fallback={<main className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">Loading opportunity…</main>}><OpportunityDetailsContent /></Suspense>;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export default function MentorProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "mentor") router.replace("/");
    else api.getMyMentorProfile().then((profile) => { setHeadline(profile.headline); setAbout(profile.about); setSkills(profile.skills.join(", ")); }).catch((reason: unknown) => setMessage(reason instanceof Error ? reason.message : "Could not load mentor profile."));
  }, [authLoading, user, router]);

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const saved = await api.updateMyMentorProfile({ headline, about, skills: skills.split(",").map((item) => item.trim()).filter(Boolean) });
      setSkills(saved.skills.join(", ")); setMessage("Your mentor profile is saved and visible in the directory.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Could not save mentor profile."); }
    finally { setSaving(false); }
  }

  return <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-10"><h1 className="text-3xl font-extrabold text-slate-900">Mentor profile</h1><p className="mt-2 text-sm text-slate-500">Add your focus areas so volunteers can find and contact you.</p>{message && <p role="status" className="mt-4 rounded-xl bg-sky-50 p-3 text-sm text-sky-800">{message}</p>}<form onSubmit={(event) => void save(event)} className="mt-6 space-y-5 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"><label className="block text-sm font-semibold">Headline<input maxLength={160} value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="e.g. Climate education and community organising" className="mt-2 w-full rounded-xl border p-3 font-normal" /></label><label className="block text-sm font-semibold">About<textarea maxLength={3000} rows={5} value={about} onChange={(event) => setAbout(event.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label><label className="block text-sm font-semibold">Skills and focus areas<input value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Fundraising, mentoring, public health" className="mt-2 w-full rounded-xl border p-3 font-normal" /></label><button disabled={saving} className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save profile"}</button></form></main>;
}

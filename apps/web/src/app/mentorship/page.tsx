"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    api.getMentors().then((items) => { if (active) setMentors(items); }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Could not load mentors.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function messageMentor(mentorId: string) {
    if (!user) { router.push("/login"); return; }
    window.dispatchEvent(new CustomEvent("lfv:message-user", { detail: { recipientId: mentorId } }));
  }

  return <main className="min-h-screen bg-slate-50"><section className="bg-gradient-to-br from-sky-100 via-white to-cyan-50"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-sky-700"><Users className="h-4 w-4" /> Community support</div><h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900">Learn from people who care.</h1><p className="mt-3 max-w-2xl text-slate-600">Connect with registered mentors who can share guidance on volunteering, skills, and social impact work.</p></div></section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{loading ? <p className="py-12 text-center text-sm text-slate-500">Loading mentors…</p> : mentors.length === 0 ? <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-12 text-center"><Users className="mx-auto h-8 w-8 text-sky-500" /><h2 className="mt-3 font-bold text-slate-900">No mentors have joined yet</h2><p className="mt-2 text-sm text-slate-500">Register as a mentor and help volunteers build skills for their next opportunity.</p><Button className="mt-5" onClick={() => router.push("/signup/mentor")}>Join as a mentor</Button></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{mentors.map((mentor) => <article key={mentor.id} className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-lg font-bold text-sky-700">{mentor.name.slice(0,1).toUpperCase()}</div><h2 className="mt-4 text-lg font-bold text-slate-900">{mentor.name}</h2>{mentor.headline && <p className="mt-1 text-sm font-medium text-sky-700">{mentor.headline}</p>}{mentor.city && <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{mentor.city}</p>}<p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{mentor.about || "A community mentor ready to support volunteers."}</p>{mentor.skills.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{mentor.skills.slice(0,6).map((skill) => <span key={skill} className="rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-700">{skill}</span>)}</div>}<Button className="mt-5 w-full" onClick={() => messageMentor(mentor.id)}><MessageCircle className="mr-2 h-4 w-4" />Message mentor</Button></article>)}</div>}</section>
  </main>;
}

"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VolunteerProfileData } from "@/types/volunteer";
import {
  MOCK_VOLUNTEER_PROFILE,
  calculateProfileCompletion,
} from "@/lib/volunteer-mock-adapter";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-base ${
            star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs font-semibold text-slate-600">
        {rating.toFixed(1)} / 5.0
      </span>
    </div>
  );
}

export default function VolunteerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VolunteerProfileData>(MOCK_VOLUNTEER_PROFILE);
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    headline: profile.headline ?? "",
    about: profile.about ?? "",
    skillsInput: profile.skills.join(", "),
    portfolioInput: profile.portfolioLinks.join(", "),
    resumeUrl: profile.resumeUrl ?? "",
  });

  const completion = calculateProfileCompletion(user, profile);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "V";

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.headline.trim()) {
      errs.headline = "Headline cannot be empty.";
    }
    if (!form.about.trim()) {
      errs.about = "About description is required.";
    }
    if (form.resumeUrl.trim()) {
      try {
        new URL(form.resumeUrl);
      } catch {
        errs.resumeUrl = "Resume link must be a valid URL (e.g., https://...).";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const parsedSkills = form.skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedLinks = form.portfolioInput
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    setProfile((prev) => ({
      ...prev,
      headline: form.headline.trim(),
      about: form.about.trim(),
      skills: parsedSkills,
      portfolioLinks: parsedLinks,
      resumeUrl: form.resumeUrl.trim() || null,
    }));

    setEditing(false);
    setSaveStatus(
      "Local profile preview updated. Note: Persistent saving will activate once the backend volunteer profile PUT/PATCH endpoint is available."
    );
  }

  function handleCancel() {
    setForm({
      headline: profile.headline ?? "",
      about: profile.about ?? "",
      skillsInput: profile.skills.join(", "),
      portfolioInput: profile.portfolioLinks.join(", "),
      resumeUrl: profile.resumeUrl ?? "",
    });
    setErrors({});
    setEditing(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Volunteer Profile &amp; Portfolio
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal profile, showcase your social impact track record, and update skills.
          </p>
        </div>
        {!editing ? (
          <Button
            onClick={() => {
              setSaveStatus(null);
              setEditing(true);
            }}
            className="self-start sm:self-auto gap-2"
          >
            <span>✏️</span> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2 self-start sm:self-auto">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {saveStatus && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm text-sky-800">
          {saveStatus}
        </div>
      )}

      <Card className="border-sky-100/80 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-800">
              Profile Completeness Score
            </CardTitle>
            <span className="text-lg font-bold text-sky-600">{completion.percentage}%</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-sky-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${completion.percentage}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {completion.items.map((item) => (
              <span
                key={item.key}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                  item.completed
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {item.completed ? "✓" : "○"} {item.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-sky-100/80 shadow-sm">
        <div className="h-24 bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-400" />
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-sky-500 to-cyan-600 text-2xl font-bold text-white shadow-lg">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name ?? "Avatar"}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{user?.name ?? "Volunteer"}</h2>
                  <Badge variant="secondary" className="font-semibold text-sky-800">
                    Verified
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="pt-1">
                  <StarRating rating={profile.ratingAvg} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 sm:text-right">
              <div className="rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2">
                <p className="text-xl font-extrabold text-sky-600">{profile.points}</p>
                <p className="text-[11px] font-medium text-slate-500">Impact Points</p>
              </div>
              <div className="rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2">
                <p className="text-xl font-extrabold text-sky-600">{profile.totalHours} hrs</p>
                <p className="text-[11px] font-medium text-slate-500">Verified Time</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-sky-100/60 pt-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">📍 City:</span>
              <span>{user?.city ?? "Not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">📞 Phone:</span>
              <span>{user?.phone ?? "Not provided"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">📅 Member Since:</span>
              <span>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Active Contributor"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">📄 Resume:</span>
              {profile.resumeUrl ? (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sky-600 hover:underline"
                >
                  View Document ↗
                </a>
              ) : (
                <span className="text-slate-400">Not uploaded</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="border-sky-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Edit Profile Information</CardTitle>
              <CardDescription>
                Updates will be reflected locally in your session. Backend persistence will connect once the profile endpoint is ready.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Headline *
                </label>
                <Input
                  name="headline"
                  value={form.headline}
                  onChange={handleInputChange}
                  placeholder="e.g. Enthusiastic Volunteer | Education & Community Lead"
                  className={errors.headline ? "border-red-400" : ""}
                />
                {errors.headline && (
                  <p className="mt-1 text-xs text-red-600">{errors.headline}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  About / Bio *
                </label>
                <textarea
                  name="about"
                  value={form.about}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Share your passion, causes you care about, and experience..."
                  className={`flex w-full rounded-xl border bg-white/90 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 shadow-sm ${
                    errors.about ? "border-red-400" : "border-sky-100"
                  }`}
                />
                {errors.about && (
                  <p className="mt-1 text-xs text-red-600">{errors.about}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skills (comma-separated)
                </label>
                <Input
                  name="skillsInput"
                  value={form.skillsInput}
                  onChange={handleInputChange}
                  placeholder="Teaching, Event Planning, First Aid, Translation"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portfolio / Social Links (comma-separated URLs)
                </label>
                <Input
                  name="portfolioInput"
                  value={form.portfolioInput}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/..., https://github.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resume Link (URL)
                </label>
                <Input
                  name="resumeUrl"
                  value={form.resumeUrl}
                  onChange={handleInputChange}
                  placeholder="https://drive.google.com/... or https://example.com/resume.pdf"
                  className={errors.resumeUrl ? "border-red-400" : ""}
                />
                {errors.resumeUrl && (
                  <p className="mt-1 text-xs text-red-600">{errors.resumeUrl}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        <div className="space-y-6">
          <Card className="border-sky-100/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Professional Headline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-slate-800">
                {profile.headline || (
                  <span className="italic text-slate-400">No headline set yet.</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="border-sky-100/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                About &amp; Impact Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {profile.about || (
                  <span className="italic text-slate-400">
                    No bio provided. Click edit profile to add your background.
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-sky-100/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900">
                  Skills &amp; Capabilities
                </CardTitle>
                <CardDescription>Verified competencies for drive roles.</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.skills.length === 0 ? (
                  <p className="text-xs italic text-slate-400">No skills listed.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-sky-100/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900">
                  Portfolio &amp; External Links
                </CardTitle>
                <CardDescription>Links to past work, social profiles, and articles.</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.portfolioLinks.length === 0 ? (
                  <p className="text-xs italic text-slate-400">No portfolio links added.</p>
                ) : (
                  <ul className="space-y-2">
                    {profile.portfolioLinks.map((link) => (
                      <li key={link} className="flex items-center gap-2 text-xs">
                        <span className="text-sky-500">🔗</span>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sky-600 underline underline-offset-2 hover:text-sky-800"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-sky-100/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Earned Badges &amp; Recognitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badgeName) => (
                  <Badge
                    key={badgeName}
                    variant="default"
                    className="gap-1.5 px-3 py-1 font-semibold shadow-sm"
                  >
                    <span>🏅</span>
                    {badgeName}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
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
import { api } from "@/lib/api";
import type { VolunteerProfileData } from "@/types/volunteer";
import { calculateProfileCompletion } from "@/lib/volunteer-utils";
import {
  Edit3,
  MapPin,
  Phone,
  Calendar,
  FileText,
  Link as LinkIcon,
  Award,
  FileCheck,
} from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${
            star <= Math.round(rating) ? "text-amber-500" : "text-slate-200"
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs font-mono font-bold text-[#335577] tabular-nums">
        {rating.toFixed(1)} / 5.0
      </span>
    </div>
  );
}

export default function VolunteerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VolunteerProfileData>({
    headline: null,
    about: null,
    skills: [],
    portfolioLinks: [],
    points: 0,
    ratingAvg: 0,
    badges: [],
    resumeUrl: null,
    totalHours: 0,
  });
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    headline: profile.headline ?? "",
    about: profile.about ?? "",
    skillsInput: profile.skills.join(", "),
    portfolioInput: profile.portfolioLinks.join(", "),
    resumeUrl: profile.resumeUrl ?? "",
  });

  useEffect(() => {
    let active = true;
    api
      .getVolunteerProfile()
      .then((data) => {
        if (!active) return;
        const loaded = {
          headline: data.headline,
          about: data.about,
          skills: data.skills || [],
          portfolioLinks: data.portfolioLinks || [],
          points: data.points,
          ratingAvg: data.ratingAvg,
          badges: data.badges || [],
          resumeUrl: data.resumeUrl,
          totalHours: data.totalHours,
        };
        setProfile(loaded);
        setForm({
          headline: loaded.headline || "",
          about: loaded.about || "",
          skillsInput: loaded.skills.join(", "),
          portfolioInput: loaded.portfolioLinks.join(", "),
          resumeUrl: loaded.resumeUrl || "",
        });
      })
      .catch((error: unknown) => {
        if (active) {
          setSaveStatus(error instanceof Error ? error.message : "Could not load your profile.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const completion = calculateProfileCompletion(user, profile);

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
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
    if (form.resumeUrl.trim() && !form.resumeUrl.startsWith("resumes/")) {
      try {
        new URL(form.resumeUrl);
      } catch {
        errs.resumeUrl = "Resume link must be a valid URL (e.g., https://...).";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e: React.FormEvent) {
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

    const uploadedKeys: string[] = [];
    try {
      const resumeUrl = resumeFile
        ? await api.uploadVolunteerFile(resumeFile, "resume")
        : form.resumeUrl.trim() || null;
      if (resumeFile && resumeUrl) uploadedKeys.push(resumeUrl);

      const uploadedPortfolio: string[] = [];
      for (const file of portfolioFiles) {
        const key = await api.uploadVolunteerFile(file, "portfolio");
        uploadedPortfolio.push(key);
        uploadedKeys.push(key);
      }

      const saved = await api.updateVolunteerProfile({
        headline: form.headline.trim(),
        about: form.about.trim(),
        skills: parsedSkills,
        portfolioLinks: [...parsedLinks, ...uploadedPortfolio],
        resumeUrl,
      });

      setProfile({
        headline: saved.headline,
        about: saved.about,
        skills: saved.skills || [],
        portfolioLinks: saved.portfolioLinks || [],
        points: saved.points,
        ratingAvg: saved.ratingAvg,
        badges: saved.badges || [],
        resumeUrl: saved.resumeUrl,
        totalHours: saved.totalHours,
      });

      setForm({
        headline: saved.headline || "",
        about: saved.about || "",
        skillsInput: (saved.skills || []).join(", "),
        portfolioInput: (saved.portfolioLinks || []).join(", "),
        resumeUrl: saved.resumeUrl || "",
      });

      setResumeFile(null);
      setPortfolioFiles([]);
      setEditing(false);
      setSaveStatus("Your profile was saved successfully.");
    } catch (error) {
      await Promise.all(
        uploadedKeys.map((key) => api.deleteStorageObject(key).catch(() => undefined))
      );
      setSaveStatus(error instanceof Error ? error.message : "Could not save your profile.");
    }
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
    setResumeFile(null);
    setPortfolioFiles([]);
    setEditing(false);
  }

  async function openStoredFile(key: string) {
    const fileWindow = window.open("about:blank", "_blank");
    if (!fileWindow) {
      setSaveStatus("Allow pop-ups to view this file.");
      return;
    }
    try {
      const url = await api.getStorageDownloadUrl(key);
      fileWindow.opener = null;
      fileWindow.location.href = url;
    } catch (error) {
      fileWindow.close();
      setSaveStatus(error instanceof Error ? error.message : "Could not open this file.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f2a43]">
            Volunteer Profile &amp; Portfolio
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5a7b9d] leading-relaxed">
            Manage your verified credentials, showcase social impact achievements, and update capabilities.
          </p>
        </div>

        {!editing ? (
          <Button
            onClick={() => {
              setSaveStatus(null);
              setEditing(true);
            }}
            className="self-start sm:self-auto bg-[#0369a1] hover:bg-[#075985] text-white text-xs font-bold gap-1.5 shadow-sm min-h-[36px]"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </Button>
        ) : (
          <div className="flex gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-xs border-[#bae6fd] text-[#335577] min-h-[36px]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-[#0369a1] hover:bg-[#075985] text-white text-xs font-bold min-h-[36px] shadow-sm"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {saveStatus && (
        <div
          role="status"
          className="rounded-xl border border-[#bae6fd] bg-[#f4f9ff] p-4 text-xs font-medium text-[#075985] flex items-center gap-2"
        >
          <FileCheck className="h-4 w-4 text-[#0369a1] shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Profile Completeness Score Card */}
      <Card className="border-[#bae6fd]/80 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-[#f1f5f9]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-[#0f2a43]">
              Profile Completeness Score
            </CardTitle>
            <span className="font-mono text-lg font-black text-[#0369a1] tabular-nums">
              {completion.percentage}%
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e0f2fe]">
            <div
              className="h-full rounded-full bg-[#0369a1] transition-all duration-500"
              style={{ width: `${completion.percentage}%` }}
              role="progressbar"
              aria-valuenow={completion.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {completion.items.map((item) => (
              <span
                key={item.key}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                  item.completed
                    ? "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]"
                    : "bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]"
                }`}
              >
                <span>{item.completed ? "✓" : "○"}</span>
                <span>{item.label}</span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volunteer Identity Dossier Card */}
      <Card className="overflow-hidden border-[#bae6fd]/80 bg-white shadow-sm">
        <div className="h-20 bg-gradient-to-r from-[#075985] to-[#0c4a6e]" />
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 mb-4">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#0369a1] text-2xl font-black text-white shadow-md">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name ?? "Avatar"}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#0f2a43]">{user?.name ?? "Volunteer"}</h2>
                  <Badge variant="secondary" className="font-semibold text-[#0369a1] bg-[#e0f2fe] border-[#bae6fd]">
                    Volunteer
                  </Badge>
                </div>
                <p className="text-xs text-[#5a7b9d]">{user?.email}</p>
                <div className="pt-0.5">
                  <StarRating rating={profile.ratingAvg} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 sm:text-right">
              <div className="rounded-xl border border-[#bae6fd]/80 bg-[#f4f9ff] px-3.5 py-2">
                <p className="font-mono text-xl font-black text-[#0369a1] tabular-nums">{profile.points}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7b9d]">Impact Points</p>
              </div>
              <div className="rounded-xl border border-[#bae6fd]/80 bg-[#f4f9ff] px-3.5 py-2">
                <p className="font-mono text-xl font-black text-[#0369a1] tabular-nums">{profile.totalHours} hrs</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7b9d]">Verified Time</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-[#f1f5f9] pt-4 text-xs text-[#335577]">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#0369a1] shrink-0" />
              <span className="font-semibold text-[#0f2a43]">City:</span>
              <span>{user?.city ?? "Not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[#0369a1] shrink-0" />
              <span className="font-semibold text-[#0f2a43]">Phone:</span>
              <span>{user?.phone ?? "Not provided"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[#0369a1] shrink-0" />
              <span className="font-semibold text-[#0f2a43]">Member Since:</span>
              <span className="tabular-nums">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "Active Contributor"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-[#0369a1] shrink-0" />
              <span className="font-semibold text-[#0f2a43]">Resume:</span>
              {profile.resumeUrl ? (
                profile.resumeUrl.startsWith("resumes/") ? (
                  <button
                    type="button"
                    onClick={() => void openStoredFile(profile.resumeUrl!)}
                    className="font-semibold text-[#0369a1] hover:underline"
                  >
                    View Private PDF ↗
                  </button>
                ) : (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#0369a1] hover:underline"
                  >
                    View Document ↗
                  </a>
                )
              ) : (
                <span className="text-[#94a3b8]">Not uploaded</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form (Edit vs View Mode) */}
      {editing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="border-[#bae6fd] bg-white shadow-sm">
            <CardHeader className="border-b border-[#f1f5f9]">
              <CardTitle className="text-base font-bold text-[#0f2a43]">
                Edit Profile Information
              </CardTitle>
              <CardDescription className="text-xs text-[#335577]">
                Your profile details and uploaded credentials are saved directly to your account ledger.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0f2a43] mb-1">
                  Professional Headline *
                </label>
                <Input
                  name="headline"
                  value={form.headline}
                  onChange={handleInputChange}
                  placeholder="e.g. Enthusiastic Volunteer | Education & Community Outreach Lead"
                  className={`h-10 text-xs border-[#bae6fd] ${errors.headline ? "border-red-400" : ""}`}
                />
                {errors.headline && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.headline}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f2a43] mb-1">
                  About &amp; Impact Philosophy *
                </label>
                <textarea
                  name="about"
                  value={form.about}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Share your background, social causes you care about, and volunteer experiences…"
                  className={`flex w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-[#0f2a43] placeholder:text-[#94a3b8] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] shadow-xs ${
                    errors.about ? "border-red-400" : "border-[#bae6fd]"
                  }`}
                />
                {errors.about && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.about}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f2a43] mb-1">
                  Skills &amp; Capabilities (comma-separated, up to 30)
                </label>
                <Input
                  name="skillsInput"
                  value={form.skillsInput}
                  onChange={handleInputChange}
                  placeholder="Teaching, Event Coordination, First Aid, Translation, Digital Literacy"
                  className="h-10 text-xs border-[#bae6fd]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f2a43] mb-1">
                  Portfolio / External Links (comma-separated HTTPS URLs)
                </label>
                <Input
                  name="portfolioInput"
                  value={form.portfolioInput}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/..., https://github.com/..."
                  className="h-10 text-xs border-[#bae6fd]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f2a43] mb-1">
                  Resume Link (optional if uploading PDF below)
                </label>
                <Input
                  name="resumeUrl"
                  value={form.resumeUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/resume.pdf"
                  className={`h-10 text-xs border-[#bae6fd] ${errors.resumeUrl ? "border-red-400" : ""}`}
                />
                {errors.resumeUrl && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.resumeUrl}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-[#bae6fd] bg-[#f8fafc] p-4 space-y-2">
                  <label className="block text-xs font-bold text-[#0f2a43]">
                    Upload Resume PDF (up to 5 MB)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                    className="block w-full text-xs text-[#335577] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0369a1] file:text-white hover:file:bg-[#075985]"
                  />
                  <p className="text-[11px] text-[#5a7b9d]">
                    {resumeFile?.name ||
                      (form.resumeUrl.startsWith("resumes/")
                        ? "A private resume PDF is currently on file."
                        : "Stored securely in your private ledger bucket.")}
                  </p>
                </div>

                <div className="rounded-xl border border-[#bae6fd] bg-[#f8fafc] p-4 space-y-2">
                  <label className="block text-xs font-bold text-[#0f2a43]">
                    Upload Portfolio Files (PDF, JPG, PNG, WebP)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(event) => setPortfolioFiles(Array.from(event.target.files || []))}
                    className="block w-full text-xs text-[#335577] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0369a1] file:text-white hover:file:bg-[#075985]"
                  />
                  {portfolioFiles.length > 0 && (
                    <p className="text-[11px] text-[#5a7b9d]">
                      Selected: {portfolioFiles.map((file) => file.name).join(", ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#f1f5f9]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="text-xs border-[#bae6fd] text-[#335577]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0369a1] hover:bg-[#075985] text-white text-xs font-bold shadow-sm"
                >
                  Save Profile Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        <div className="space-y-6">
          <Card className="border-[#bae6fd]/80 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f1f5f9]">
              <CardTitle className="text-base font-bold text-[#0f2a43]">
                Professional Headline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs sm:text-sm font-semibold text-[#0f2a43]">
                {profile.headline || (
                  <span className="italic text-[#94a3b8]">No headline set yet. Click Edit Profile to add one.</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#bae6fd]/80 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f1f5f9]">
              <CardTitle className="text-base font-bold text-[#0f2a43]">
                About &amp; Impact Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-[#335577]">
                {profile.about || (
                  <span className="italic text-[#94a3b8]">
                    No bio provided. Click Edit Profile to describe your community interests and experience.
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-[#bae6fd]/80 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-[#f1f5f9]">
                <CardTitle className="text-base font-bold text-[#0f2a43]">
                  Skills &amp; Capabilities
                </CardTitle>
                <CardDescription className="text-xs text-[#335577]">
                  Verified competencies for drive assignment.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {profile.skills.length === 0 ? (
                  <p className="text-xs italic text-[#94a3b8]">No skills listed yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="border-[#bae6fd] bg-[#f4f9ff] px-2.5 py-1 text-xs font-semibold text-[#0369a1]"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#bae6fd]/80 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-[#f1f5f9]">
                <CardTitle className="text-base font-bold text-[#0f2a43]">
                  Portfolio &amp; External Links
                </CardTitle>
                <CardDescription className="text-xs text-[#335577]">
                  References, social profiles, and articles.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {profile.portfolioLinks.length === 0 ? (
                  <p className="text-xs italic text-[#94a3b8]">No portfolio links added.</p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {profile.portfolioLinks.map((link) => (
                      <li key={link} className="flex items-center gap-2">
                        <LinkIcon className="h-3.5 w-3.5 text-[#0369a1] shrink-0" />
                        {link.startsWith("portfolio/") ? (
                          <button
                            type="button"
                            onClick={() => void openStoredFile(link)}
                            className="truncate text-left font-semibold text-[#0369a1] underline underline-offset-2 hover:text-[#075985]"
                          >
                            View Private Portfolio File ↗
                          </button>
                        ) : (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate font-semibold text-[#0369a1] underline underline-offset-2 hover:text-[#075985]"
                          >
                            {link}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#bae6fd]/80 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-[#f1f5f9]">
              <CardTitle className="text-base font-bold text-[#0f2a43]">
                Earned Badges &amp; Recognitions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {profile.badges.length === 0 ? (
                  <p className="text-xs italic text-[#94a3b8]">No badges unlocked yet.</p>
                ) : (
                  profile.badges.map((badgeName) => (
                    <Badge
                      key={badgeName}
                      variant="default"
                      className="gap-1.5 px-3 py-1 font-bold text-xs bg-[#0369a1] hover:bg-[#075985] text-white shadow-xs"
                    >
                      <Award className="h-3.5 w-3.5" />
                      <span>{badgeName}</span>
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

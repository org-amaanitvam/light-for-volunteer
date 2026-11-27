"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Globe, 
  MapPin, 
  Edit3, 
  RotateCcw, 
  ExternalLink,
  Lock
} from "lucide-react";

const INITIAL_PROFILE = {
  name: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  category: "Non-Governmental Organisation (NGO)",
  registrationId: "",
  established: "",
  description: "",
  verificationDocUrl: "",
};

const REGISTRATION_TYPES = [
  "Non-Governmental Organisation (NGO)",
  "Section 8 Company",
  "Trust / Society",
  "Charitable Foundation",
  "Community Initiative",
  "Other",
];

export default function OrganisationProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [savedProfile, setSavedProfile] = useState(INITIAL_PROFILE);
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [ratingAvg, setRatingAvg] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    let active = true;

    api.getMyOrganisation()
      .then((data) => {
        if (!active) return;
        const loaded = {
          ...INITIAL_PROFILE,
          name: data.orgName,
          email: user.email || "",
          website: data.website || "",
          description: data.about || "",
          category: data.registrationType || "Non-Governmental Organisation (NGO)",
          registrationId: data.registrationId || "",
          verificationDocUrl: data.verificationDocUrl || "",
        };
        setProfile(loaded);
        setSavedProfile(loaded);
        setVerificationStatus(data.verificationStatus);
        setRatingAvg(data.ratingAvg || 0);
        setReviewCount(data.reviewCount || 0);
        setProfileExists(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        // Incomplete profile recovery from Batch 3
        if (error instanceof Error && /not found|not been created/i.test(error.message)) {
          setFeedback({
            type: "info",
            text: "Your organisation profile is not yet completed. Please complete your registration details to enable volunteer drives."
          });
          setProfile(prev => ({ ...prev, name: user.name || "", email: user.email || "" }));
          setSavedProfile(prev => ({ ...prev, name: user.name || "", email: user.email || "" }));
          setIsEditing(true);
          setProfileExists(false);
        } else {
          setFeedback({
            type: "error",
            text: error instanceof Error ? error.message : "Could not load organisation profile."
          });
        }
      })
      .finally(() => {
        // loaded
      });

    return () => { active = false; };
  }, [authLoading, user]);

  function updateField(field: keyof typeof INITIAL_PROFILE, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile.name.trim()) {
      setFeedback({ type: "error", text: "Organisation legal name is required." });
      return;
    }

    setSaving(true);
    let uploadedDocumentKey: string | null = null;

    try {
      if (selectedDocFile) {
        if (selectedDocFile.type !== "application/pdf") {
          throw new Error("Verification documents must be an official PDF file.");
        }
        if (selectedDocFile.size > 10 * 1024 * 1024) {
          throw new Error("Verification document must be 10 MB or smaller.");
        }
        uploadedDocumentKey = await api.uploadVerificationDocument(selectedDocFile);
      }

      const verificationDocUrl = uploadedDocumentKey || profile.verificationDocUrl || undefined;

      const payload = {
        orgName: profile.name.trim(),
        about: profile.description.trim() || undefined,
        website: profile.website.trim() || undefined,
        registrationType: profile.category,
        registrationId: profile.registrationId.trim() || undefined,
        verificationDocUrl,
      };

      const saved = profileExists
        ? await api.updateMyOrganisation(payload)
        : await api.createMyOrganisation(payload);

      const updated = {
        ...profile,
        name: saved.orgName,
        website: saved.website || "",
        description: saved.about || "",
        category: saved.registrationType || "Non-Governmental Organisation (NGO)",
        registrationId: saved.registrationId || "",
        verificationDocUrl: saved.verificationDocUrl || "",
      };

      setProfile(updated);
      setSavedProfile(updated);
      setVerificationStatus(saved.verificationStatus);
      setRatingAvg(saved.ratingAvg || 0);
      setReviewCount(saved.reviewCount || 0);
      setProfileExists(true);
      setSelectedDocFile(null);
      setIsEditing(false);
      setFeedback({
        type: "success",
        text: selectedDocFile 
          ? "Profile updated and official verification PDF uploaded for Foundation review." 
          : "Organisation profile saved successfully."
      });
    } catch (error) {
      if (uploadedDocumentKey) {
        await api.deleteStorageObject(uploadedDocumentKey).catch(() => undefined);
      }
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save organisation profile."
      });
    } finally {
      setSaving(false);
    }
  }

  async function resubmitVerification() {
    try {
      const updated = await api.resubmitMyOrganisation();
      setVerificationStatus(updated.verificationStatus);
      setFeedback({
        type: "success",
        text: "Verification resubmitted for Amaanitvam Foundation review."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Could not resubmit verification."
      });
    }
  }

  function cancelEditing() {
    setProfile(savedProfile);
    setSelectedDocFile(null);
    setIsEditing(false);
    setFeedback(null);
  }

  async function viewVerificationDoc() {
    if (!profile.verificationDocUrl) return;
    try {
      const downloadUrl = await api.getStorageDownloadUrl(profile.verificationDocUrl);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Could not open verification document."
      });
    }
  }

  const isVerified = verificationStatus.toLowerCase() === "verified";
  const isRejected = verificationStatus.toLowerCase() === "rejected";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Feedback Banner */}
      {feedback && (
        <div 
          role="status"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium shadow-2xs ${
            feedback.type === "success" 
              ? "border-sky-200 bg-sky-50 text-sky-900" 
              : feedback.type === "error"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-sky-200 bg-sky-50/80 text-sky-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" && <CheckCircle2 className="h-4 w-4 text-sky-700 shrink-0" />}
            {feedback.type === "error" && <AlertCircle className="h-4 w-4 text-red-700 shrink-0" />}
            {feedback.type === "info" && <Clock className="h-4 w-4 text-sky-700 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFeedback(null)} 
            className="text-xs underline hover:no-underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Action Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">
            Organisation Legal Dossier
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
            Organisation Profile & Credentials
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Maintain your official identity, legal registration, and foundation verification documents.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setFeedback(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-800 transition-all cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Architectural Civic Identity Card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        {/* Deep Azure Banner */}
        <div className="h-32 bg-gradient-to-r from-[#0C4A6E] via-[#075985] to-[#0284C7] p-6 relative">
          <div 
            aria-hidden="true" 
            className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"
          />
        </div>

        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex h-22 w-22 items-center justify-center rounded-2xl border-4 border-white bg-sky-50 text-3xl font-bold text-sky-800 shadow-sm">
              {profile.name ? profile.name.charAt(0).toUpperCase() : <Building2 className="h-10 w-10 text-sky-700" />}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-700" />
                  Verified Organisation
                </span>
              ) : isRejected ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-bold text-red-900">
                    <AlertCircle className="h-3.5 w-3.5 text-red-700" />
                    Verification Rejected
                  </span>
                  <button
                    type="button"
                    onClick={resubmitVerification}
                    className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Resubmit for Review
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                  <Clock className="h-3.5 w-3.5 text-amber-700" />
                  Verification Pending
                </span>
              )}

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {profile.category}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {profile.name || "Your Organisation Legal Name"}
            </h2>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-3">
              {profile.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a 
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-700 hover:underline"
                >
                  <Globe className="h-3 w-3" />
                  {profile.website}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </p>
          </div>

          {/* 3 Overview Metric Panels */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Volunteer Feedback Rating
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}
                </span>
                <span className="text-amber-500 text-base">★</span>
                <span className="text-xs text-slate-500">/ 5.0</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Community Reviews
              </span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
                {reviewCount}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Submitted by volunteers</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Documentation Status
              </span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {profile.verificationDocUrl ? "Official PDF on File" : "No Document Uploaded"}
                </span>
                {profile.verificationDocUrl && (
                  <button
                    type="button"
                    onClick={viewVerificationDoc}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
                  >
                    View PDF
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form / Dossier Details Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Organisation Information & Legal Registry
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Details provided here appear on your public organisation catalog card and drive postings.
          </p>
        </div>

        <form onSubmit={saveProfile} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Legal Organisation Name *
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Full registered organization name"
                className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:border-sky-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Contact Email
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-500 bg-slate-50 cursor-not-allowed"
                title="Account email managed via authentication"
              />
              <span className="mt-1 block text-[11px] text-slate-400">Linked to your authenticated login credentials</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Website
              </label>
              <input
                type="url"
                disabled={!isEditing}
                value={profile.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://example.org"
                className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:border-sky-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Location / Operational Headquarters
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. Pune, Maharashtra"
                className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:border-sky-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Registration Type
              </label>
              <select
                disabled={!isEditing || isVerified}
                value={profile.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:border-sky-600 focus:outline-hidden"
              >
                {REGISTRATION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {isVerified && (
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-sky-700">
                  <Lock className="h-3 w-3" />
                  Locked — Verified with Foundation administration
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Legal Registration Number / Tax ID
              </label>
              <input
                type="text"
                disabled={!isEditing || isVerified}
                value={profile.registrationId}
                onChange={(e) => updateField("registrationId", e.target.value)}
                placeholder="e.g. NGO Darpan / 12A / 80G ID"
                className="mt-1.5 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:border-sky-600 focus:outline-hidden"
              />
              {isVerified && (
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-sky-700">
                  <Lock className="h-3 w-3" />
                  Locked — Verified with Foundation administration
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Mission Description & Civic Purpose
              </label>
              <textarea
                rows={5}
                disabled={!isEditing}
                value={profile.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe your organization's mission, civic focus areas, and community initiatives..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:border-sky-600 focus:outline-hidden"
              />
            </div>

            {/* Official Verification Document Upload */}
            <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                    Official Verification Document (PDF)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Upload official registration certificate (Trust Deed, 80G/12A, or Certificate of Incorporation) up to 10 MB.
                  </p>
                </div>
                {profile.verificationDocUrl && (
                  <button
                    type="button"
                    onClick={viewVerificationDoc}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-slate-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Inspect Current PDF
                  </button>
                )}
              </div>

              {isEditing && !isVerified ? (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setSelectedDocFile(e.target.files?.[0] || null)}
                    className="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-sky-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-sky-800 hover:file:bg-sky-100"
                  />
                  <span className="block text-[11px] text-slate-500">
                    {selectedDocFile ? `Selected: ${selectedDocFile.name} (${(selectedDocFile.size / (1024 * 1024)).toFixed(2)} MB)` : "Uploaded securely to private R2 storage with encrypted access."}
                  </span>
                </div>
              ) : isVerified ? (
                <p className="text-xs text-slate-600 italic">
                  Document is locked and verified. Contact Amaanitvam Foundation support to submit updated legal certificates.
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {profile.verificationDocUrl ? "Official certificate is attached." : "No document on file. Click 'Edit Profile' to upload your registration PDF."}
                </p>
              )}
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving Profile..." : "Save Dossier"}
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

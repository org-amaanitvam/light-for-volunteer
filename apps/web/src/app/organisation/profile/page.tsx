
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Review = {
  id: number;
  reviewer: string;
  rating: number;
  date: string;
  comment: string;
};

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  category: "Organisation",
  established: "",
  description: "",
  verificationDocUrl: "",
};

export default function OrganisationProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [reviews] = useState<Review[]>([]);
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [ratingAvg, setRatingAvg] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.getMyOrganisation().then((data) => {
      if (!active) return;
      const loaded = { ...initialProfile, name: data.orgName, website: data.website || "", description: data.about || "", category: data.registrationType || "Organisation", verificationDocUrl: data.verificationDocUrl || "" };
      setProfile(loaded);
      setSavedProfile(loaded);
      setVerificationStatus(data.verificationStatus);
      setRatingAvg(data.ratingAvg);
      setReviewCount(data.reviewCount);
      setProfileExists(true);
    }).catch((error: unknown) => {
      if (active && error instanceof Error && /not found|not been created/i.test(error.message)) {
        setMessage("Your organisation details are not set up yet. Fill them in and save to create the profile.");
        setIsEditing(true);
      } else if (active) setMessage(error instanceof Error ? error.message : "Could not load organisation profile.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const averageRating = ratingAvg;

  function updateField(field: keyof typeof initialProfile, value: string) {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile.name.trim()) {
      setMessage("Organisation name is required.");
      return;
    }

    let uploadedDocumentKey: string | null = null;
    try {
      const verificationDocUrl = selectedDocFile
        ? (uploadedDocumentKey = await api.uploadVerificationDocument(selectedDocFile))
        : profile.verificationDocUrl || undefined;
      const data = { orgName: profile.name.trim(), about: profile.description, website: profile.website, registrationType: profile.category, verificationDocUrl };
      const saved = profileExists ? await api.updateMyOrganisation(data) : await api.createMyOrganisation(data);
      const updated = { ...profile, name: saved.orgName, website: saved.website || "", description: saved.about || "", category: saved.registrationType || "Organisation", verificationDocUrl: saved.verificationDocUrl || "" };
      setProfile(updated);
      setSavedProfile(updated);
      setVerificationStatus(saved.verificationStatus);
      setRatingAvg(saved.ratingAvg);
      setReviewCount(saved.reviewCount);
      setProfileExists(true);
      setSelectedDocFile(null);
      setIsEditing(false);
      setMessage(selectedDocFile ? "Profile saved and verification document uploaded." : "Organisation profile saved.");
    } catch (error) {
      if (uploadedDocumentKey) await api.deleteStorageObject(uploadedDocumentKey).catch(() => undefined);
      setMessage(error instanceof Error ? error.message : "Could not save organisation profile.");
    }
  }

  async function resubmitVerification() {
    try {
      const updated = await api.resubmitMyOrganisation();
      setVerificationStatus(updated.verificationStatus);
      setMessage("Verification resubmitted for admin review.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not resubmit verification."); }
  }

  function cancelEditing() {
    setProfile(savedProfile);
    setIsEditing(false);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              Organisation Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Organisation Profile
            </h1>
            <p className="mt-2 text-slate-500">
              Manage your organisation information and review feedback.
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setMessage("");
              }}
              className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800"
            >
              Edit Profile
            </button>
          )}
        </header>

        {message && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-emerald-100 text-3xl font-bold text-emerald-800 shadow-sm">
                {profile.name.charAt(0).toUpperCase() || "O"}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800">
                  Verification: {verificationStatus}
                </span>
                {verificationStatus === "rejected" && <button onClick={() => void resubmitVerification()} className="rounded-full border border-amber-300 px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-50">Resubmit verification</button>}
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                  {profile.category}
                </span>
              </div>
            </div>

            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              {profile.name}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {profile.location && <><span aria-hidden="true">📍</span> {profile.location}</>}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Average Rating</p>
                <p className="mt-2 text-2xl font-bold">
                  {averageRating.toFixed(1)}
                  <span className="ml-2 text-lg text-amber-500">★</span>
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total Reviews</p>
                <p className="mt-2 text-2xl font-bold">{reviewCount}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Established</p>
                <p className="mt-2 text-2xl font-bold">
                  {profile.established || "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Organisation Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your organisation details accurate and up to date.
            </p>
          </div>

          <form onSubmit={saveProfile} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Organisation Name"
                value={profile.name}
                disabled={!isEditing}
                onChange={(value) => updateField("name", value)}
                required
              />

              <Field
                label="Contact Email"
                type="email"
                value={profile.email}
                disabled
                onChange={(value) => updateField("email", value)}
                required
              />

              <Field
                label="Phone Number"
                value={profile.phone}
                disabled
                onChange={(value) => updateField("phone", value)}
              />

              <Field
                label="Website"
                value={profile.website}
                disabled={!isEditing}
                onChange={(value) => updateField("website", value)}
                placeholder="https://example.org"
              />

              <Field
                label="Location"
                value={profile.location}
                disabled
                onChange={(value) => updateField("location", value)}
              />

              <Field
                label="Year Established"
                type="number"
                value={profile.established}
                disabled
                onChange={(value) => updateField("established", value)}
              />

              <Field label="Registration Type" value={profile.category} disabled={!isEditing} onChange={(value) => updateField("category", value)} />

              <label className="block text-sm font-medium sm:col-span-2">
                About the Organisation
                <textarea
                  rows={5}
                  value={profile.description}
                  disabled={!isEditing}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3 leading-6 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Describe your mission and activities..."
                />
              </label>

              <label className="block text-sm font-medium sm:col-span-2">
                Verification document (PDF, up to 10 MB)
                <input type="file" accept="application/pdf,.pdf" disabled={!isEditing || verificationStatus === "verified"} onChange={(event) => setSelectedDocFile(event.target.files?.[0] || null)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm disabled:bg-slate-50" />
                <span className="mt-1 block text-xs font-normal text-slate-500">{selectedDocFile ? `Selected: ${selectedDocFile.name}` : profile.verificationDocUrl ? "A verification document is on file." : "No verification document uploaded."}</span>
              </label>
            </div>

            {isEditing && (
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Ratings & Reviews
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Feedback from volunteers about their experience.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-5xl font-bold text-slate-900">
                  {averageRating.toFixed(1)}
                </p>
                <p
                  className="mt-2 text-2xl tracking-widest text-amber-500"
                  aria-label={`${averageRating.toFixed(1)} out of 5 stars`}
                >
                  ★★★★★
                </p>
                <p className="mt-2 text-sm text-slate-500">Based on {reviewCount} reviews</p>
              </div>

              <div className="sm:ml-8 sm:border-l sm:border-slate-200 sm:pl-8">
                <p className="font-semibold">Volunteer feedback matters</p>
                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Reviews help organisations understand volunteer experiences
                  and identify ways to improve future opportunities.
                </p>
              </div>
            </div>
          </div>

          {reviews.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">No reviews have been submitted for this organisation yet.</p>}
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {review.reviewer}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">{review.date}</p>
                </div>

                <span
                  className="text-lg tracking-widest text-amber-500"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {"★".repeat(review.rating)}
                  <span className="text-slate-200">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {review.comment}
              </p>
            </article>
          ))}
        </section>

        <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
          {loading ? "Loading organisation profile…" : "Organisation profile data is saved through the API. Review history will appear when the review listing API is available."}
        </footer>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </label>
  );
}

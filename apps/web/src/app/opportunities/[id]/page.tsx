"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  ExternalLink,
  Award,
  AlertCircle,
  ShieldCheck,
  FileCheck,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { api, OpportunityItem, ApplicationItem } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function parseDeadline(
  deadlineStr: string | null | undefined
): { label: string; isPast: boolean; formatted: string } | null {
  if (!deadlineStr) return null;
  const trimmed = deadlineStr.trim();
  let parsed: Date;
  // If date-only string (e.g. YYYY-MM-DD), anchor to end of day in Indian Standard Time (IST: UTC+05:30)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    parsed = new Date(`${trimmed}T23:59:59+05:30`);
  } else {
    parsed = new Date(trimmed);
  }
  if (isNaN(parsed.getTime())) return null;

  const isPast = parsed.getTime() < Date.now();
  const formatted = parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    label: isPast ? `Passed on ${formatted}` : `Apply by ${formatted}`,
    isPast,
    formatted,
  };
}

function getValidWebsiteUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return null;
}

const STATUS_METADATA: Record<
  string,
  {
    label: string;
    variant: "secondary" | "default" | "success" | "destructive" | "outline";
    description: string;
  }
> = {
  applied: {
    label: "Under Review",
    variant: "secondary",
    description:
      "Your application is currently being evaluated by the host organisation.",
  },
  shortlisted: {
    label: "Shortlisted",
    variant: "default",
    description:
      "You have been shortlisted! The coordinator may reach out for next steps or an orientation.",
  },
  selected: {
    label: "Selected",
    variant: "success",
    description:
      "You have been officially selected for this initiative. Check schedule and coordinate with the host.",
  },
  completed: {
    label: "Service Completed",
    variant: "success",
    description:
      "Volunteer drive completed! Verified service hours have been credited to your profile.",
  },
  rejected: {
    label: "Not Selected",
    variant: "destructive",
    description:
      "The host organisation was unable to accommodate your application for this drive.",
  },
};

function OpportunityDetailsContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [opportunity, setOpportunity] = useState<OpportunityItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Application state
  const [existingApplication, setExistingApplication] =
    useState<ApplicationItem | null>(null);
  const [checkedOpportunityId, setCheckedOpportunityId] = useState<
    string | null
  >(null);
  const [appCheckError, setAppCheckError] = useState(false);
  const [pitch, setPitch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Load opportunity details
  useEffect(() => {
    let active = true;
    api
      .getOpportunityById(id)
      .then((item) => {
        if (active) setOpportunity(item);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load this opportunity."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  // Load volunteer's existing application (duplicate detection)
  useEffect(() => {
    if (user?.role !== "volunteer" || !opportunity) return;
    let active = true;

    api
      .getMyApplications()
      .then((apps) => {
        if (!active) return;
        const matched = apps.find(
          (a) =>
            a.opportunity_id === opportunity.id ||
            (a as { opportunityId?: string }).opportunityId === opportunity.id
        );
        if (matched) {
          setExistingApplication(matched);
        }
      })
      .catch((err) => {
        if (!active) return;
        console.warn("Could not check existing applications:", err);
        setAppCheckError(true);
      })
      .finally(() => {
        if (active) setCheckedOpportunityId(opportunity.id);
      });

    return () => {
      active = false;
    };
  }, [user?.role, opportunity]);

  function handleRetryCheck() {
    if (!opportunity) return;
    setAppCheckError(false);
    setCheckedOpportunityId(null);
    api
      .getMyApplications()
      .then((apps) => {
        const matched = apps.find(
          (a) =>
            a.opportunity_id === opportunity.id ||
            (a as { opportunityId?: string }).opportunityId === opportunity.id
        );
        if (matched) {
          setExistingApplication(matched);
        }
      })
      .catch((err) => {
        console.warn("Could not check existing applications:", err);
        setAppCheckError(true);
      })
      .finally(() => {
        setCheckedOpportunityId(opportunity.id);
      });
  }

  async function handleApply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    const trimmed = pitch.trim();
    if (!opportunity || user?.role !== "volunteer" || trimmed.length < 10) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const created = await api.createApplication(opportunity.id, trimmed);
      setExistingApplication(created);
      setMessage("Your application has been successfully submitted and recorded.");
      setPitch("");
    } catch (reason: unknown) {
      const msg =
        reason instanceof Error
          ? reason.message
          : "Could not submit your application.";

      if (
        msg.toLowerCase().includes("already applied") ||
        (reason as { status?: number })?.status === 409
      ) {
        setError("You have already applied to this opportunity.");
        try {
          const apps = await api.getMyApplications();
          const matched = apps.find(
            (a) =>
              a.opportunity_id === opportunity.id ||
              (a as { opportunityId?: string }).opportunityId === opportunity.id
          );
          if (matched) {
            setExistingApplication(matched);
          }
        } catch {
          // Keep conflict message visible if re-fetch fails
        }
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || authLoading) {
    return (
      <main className="min-h-screen bg-[#f4f9ff] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-6 w-36 rounded-xl bg-[#e0f2fe]" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="h-96 rounded-2xl border border-[#bae6fd] bg-white p-8 lg:col-span-8" />
            <div className="h-72 rounded-2xl border border-[#bae6fd] bg-white p-6 lg:col-span-4" />
          </div>
        </div>
      </main>
    );
  }

  if (!opportunity) {
    return (
      <main className="min-h-screen bg-[#f4f9ff] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#bae6fd] bg-white p-8 text-center shadow-xs">
          <h1 className="text-xl font-bold text-[#0f2a43]">
            Opportunity Not Found
          </h1>
          <p className="mt-2 text-sm text-[#335577]">
            {error ||
              "The requested opportunity listing could not be found or has been removed."}
          </p>
          <div className="mt-6">
            <Link
              href="/opportunities"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Browse All Opportunities
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isLive = opportunity.status === "live";
  const isCapacityReached = opportunity.openings === 0;
  const isVerifiedOrg =
    opportunity.organisation?.verification_status === "verified";
  const websiteUrl = getValidWebsiteUrl(opportunity.organisation?.website);
  const formattedDeadline = parseDeadline(opportunity.deadline);
  const durationVal = opportunity.duration?.trim() || null;
  const pointsReward =
    opportunity.points_reward ?? opportunity.pointsReward ?? 0;

  const checkingApplication =
    user?.role === "volunteer" &&
    opportunity != null &&
    checkedOpportunityId !== opportunity.id;

  const locationType =
    opportunity.location_type || opportunity.locationType || "Remote";
  const locationCity = opportunity.city?.trim() || null;
  const displayLocation = locationCity
    ? `${locationCity} (${locationType})`
    : locationType;

  const safeReturnPath = `/opportunities/${opportunity.id}`;
  const loginHref = `/login?next=${encodeURIComponent(safeReturnPath)}`;
  const signupHref = `/signup/volunteer?next=${encodeURIComponent(
    safeReturnPath
  )}`;

  const pitchTrimmed = pitch.trim();
  const hasLengthError = submitAttempted && pitchTrimmed.length < 10;

  const statusMeta = existingApplication
    ? STATUS_METADATA[existingApplication.status] || {
        label: existingApplication.status,
        variant: "secondary" as const,
        description: "Application on record with the host organisation.",
      }
    : null;

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Architectural Horizon Header for Opportunity Dossier */}
        <div className="relative overflow-hidden rounded-2xl border border-[#bae6fd]/80 bg-white p-5 sm:p-6 shadow-sm">
          <div
            className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: "url('/Zephyr%20032.png')",
              backgroundPosition: "center 22%",
            }}
            aria-hidden="true"
          />
          {/* Daylight gradient wash preserving sky and hill details */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/45 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-xs font-semibold text-[#5a7b9d]">
                <li>
                  <Link
                    href="/opportunities"
                    className="inline-flex items-center gap-1.5 text-[#0369a1] hover:text-[#075985] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] rounded"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    All Opportunities
                  </Link>
                </li>
                <li aria-hidden="true" className="text-[#bae6fd]">
                  /
                </li>
                <li className="text-[#0f2a43] truncate max-w-xs sm:max-w-md font-bold">
                  {opportunity.category}
                </li>
              </ol>
            </nav>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#0f2a43] tracking-tight">
                {opportunity.title}
              </h1>
              <span className="text-xs font-semibold text-[#0369a1] bg-white/90 backdrop-blur-md border border-[#bae6fd] px-3 py-1 rounded-full shadow-xs">
                {opportunity.organisation?.org_name || "Community Organisation"}
              </span>
            </div>
          </div>
        </div>

        {/* Dossier & Participation Console Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* LEFT: Opportunity Dossier */}
          <article className="lg:col-span-8 rounded-2xl border border-[#bae6fd]/80 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,42,67,0.03)] space-y-8">
            {/* Header Area */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold"
                >
                  {opportunity.category}
                </Badge>
                <span className="rounded-full bg-[#f4f9ff] border border-[#bae6fd] px-2.5 py-0.5 text-xs font-medium text-[#075985]">
                  {opportunity.type}
                </span>
                {!isLive && (
                  <Badge variant="destructive" className="text-xs capitalize">
                    {opportunity.status.replace("_", " ")}
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0f2a43] text-balance">
                {opportunity.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#335577]">
                <span className="font-bold text-[#0f2a43]">
                  {opportunity.organisation?.org_name ||
                    "Social impact organisation"}
                </span>
                {isVerifiedOrg && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#a7f3d0] bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-semibold text-[#065f46]"
                    title="Organisation registration documents verified by Amaanitvam Foundation"
                  >
                    <CheckCircle2
                      className="h-3.5 w-3.5 text-[#047857] shrink-0"
                      aria-hidden="true"
                    />
                    <span>Verified Organisation</span>
                  </span>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0369a1] hover:text-[#075985] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] rounded"
                    aria-label={`Visit official website of ${
                      opportunity.organisation?.org_name || "organisation"
                    } (opens in a new tab)`}
                  >
                    <span>Official Website</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>

            {/* Metrics Ledger Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Location */}
              <div className="min-w-0 rounded-xl border border-[#bae6fd]/70 bg-[#f4f9ff] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a7b9d]">
                  <MapPin
                    className="h-3.5 w-3.5 text-[#0369a1] shrink-0"
                    aria-hidden="true"
                  />
                  <span>Location</span>
                </div>
                <p className="mt-1 text-sm font-bold text-[#0f2a43] truncate">
                  {displayLocation}
                </p>
              </div>

              {/* Openings */}
              <div className="min-w-0 rounded-xl border border-[#bae6fd]/70 bg-[#f4f9ff] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a7b9d]">
                  <Users
                    className="h-3.5 w-3.5 text-[#0369a1] shrink-0"
                    aria-hidden="true"
                  />
                  <span>Openings</span>
                </div>
                <p className="mt-1 text-sm font-bold text-[#0f2a43] tabular-nums">
                  {opportunity.openings === 0 ? (
                    <span className="text-[#92400e]">Capacity Reached</span>
                  ) : typeof opportunity.openings === "number" &&
                    opportunity.openings > 0 ? (
                    `${opportunity.openings} Position${
                      opportunity.openings === 1 ? "" : "s"
                    }`
                  ) : (
                    "Open positions"
                  )}
                </p>
              </div>

              {/* Deadline */}
              {formattedDeadline && (
                <div className="min-w-0 rounded-xl border border-[#bae6fd]/70 bg-[#f4f9ff] p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a7b9d]">
                    <CalendarDays
                      className="h-3.5 w-3.5 text-[#0369a1] shrink-0"
                      aria-hidden="true"
                    />
                    <span>Deadline</span>
                  </div>
                  <p
                    className={`mt-1 text-sm font-bold tabular-nums ${
                      formattedDeadline.isPast
                        ? "text-[#92400e]"
                        : "text-[#0f2a43]"
                    }`}
                  >
                    {formattedDeadline.label}
                  </p>
                </div>
              )}

              {/* Duration */}
              {durationVal && (
                <div className="min-w-0 rounded-xl border border-[#bae6fd]/70 bg-[#f4f9ff] p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a7b9d]">
                    <Clock
                      className="h-3.5 w-3.5 text-[#0369a1] shrink-0"
                      aria-hidden="true"
                    />
                    <span>Duration</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#0f2a43]">
                    {durationVal}
                  </p>
                </div>
              )}

              {/* Impact Recognition / Points */}
              <div className="min-w-0 rounded-xl border border-[#bae6fd]/70 bg-[#f4f9ff] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a7b9d]">
                  <Award
                    className="h-3.5 w-3.5 text-[#0369a1] shrink-0"
                    aria-hidden="true"
                  />
                  <span>Recognition</span>
                </div>
                <p className="mt-1 text-sm font-bold text-[#0f2a43] tabular-nums">
                  {pointsReward > 0 ? (
                    <span className="text-[#0369a1]">
                      +{pointsReward} Impact Points
                    </span>
                  ) : (
                    opportunity.type || "Volunteer Service"
                  )}
                </p>
              </div>

              {/* Hosting Org */}
              <div className="min-w-0 rounded-xl border border-[#bae6fd]/70 bg-[#f4f9ff] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a7b9d]">
                  <ShieldCheck
                    className="h-3.5 w-3.5 text-[#0369a1] shrink-0"
                    aria-hidden="true"
                  />
                  <span>Hosting Org</span>
                </div>
                <p className="mt-1 text-sm font-bold text-[#0f2a43] truncate">
                  {opportunity.organisation?.org_name ||
                    "Social impact organisation"}
                </p>
              </div>
            </div>

            {/* Description Section */}
            <section className="border-t border-[#e2eaf2] pt-6">
              <h2 className="text-lg font-bold text-[#0f2a43]">
                About This Opportunity
              </h2>
              <div className="mt-3 text-sm sm:text-base leading-relaxed text-[#335577] whitespace-pre-wrap max-w-prose">
                {opportunity.description}
              </div>
            </section>

            {/* Skills Required Section */}
            {opportunity.skills_required &&
              opportunity.skills_required.length > 0 && (
                <section className="border-t border-[#e2eaf2] pt-6">
                  <h2 className="text-lg font-bold text-[#0f2a43]">
                    Required Skills &amp; Competencies
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {opportunity.skills_required.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-[#bae6fd]/70 bg-[#f4f9ff] px-3 py-1.5 text-xs font-semibold text-[#075985]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}
          </article>

          {/* RIGHT: Participation Console */}
          <aside className="lg:col-span-4" aria-label="Participation Console">
            <div className="sticky top-24 rounded-2xl border border-[#bae6fd] bg-white p-6 shadow-[0_2px_8px_rgba(15,42,67,0.04)]">
              <div className="border-b border-[#e2eaf2] pb-4">
                <h2 className="text-base font-bold text-[#0f2a43]">
                  Participation Console
                </h2>
                <p className="mt-0.5 text-xs text-[#5a7b9d]">
                  Review requirements and submit your application to the host organisation.
                </p>
              </div>

              {/* State Handling */}
              {checkingApplication ? (
                /* Loading Placeholder */
                <div
                  className="mt-5 space-y-3 animate-pulse"
                  aria-busy="true"
                  aria-label="Checking application status"
                >
                  <div className="h-4 w-32 rounded bg-[#e0f2fe]" />
                  <div className="h-28 rounded-xl bg-[#f4f9ff] border border-[#bae6fd]" />
                  <div className="h-10 rounded-xl bg-[#e0f2fe]" />
                </div>
              ) : appCheckError && !existingApplication ? (
                /* Application Verification Error Notice */
                <div className="mt-5 space-y-3 rounded-xl border border-[#bae6fd] bg-[#f4f9ff] p-4 text-xs text-[#335577]">
                  <p className="font-bold text-[#0f2a43] flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-[#0369a1]" aria-hidden="true" />
                    Application Status Unverified
                  </p>
                  <p className="leading-relaxed">
                    Unable to verify your prior application status with the server. Please verify your connection before applying.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetryCheck}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Retry Status Check
                  </button>
                </div>
              ) : existingApplication && statusMeta ? (
                /* State C — Already Applied Receipt */
                <div className="mt-5 space-y-4">
                  {message && (
                    <div
                      role="status"
                      className="rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] p-3 text-xs text-[#065f46] flex items-center gap-2"
                    >
                      <CheckCircle2
                        className="h-4 w-4 text-[#047857] shrink-0"
                        aria-hidden="true"
                      />
                      <span className="font-semibold">{message}</span>
                    </div>
                  )}

                  <div className="rounded-xl border border-[#a7f3d0] bg-[#ecfdf5]/60 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-white p-1.5 text-[#047857] shrink-0 mt-0.5 border border-[#a7f3d0]">
                        <FileCheck className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#065f46]">
                          Application on File
                        </h3>
                        <p className="mt-0.5 text-xs text-[#065f46] leading-relaxed">
                          Your application has been received and registered with the host organisation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Structured Receipt Ledger */}
                  <div className="rounded-xl border border-[#bae6fd] bg-[#f4f9ff] p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-[#e2eaf2] pb-2.5">
                      <span className="text-[#5a7b9d] font-medium">
                        Application ID
                      </span>
                      <code className="font-mono text-[#0f2a43] font-semibold">
                        #{existingApplication.id.slice(0, 8)}
                      </code>
                    </div>

                    <div className="flex items-center justify-between border-b border-[#e2eaf2] pb-2.5">
                      <span className="text-[#5a7b9d] font-medium">
                        Submitted Date
                      </span>
                      <span className="font-semibold text-[#0f2a43] tabular-nums">
                        {new Date(
                          existingApplication.applied_at
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-[#e2eaf2] pb-2.5">
                      <span className="text-[#5a7b9d] font-medium">
                        Current Status
                      </span>
                      <Badge
                        variant={statusMeta.variant}
                        className="text-xs font-semibold capitalize"
                      >
                        {statusMeta.label}
                      </Badge>
                    </div>

                    <div className="pt-1">
                      <p className="text-xs text-[#335577] leading-relaxed">
                        {statusMeta.description}
                      </p>
                    </div>

                    {existingApplication.pitch_text && (
                      <details className="group border-t border-[#e2eaf2] pt-2.5">
                        <summary className="cursor-pointer text-xs font-semibold text-[#0369a1] hover:text-[#075985] flex items-center justify-between select-none">
                          <span>View Submitted Statement</span>
                          <ChevronDown
                            className="h-3.5 w-3.5 text-[#0369a1] transition-transform group-open:rotate-180"
                            aria-hidden="true"
                          />
                        </summary>
                        <p className="mt-2 text-xs text-[#0f2a43] bg-white p-3 rounded-xl border border-[#bae6fd] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                          {existingApplication.pitch_text}
                        </p>
                      </details>
                    )}
                  </div>

                  <Link
                    href="/volunteer/applications"
                    className={buttonVariants({
                      variant: "outline",
                      size: "default",
                      className: "w-full justify-center",
                    })}
                  >
                    Track in My Applications &rarr;
                  </Link>
                </div>
              ) : !isLive ? (
                /* Opportunity Closed/Archived Gate */
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 text-xs text-[#92400e]">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle
                        className="h-4 w-4 text-[#b45309] shrink-0"
                        aria-hidden="true"
                      />
                      Applications Unavailable
                    </p>
                    <p className="mt-1 leading-relaxed">
                      This opportunity is currently {opportunity.status.replace("_", " ")} and not accepting new volunteer applications.
                    </p>
                  </div>
                  <Link
                    href="/opportunities"
                    className={buttonVariants({
                      variant: "outline",
                      size: "default",
                      className: "w-full justify-center",
                    })}
                  >
                    Browse Other Opportunities
                  </Link>
                </div>
              ) : user == null ? (
                /* State A — Unauthenticated */
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-[#bae6fd] bg-[#f4f9ff] p-4 text-xs text-[#335577]">
                    <p className="font-bold text-[#0f2a43]">
                      Volunteer Account Required
                    </p>
                    <p className="mt-1 leading-relaxed">
                      To apply for this opportunity and track your service hours, please sign in or create a free volunteer profile.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={loginHref}
                      className={buttonVariants({
                        variant: "default",
                        size: "default",
                        className: "w-full justify-center font-semibold",
                      })}
                    >
                      Log in to Apply
                    </Link>
                    <Link
                      href={signupHref}
                      className={buttonVariants({
                        variant: "secondary",
                        size: "default",
                        className: "w-full justify-center font-semibold",
                      })}
                    >
                      Create Volunteer Account
                    </Link>
                  </div>
                </div>
              ) : user.role !== "volunteer" ? (
                /* State B — Non-Volunteer Role Notice */
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-[#bae6fd] bg-[#f4f9ff] p-4 text-xs text-[#335577]">
                    <p className="font-bold text-[#0f2a43]">
                      Role Notice: Signed in as {user.role}
                    </p>
                    <p className="mt-1 leading-relaxed">
                      Applications on this platform are submitted from volunteer profiles. To apply for community drives, switch to a volunteer account.
                    </p>
                  </div>

                  <Link
                    href="/opportunities"
                    className={buttonVariants({
                      variant: "outline",
                      size: "default",
                      className: "w-full justify-center",
                    })}
                  >
                    Back to Opportunities
                  </Link>
                </div>
              ) : isCapacityReached ? (
                /* Capacity Reached Gate */
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 text-xs text-[#92400e]">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-[#b45309] shrink-0" />
                      Capacity Reached
                    </p>
                    <p className="mt-1 leading-relaxed">
                      All allocated openings for this drive have been filled.
                    </p>
                  </div>

                  <Link
                    href="/opportunities"
                    className={buttonVariants({
                      variant: "outline",
                      size: "default",
                      className: "w-full justify-center",
                    })}
                  >
                    Browse Other Opportunities
                  </Link>
                </div>
              ) : formattedDeadline?.isPast ? (
                /* Deadline Passed Gate */
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 text-xs text-[#92400e]">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-[#b45309] shrink-0" />
                      Application Deadline Passed
                    </p>
                    <p className="mt-1 leading-relaxed">
                      The application deadline for this drive was {formattedDeadline.formatted}.
                    </p>
                  </div>

                  <Link
                    href="/opportunities"
                    className={buttonVariants({
                      variant: "outline",
                      size: "default",
                      className: "w-full justify-center",
                    })}
                  >
                    Browse Active Opportunities
                  </Link>
                </div>
              ) : (
                /* State D — Eligible Volunteer Application Form */
                <form onSubmit={handleApply} className="mt-5 space-y-4">
                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-3 text-xs text-[#b91c1c]"
                    >
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="application-pitch"
                      className="block text-xs font-bold text-[#0f2a43]"
                    >
                      Statement of Motivation / Pitch
                    </label>
                    <p className="mt-0.5 text-[11px] text-[#5a7b9d]">
                      Introduce yourself and explain why you would like to participate (minimum 10 characters).
                    </p>

                    <textarea
                      id="application-pitch"
                      name="pitch"
                      rows={4}
                      value={pitch}
                      onChange={(e) => {
                        setPitch(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Share your relevant background, skills, or motivation for joining this drive..."
                      className={`mt-2 w-full rounded-xl border p-3 text-xs text-[#0f2a43] placeholder:text-[#5a7b9d] outline-none transition focus:ring-2 focus:ring-[#0369a1] ${
                        hasLengthError
                          ? "border-[#b91c1c] bg-[#fef2f2]/40"
                          : "border-[#bae6fd] bg-white focus:border-[#0369a1]"
                      }`}
                      aria-invalid={hasLengthError}
                      aria-describedby={
                        hasLengthError ? "pitch-length-error" : undefined
                      }
                      required
                    />

                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      {hasLengthError ? (
                        <span id="pitch-length-error" className="font-semibold text-[#b91c1c]">
                          Please enter at least 10 characters ({pitchTrimmed.length}/10).
                        </span>
                      ) : (
                        <span className="text-[#5a7b9d]">
                          {pitchTrimmed.length} characters entered
                        </span>
                      )}
                      <span className="text-[#5a7b9d]">Min: 10</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="default"
                    disabled={saving}
                    className="w-full justify-center font-semibold"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Application…
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function OpportunityDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f9ff] p-12 text-center text-sm text-[#5a7b9d]">
          Loading opportunity dossier…
        </div>
      }
    >
      <OpportunityDetailsContent />
    </Suspense>
  );
}

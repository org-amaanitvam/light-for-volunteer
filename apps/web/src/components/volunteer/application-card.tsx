"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Handshake,
  GraduationCap,
  Sparkles,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Building2,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Application, ApplicationStatusType } from "@/types/volunteer";

interface ApplicationCardProps {
  application: Application;
  onWithdraw?: (id: string) => void;
}

const STATUS_METADATA: Record<
  ApplicationStatusType,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
    stepGuidance: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  applied: {
    label: "Under Review",
    variant: "secondary",
    stepGuidance: "Your application was recorded on the ledger and is currently being evaluated by the host organisation.",
    Icon: Clock,
  },
  pending: {
    label: "Pending Review",
    variant: "secondary",
    stepGuidance: "Your application is awaiting coordinator review. Expected decision within 3 business days.",
    Icon: Clock,
  },
  shortlisted: {
    label: "Shortlisted",
    variant: "default",
    stepGuidance: "You have been shortlisted. The organisation will reach out for a brief orientation or chat.",
    Icon: Sparkles,
  },
  selected: {
    label: "Accepted & Confirmed",
    variant: "success",
    stepGuidance: "You are officially part of this drive. Review orientation details and report at the designated time.",
    Icon: Handshake,
  },
  accepted: {
    label: "Accepted",
    variant: "success",
    stepGuidance: "Your application has been accepted. Coordinate directly with the organisation coordinator.",
    Icon: CheckCircle2,
  },
  completed: {
    label: "Service Completed",
    variant: "success",
    stepGuidance: "Drive completed successfully. Verified hours have been credited to your transparent ledger profile.",
    Icon: GraduationCap,
  },
  rejected: {
    label: "Not Selected",
    variant: "destructive",
    stepGuidance: "Volunteer capacity has been met for this drive. We encourage you to apply to upcoming community causes.",
    Icon: AlertCircle,
  },
  withdrawn: {
    label: "Withdrawn",
    variant: "outline",
    stepGuidance: "You withdrew this application. You may apply again if the drive is re-opened by the host.",
    Icon: RotateCcw,
  },
};

export function ApplicationCard({ application, onWithdraw }: ApplicationCardProps) {
  const [showPitch, setShowPitch] = useState(false);
  const meta = STATUS_METADATA[application.status] ?? STATUS_METADATA.applied;
  const StatusIcon = meta.Icon;

  const formattedAppliedDate = new Date(application.appliedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedUpdatedDate = new Date(application.updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const driveHref = application.opportunityId
    ? `/opportunities/${application.opportunityId}`
    : "/opportunities";

  return (
    <Card className="overflow-hidden border-[#bae6fd]/80 bg-white transition-all duration-200 hover:border-[#7dd3fc] hover:shadow-sm">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header: Title, Org, Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {application.category && (
                <span className="rounded-md bg-[#e0f2fe] px-2 py-0.5 text-[11px] font-bold text-[#0369a1]">
                  {application.category}
                </span>
              )}
              {application.location && (
                <span className="inline-flex items-center gap-1 text-xs text-[#5a7b9d]">
                  <MapPin className="h-3 w-3 text-[#0369a1]" />
                  <span>{application.location}</span>
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0f2a43] tracking-tight">
              {application.opportunityTitle}
            </h3>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#335577]">
              <Building2 className="h-3.5 w-3.5 text-[#0369a1]" />
              <span>{application.organisation}</span>
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-1.5 shrink-0">
            <Badge variant={meta.variant} className="text-xs font-semibold px-2.5 py-1 gap-1">
              <StatusIcon className="h-3.5 w-3.5" />
              <span>{meta.label}</span>
            </Badge>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#5a7b9d] tabular-nums">
              <Calendar className="h-3 w-3" />
              Applied {formattedAppliedDate}
            </span>
          </div>
        </div>

        {/* Next Steps Guidance Callout */}
        <div className="rounded-xl border border-[#bae6fd]/70 bg-[#f4f9ff] p-3.5 text-xs text-[#335577]">
          <div className="flex items-start gap-2.5">
            <div className="rounded-lg bg-white p-1 text-[#0369a1] border border-[#bae6fd]/50 shrink-0 mt-0.5">
              <StatusIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-[#0f2a43]">Milestone Guidance</p>
              <p className="mt-0.5 text-[#335577] leading-relaxed">
                {application.nextStep ?? meta.stepGuidance}
              </p>
            </div>
          </div>
        </div>

        {/* Submitted Pitch Disclosure */}
        {application.pitchText && (
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowPitch(!showPitch)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0369a1] hover:text-[#075985] underline underline-offset-2 cursor-pointer"
            >
              <span>{showPitch ? "Hide submitted statement of interest" : "View your submitted statement of interest"}</span>
              {showPitch ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {showPitch && (
              <div className="mt-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-3 text-xs text-[#0f2a43] italic leading-relaxed">
                &ldquo;{application.pitchText}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] pt-3 text-xs text-[#5a7b9d]">
          <div>
            <span className="tabular-nums text-[11px]">Last ledger update: {formattedUpdatedDate}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(application.status === "applied" || application.status === "pending" || application.status === "shortlisted") && onWithdraw && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onWithdraw(application.id)}
                className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 min-h-[36px]"
              >
                Withdraw
              </Button>
            )}

            {application.status === "completed" && (
              <Link
                href="/volunteer/reviews"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "text-xs border-[#bae6fd] text-[#0369a1] hover:bg-[#f4f9ff] gap-1 min-h-[36px]",
                })}
              >
                <Star className="h-3.5 w-3.5 text-[#0369a1]" />
                <span>Leave Review</span>
              </Link>
            )}

            <Link
              href={driveHref}
              className={buttonVariants({
                size: "sm",
                className: "bg-[#0369a1] hover:bg-[#075985] text-white text-xs font-semibold gap-1 min-h-[36px]",
              })}
            >
              <span>View Drive Details</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

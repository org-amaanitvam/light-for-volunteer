"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Application, ApplicationStatusType } from "@/types/volunteer";

interface ApplicationCardProps {
  application: Application;
  onWithdraw?: (id: string) => void;
}

const STATUS_METADATA: Record<
  ApplicationStatusType,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
    stepGuidance: string;
    stepIcon: string;
  }
> = {
  applied: {
    label: "Under Review",
    variant: "secondary",
    stepGuidance: "Your application was received and is currently being evaluated by the host organisation.",
    stepIcon: "⏳",
  },
  pending: {
    label: "Pending",
    variant: "secondary",
    stepGuidance: "Your application is awaiting coordinator review. Expected decision within 3 business days.",
    stepIcon: "⏳",
  },
  shortlisted: {
    label: "Shortlisted",
    variant: "default",
    stepGuidance: "You have been shortlisted! The team will reach out for a brief orientation or chat.",
    stepIcon: "🎉",
  },
  selected: {
    label: "Accepted & Confirmed",
    variant: "success",
    stepGuidance: "You are officially part of this drive! Review schedule details and report on time.",
    stepIcon: "🤝",
  },
  accepted: {
    label: "Accepted",
    variant: "success",
    stepGuidance: "Your application has been accepted. Coordinate directly with the organisation point of contact.",
    stepIcon: "✅",
  },
  completed: {
    label: "Service Completed",
    variant: "success",
    stepGuidance: "Drive completed successfully! Verified hours have been credited to your profile.",
    stepIcon: "🎓",
  },
  rejected: {
    label: "Not Selected",
    variant: "destructive",
    stepGuidance: "Volunteer capacity has been met for this drive. We encourage you to apply to other upcoming causes.",
    stepIcon: "ℹ️",
  },
  withdrawn: {
    label: "Withdrawn",
    variant: "outline",
    stepGuidance: "You withdrew this application. You may apply again if the drive is re-opened.",
    stepIcon: "↩️",
  },
};

export function ApplicationCard({ application, onWithdraw }: ApplicationCardProps) {
  const [showPitch, setShowPitch] = useState(false);
  const meta = STATUS_METADATA[application.status] ?? STATUS_METADATA.applied;

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

  return (
    <Card className="overflow-hidden border-sky-100/90 transition-all duration-200 hover:border-sky-200 hover:shadow-md">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {application.category && (
                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">
                  {application.category}
                </span>
              )}
              {application.location && (
                <span className="text-xs text-slate-500">📍 {application.location}</span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{application.opportunityTitle}</h3>
            <p className="text-sm font-medium text-slate-600">{application.organisation}</p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2">
            <Badge variant={meta.variant} className="text-xs font-semibold px-3 py-1">
              {meta.label}
            </Badge>
            <span className="text-[11px] text-slate-400">
              Applied {formattedAppliedDate}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3.5 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <span className="text-base shrink-0">{meta.stepIcon}</span>
            <div>
              <p className="font-semibold text-slate-900">Next Steps &amp; Status Guidance</p>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                {application.nextStep ?? meta.stepGuidance}
              </p>
            </div>
          </div>
        </div>

        {application.pitchText && (
          <div>
            <button
              type="button"
              onClick={() => setShowPitch(!showPitch)}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 underline underline-offset-2"
            >
              {showPitch ? "Hide submitted pitch ▲" : "View your submitted pitch ▼"}
            </button>
            {showPitch && (
              <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 italic">
                &ldquo;{application.pitchText}&rdquo;
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sky-100/60 pt-3 text-xs text-slate-500">
          <div>
            <span>Last activity: {formattedUpdatedDate}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(application.status === "applied" || application.status === "pending" || application.status === "shortlisted") && onWithdraw && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onWithdraw(application.id)}
                className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Withdraw
              </Button>
            )}

            {application.status === "completed" && (
              <Link href="/volunteer/reviews">
                <Button variant="outline" size="sm" className="text-xs">
                  ⭐ Leave Review
                </Button>
              </Link>
            )}

            {application.status === "selected" && (
              <Link href="/#opportunities">
                <Button variant="outline" size="sm" className="text-xs">
                  Drive Guidelines
                </Button>
              </Link>
            )}

            <Link href="/#opportunities">
              <Button size="sm" className="text-xs">
                View Drive
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

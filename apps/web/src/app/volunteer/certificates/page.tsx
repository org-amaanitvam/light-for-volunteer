"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { api, type CertificateItem } from "@/lib/api";
import {
  GraduationCap,
  Download,
  Building2,
  Calendar,
  Clock,
  FileCheck2,
  ShieldCheck,
  Compass,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getMyCertificates()
      .then((items) => {
        if (active) setCertificates(items);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load certificates.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function download(certificate: CertificateItem) {
    setDownloadingId(certificate.id);
    setError(null);
    try {
      const blob = await api.downloadCertificatePdf(certificate.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${certificate.certificateNumber || "certificate"}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not download certificate.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0f2a43] sm:text-3xl">
            Volunteer Certificates
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5a7b9d] leading-relaxed">
            Official completion certificates verified by host organisations and issued under Amaanitvam Foundation.
          </p>
        </div>
        <Link
          href="/opportunities"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "self-start sm:self-auto border-[#bae6fd] text-[#0369a1] hover:bg-[#f4f9ff] text-xs font-bold gap-1.5 shadow-sm",
          })}
        >
          <Compass className="h-4 w-4" />
          <span>Explore Opportunities</span>
        </Link>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center" role="status" aria-label="Loading certificates">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0369a1] border-t-transparent" />
            <p className="text-xs font-semibold text-[#335577]">Retrieving volunteer certificates…</p>
          </div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#bae6fd] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#0369a1]">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[#0f2a43]">No completed drives yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#5a7b9d] leading-relaxed">
            When an organisation confirms your volunteer service as completed, your official digital certificate will appear here.
          </p>
          <Link
            href="/opportunities"
            className={buttonVariants({
              size: "sm",
              className: "mt-5 inline-flex bg-[#0369a1] hover:bg-[#075985] text-white text-xs font-bold gap-1.5 shadow-sm",
            })}
          >
            <Compass className="h-4 w-4" />
            <span>Find Volunteer Opportunities</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <Card
              key={certificate.id}
              className="flex flex-col justify-between border-[#bae6fd]/80 bg-white shadow-sm transition hover:border-[#7dd3fc] hover:shadow-md"
            >
              <CardHeader className="pb-3 border-b border-[#f1f5f9]">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e0f2fe] text-[#0369a1]">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5 gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Completion</span>
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold leading-snug text-[#0f2a43]">
                  {certificate.opportunityTitle}
                </CardTitle>
                <CardDescription className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#335577]">
                  <Building2 className="h-3.5 w-3.5 text-[#0369a1]" />
                  <span>{certificate.organisation}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2 rounded-xl border border-[#e0f2fe] bg-[#f8fafc] p-3.5 text-xs text-[#335577]">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[#5a7b9d] flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#0369a1]" />
                      <span>Completed</span>
                    </span>
                    <span className="font-semibold tabular-nums text-[#0f2a43]">
                      {new Date(certificate.completedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[#5a7b9d] flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#0369a1]" />
                      <span>Verified Hours</span>
                    </span>
                    <span className="font-mono font-bold text-[#0369a1] tabular-nums">
                      {certificate.hoursVolunteered} hrs
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3 border-t border-[#e2e8f0] pt-2 mt-1">
                    <span className="text-[#5a7b9d] flex items-center gap-1">
                      <FileCheck2 className="h-3 w-3 text-[#0369a1]" />
                      <span>Certificate ID</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#075985] select-all">
                      {certificate.certificateNumber}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#0369a1] hover:bg-[#075985] text-white text-xs font-bold gap-2 min-h-[40px] shadow-sm"
                  disabled={downloadingId === certificate.id}
                  onClick={() => void download(certificate)}
                >
                  <Download className={`h-4 w-4 ${downloadingId === certificate.id ? "animate-bounce" : ""}`} />
                  <span>
                    {downloadingId === certificate.id
                      ? "Generating PDF…"
                      : "Download Certificate PDF"}
                  </span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Institutional Authentic Notice */}
      <div className="rounded-xl border border-[#bae6fd]/80 bg-[#f4f9ff] p-4 text-xs text-[#335577] flex items-center gap-2">
        <FileText className="h-4 w-4 text-[#0369a1] shrink-0" />
        <span>
          Each PDF certificate includes verified volunteer hours, host organisation attribution, and an official Certificate ID.
        </span>
      </div>
    </div>
  );
}

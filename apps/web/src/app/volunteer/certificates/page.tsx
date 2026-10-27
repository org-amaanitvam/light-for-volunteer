"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Certificate } from "@/types/volunteer";
import { getMockCertificates } from "@/lib/volunteer-mock-adapter";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  function loadCertificates() {
    setLoading(true);
    setError(null);
    getMockCertificates()
      .then((data) => {
        setCertificates(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load certificates. Please try again.");
        setLoading(false);
      });
  }

  function handlePlaceholderDownload(cert: Certificate) {
    if (cert.fileUrl) {
      window.open(cert.fileUrl, "_blank");
      return;
    }

    setNotice(
      `Certificate file for "${cert.opportunityTitle}" is being verified. Direct PDF download will be activated as soon as the organization publishes the signed copy.`
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Volunteer Certificates
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Verified certificates of completion issued by partnered social impact organisations.
          </p>
        </div>
        <Link href="/#opportunities">
          <Button variant="outline" className="self-start sm:self-auto gap-2">
            <span>📋</span> Explore Completed Drives
          </Button>
        </Link>
      </div>

      {notice && (
        <div className="flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-bold text-sky-700 hover:text-sky-900"
          >
            ✕
          </button>
        </div>
      )}

      {loading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50/40 p-6 text-center">
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <Button size="sm" variant="outline" onClick={loadCertificates}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && certificates.length === 0 && (
        <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl">
            🎓
          </div>
          <h3 className="text-base font-bold text-slate-900">No certificates issued yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Certificates are automatically awarded once an organisation coordinator marks your volunteer drive participation as completed.
          </p>
          <div className="mt-5 flex justify-center">
            <Link href="/#opportunities">
              <Button size="sm">Find Volunteer Drives</Button>
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && certificates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => {
            const formattedDate = new Date(cert.completedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <Card
                key={cert.id}
                className="flex flex-col justify-between border-sky-100 shadow-sm transition-all duration-200 hover:border-sky-200 hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🎓</span>
                    <Badge
                      variant={cert.verified ? "success" : "secondary"}
                      className="text-[10px] font-bold px-2 py-0.5"
                    >
                      {cert.verified ? "✓ Verified Certificate" : "Verification Pending"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                    {cert.opportunityTitle}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 font-medium">
                    Issued by {cert.organisation}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="rounded-xl border border-sky-50 bg-sky-50/30 p-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Completed Date:</span>
                      <span className="font-semibold text-slate-700">{formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recognized Hours:</span>
                      <span className="font-bold text-sky-700">{cert.hoursVolunteered} Hours</span>
                    </div>
                    {cert.certificateNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Credential ID:</span>
                        <span className="font-mono text-[11px] text-slate-600">
                          {cert.certificateNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-sky-50">
                    {cert.fileUrl ? (
                      <Button
                        size="sm"
                        className="w-full gap-2 text-xs font-semibold"
                        onClick={() => handlePlaceholderDownload(cert)}
                      >
                        <span>📥</span> Download Official PDF
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 text-xs font-semibold text-slate-600 border-dashed"
                          onClick={() => handlePlaceholderDownload(cert)}
                        >
                          <span>📄</span> Certificate File Pending
                        </Button>
                        <p className="text-[10px] text-slate-400 text-center">
                          Download will activate upon coordinator signing
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Certificate Architecture Note:</p>
        <p className="mt-0.5">
          Certificate records are managed through the volunteer certificates mock adapter. No backend certificate generation endpoint (`GET /api/certificates`) exists yet. When the file storage / certificate signing service is integrated, this view will bind directly to authenticated signed URLs.
        </p>
      </div>
    </div>
  );
}

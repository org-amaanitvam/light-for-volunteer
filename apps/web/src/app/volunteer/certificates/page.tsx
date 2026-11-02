"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, type CertificateItem } from "@/lib/api";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.getMyCertificates().then((items) => {
      if (active) setCertificates(items);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Could not load certificates.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function download(certificate: CertificateItem) {
    setDownloadingId(certificate.id);
    setError(null);
    try {
      const blob = await api.downloadCertificatePdf(certificate.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${certificate.certificateNumber}.pdf`;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Volunteer Certificates</h1>
          <p className="mt-1 text-sm text-slate-500">Download certificates for opportunities marked completed by the organisation.</p>
        </div>
        <Link href="/opportunities"><Button variant="outline">Explore opportunities</Button></Link>
      </div>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-3xl border border-sky-100 bg-white p-12 text-center text-sm text-slate-500">Loading certificates…</div>
      ) : certificates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl">🎓</div>
          <h3 className="text-base font-bold text-slate-900">No completed opportunities yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">When an organisation marks your application complete, your certificate will appear here.</p>
          <Link href="/opportunities" className="mt-5 inline-block"><Button size="sm">Find volunteer opportunities</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="flex flex-col justify-between border-sky-100 shadow-sm">
              <CardHeader className="pb-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl">🎓</span>
                  <Badge variant="success" className="text-[10px] font-bold">✓ Verified completion</Badge>
                </div>
                <CardTitle className="text-base leading-snug text-slate-900">{certificate.opportunityTitle}</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-600">Completed with {certificate.organisation}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2 rounded-xl border border-sky-50 bg-sky-50/30 p-3 text-xs text-slate-600">
                  <p className="flex justify-between gap-3"><span className="text-slate-400">Completed</span><span className="font-semibold">{new Date(certificate.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></p>
                  <p className="flex justify-between gap-3"><span className="text-slate-400">Verified hours</span><span className="font-semibold">{certificate.hoursVolunteered}</span></p>
                  <p className="flex justify-between gap-3"><span className="text-slate-400">Certificate ID</span><span className="font-mono">{certificate.certificateNumber}</span></p>
                </div>
                <Button className="w-full" disabled={downloadingId === certificate.id} onClick={() => void download(certificate)}>
                  {downloadingId === certificate.id ? "Preparing PDF…" : "Download certificate PDF"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

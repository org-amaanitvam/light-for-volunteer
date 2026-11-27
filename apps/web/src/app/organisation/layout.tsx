"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { api, OrganisationProfileItem } from "@/lib/api";
import { OrganisationNav } from "@/components/organisation/organisation-nav";

export default function OrganisationLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orgData, setOrgData] = useState<OrganisationProfileItem | null>(null);

  useEffect(() => {
    let active = true;
    if (user?.role === "organisation") {
      api.getMyOrganisation()
        .then((data) => {
          if (active) setOrgData(data);
        })
        .catch(() => {
          // If profile is not found or not yet created, we handle gracefully
        });
    }
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col font-sans">
      <OrganisationNav 
        orgName={orgData?.orgName || user?.name}
        verificationStatus={orgData?.verificationStatus}
      />
      <main className="flex-1">
        {/* Consistent Organisation Workspace Horizon Banner (Zephyr 032.png) */}
        <div className="relative overflow-hidden border-b border-[#bae6fd]/80 bg-white py-6 px-4 sm:px-6 lg:px-8 mb-6 shadow-sm">
          <div
            className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: "url('/Zephyr%20032.png')",
              backgroundPosition: "center 22%",
            }}
            aria-hidden="true"
          />
          {/* Daylight gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/45 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#bae6fd] bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-[#0369a1] mb-1.5 shadow-xs">
                <span>Institutional Partner Console</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0f2a43] tracking-tight">
                {orgData?.orgName || user?.name || "Organisation Workspace"}
              </h1>
              <p className="text-xs text-[#335577] mt-0.5">
                Drive publishing, attendance ledger verification, and credential issuance.
              </p>
            </div>
          </div>
        </div>

        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Light for Volunteer — An initiative of Amaanitvam Foundation.</p>
          <p className="font-mono text-[11px] text-slate-400">Architectural Civic Ledger • Strict Security Boundaries</p>
        </div>
      </footer>
    </div>
  );
}

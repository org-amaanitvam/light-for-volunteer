"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { 
  Building2, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";

interface OrganisationNavProps {
  orgName?: string;
  verificationStatus?: string;
}

export function OrganisationNav({ orgName, verificationStatus }: OrganisationNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isPlatformAdmin = user?.role === "admin";

  const navItems = [
    {
      href: "/organisation/dashboard",
      label: "Drives & Operations",
      icon: LayoutDashboard,
      description: "Manage opportunities & applicants",
    },
    {
      href: "/organisation/profile",
      label: "Organisation Dossier",
      icon: Building2,
      description: "Legal profile & verification",
    },
    {
      href: "/organisation/admin",
      label: isPlatformAdmin ? "Platform Governance" : "Governance & Access",
      icon: ShieldCheck,
      description: isPlatformAdmin ? "Admin moderation console" : "Administrative permissions",
      badge: isPlatformAdmin ? "Admin" : undefined,
    },
  ];

  function renderStatusBadge() {
    if (!verificationStatus) return null;
    const s = verificationStatus.toLowerCase();
    if (s === "verified") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
          <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
          Verified NGO
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
          <AlertCircle className="h-3.5 w-3.5 text-red-600" />
          Verification Needs Attention
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
        <Clock className="h-3.5 w-3.5 text-amber-600" />
        Verification Pending
      </span>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Top Banner / Utility Bar */}
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-sky-800">Light for Volunteer</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-700">Amaanitvam Foundation</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Organisation Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/opportunities" 
              className="inline-flex items-center gap-1 font-medium text-sky-700 hover:text-sky-900 transition-colors"
            >
              Public Catalogue
              <ExternalLink className="h-3 w-3" />
            </Link>
            {user && (
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-red-700 transition-colors"
                title="Sign out of organisation account"
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Organisation Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 font-bold shadow-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  {orgName || user?.name || "Organisation Workspace"}
                </h1>
                {renderStatusBadge()}
              </div>
              <p className="text-xs text-slate-500">
                Civic Ledger & Operations Console
              </p>
            </div>
          </div>

          {/* Navigation Items (Responsive horizontal pill strip) */}
          <nav 
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1"
            aria-label="Organisation workspace navigation"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "border border-sky-300 bg-sky-50 text-sky-900 shadow-xs"
                      : "border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-sky-700" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

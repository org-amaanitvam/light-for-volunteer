"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  ClipboardList,
  Award,
  Trophy,
  GraduationCap,
  Star,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export const VOLUNTEER_NAV_ITEMS = [
  { href: "/volunteer/dashboard", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/volunteer/profile", label: "My Profile", Icon: User, exact: false },
  { href: "/volunteer/applications", label: "Applications", Icon: ClipboardList, exact: false },
  { href: "/volunteer/badges", label: "Badges", Icon: Award, exact: false },
  { href: "/volunteer/leaderboard", label: "Leaderboard", Icon: Trophy, exact: false },
  { href: "/volunteer/certificates", label: "Certificates", Icon: GraduationCap, exact: false },
  { href: "/volunteer/reviews", label: "Reviews", Icon: Star, exact: false },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "V";

  return (
    <aside
      aria-label="Volunteer workspace navigation"
      className="flex h-full min-h-[calc(100vh-4.5rem)] w-64 flex-col border-r border-[#bae6fd]/80 bg-white shadow-sm"
    >
      {/* Volunteer Identity Ledger Header */}
      <div className="flex items-center gap-3 border-b border-[#e0f2fe] p-4 lg:p-5 bg-[#f4f9ff]/60">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0369a1] text-sm font-bold text-white shadow-sm">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name ?? "Volunteer"}
              className="h-11 w-11 rounded-xl object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#0f2a43]" title={user?.name ?? "Volunteer"}>
            {user?.name ?? "Volunteer"}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded bg-[#e0f2fe] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0369a1]">
              <ShieldCheck className="h-3 w-3" />
              Volunteer
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Volunteer Sections">
        {VOLUNTEER_NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href);
          const Icon = item.Icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1]",
                isActive
                  ? "bg-[#0369a1] text-white shadow-sm shadow-[#0369a1]/20 font-bold"
                  : "text-[#335577] hover:bg-[#f4f9ff] hover:text-[#0369a1]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-[#5a7b9d] group-hover:text-[#0369a1]"
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out & Ledger Trust Footer */}
      <div className="border-t border-[#e0f2fe] p-3 space-y-2 bg-[#f4f9ff]/30">
        <div className="px-2 py-1 text-[11px] text-[#5a7b9d] flex items-center justify-between">
          <span className="font-medium">Civic Trust Ledger</span>
          <span className="font-mono text-[10px] text-[#0369a1]">v2.4</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 rounded-xl text-xs font-semibold text-[#5a7b9d] hover:bg-red-50 hover:text-red-700 transition"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 shrink-0 text-red-500" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}

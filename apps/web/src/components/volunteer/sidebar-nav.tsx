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
      className="flex h-full min-h-[calc(100vh-4.5rem)] w-64 flex-col border-r border-[#e5e7eb] bg-white shadow-xs"
    >
      {/* Volunteer Identity Ledger Header */}
      <div className="flex items-center gap-3 border-b border-[#e5e7eb] p-4 lg:p-5 bg-[#edf3f4]/40">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#26505c] text-sm font-bold text-white shadow-xs">
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
          <p className="truncate text-sm font-bold text-[#1f2d35]" title={user?.name ?? "Volunteer"}>
            {user?.name ?? "Volunteer"}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded bg-[#edf3f4] border border-[#e5e7eb] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#26505c]">
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
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26505c]",
                isActive
                  ? "bg-[#26505c] text-white shadow-xs font-bold"
                  : "text-[#356775] hover:bg-[#edf3f4] hover:text-[#26505c]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-[#ffe970]" : "text-[#607b85] group-hover:text-[#26505c]"
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out & Ledger Trust Footer */}
      <div className="border-t border-[#e5e7eb] p-3 space-y-2 bg-[#edf3f4]/20">
        <div className="px-2 py-1 text-[11px] text-[#607b85] flex items-center justify-between">
          <span className="font-medium">Civic Trust Ledger</span>
          <span className="font-mono text-[10px] text-[#26505c] font-bold">v2.4</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 rounded-xl text-xs font-semibold text-[#607b85] hover:bg-red-50 hover:text-red-700 transition"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 shrink-0 text-red-500" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}

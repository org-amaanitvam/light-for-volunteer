"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/volunteer/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/volunteer/profile", label: "My Profile", icon: "👤" },
  { href: "/volunteer/applications", label: "Applications", icon: "📋" },
  { href: "/volunteer/badges", label: "Badges", icon: "🏅" },
  { href: "/volunteer/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/volunteer/certificates", label: "Certificates", icon: "🎓" },
  { href: "/volunteer/reviews", label: "Reviews", icon: "⭐" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "V";

  return (
    <aside className="flex h-full min-h-[calc(100vh-4.5rem)] w-64 flex-col border-r border-sky-100 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-sky-100 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-sm font-bold text-white shadow-md shadow-sky-500/20">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-11 w-11 rounded-2xl object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">
            {user?.name ?? "Volunteer"}
          </p>
          <span className="inline-block rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-700">
            Volunteer
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/volunteer/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                  : "text-slate-600 hover:bg-sky-50 hover:text-sky-900"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sky-100 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600"
          onClick={() => logout()}
        >
          <span className="text-base">🚪</span>
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

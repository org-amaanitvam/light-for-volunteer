"use client";

import { useAuth } from "@/context/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { SidebarNav, VOLUNTEER_NAV_ITEMS } from "@/components/volunteer/sidebar-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc]" role="status" aria-label="Loading workspace">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0369a1] border-t-transparent" />
          <p className="text-xs font-semibold tracking-wide text-[#335577] uppercase">
            Loading volunteer workspace…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "volunteer" && user.role !== "mentor") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4 bg-[#f8fafc]">
        <Card className="max-w-md border-[#bae6fd] bg-white text-center shadow-lg">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#0f2a43]">Volunteer or Mentor Role Required</h2>
              <p className="text-xs text-[#335577] leading-relaxed">
                You are currently signed in as <span className="font-semibold text-[#0f2a43]">{user.email}</span> with role{" "}
                <span className="font-bold uppercase tracking-wider text-[#0369a1]">{user.role}</span>. This workspace is reserved for registered volunteers and mentors.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-[#bae6fd] text-[#0369a1] hover:bg-[#f4f9ff] gap-1.5"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col md:flex-row bg-transparent">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:block md:w-64 md:shrink-0 sticky top-[4.5rem] h-[calc(100vh-4.5rem)] self-start">
        <SidebarNav />
      </div>

      {/* Mobile / Tablet Responsive Sub-Navigation Bar */}
      <header
        aria-label="Volunteer workspace navigation"
        className="md:hidden border-b border-[#bae6fd]/80 bg-white shadow-sm sticky top-[4.5rem] z-20 backdrop-blur-md"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#e0f2fe] bg-[#f4f9ff]/40">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0369a1] text-xs font-bold text-white">
              {user.name ? user.name.charAt(0).toUpperCase() : "V"}
            </div>
            <span className="text-xs font-bold text-[#0f2a43] truncate max-w-[160px]">
              {user.name ?? "Volunteer"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-bold text-[#0369a1] uppercase">
            <ShieldCheck className="h-3 w-3" />
            Volunteer Portal
          </span>
        </div>

        {/* Horizontal scrollable tab bar */}
        <nav
          className="flex overflow-x-auto gap-1 p-2 no-scrollbar"
          aria-label="Volunteer Workspace Mobile Tabs"
        >
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
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition min-h-[44px] shrink-0",
                  isActive
                    ? "bg-[#0369a1] text-white shadow-sm font-bold"
                    : "text-[#335577] bg-[#f4f9ff] hover:bg-[#e0f2fe] hover:text-[#0369a1]"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Workspace Content */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Consistent Workspace Horizon Banner (Zephyr 032.png) */}
          <div className="relative overflow-hidden rounded-2xl border border-[#bae6fd]/80 bg-white p-5 sm:p-6 shadow-sm">
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
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#bae6fd] bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-[#0369a1] mb-1.5 shadow-xs">
                  <ShieldCheck className="h-3 w-3 text-[#0284c7]" />
                  <span>Amaanitvam Volunteer Workspace</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f2a43] tracking-tight">
                  Welcome, {user.name || "Volunteer"}
                </h2>
                <p className="text-xs text-[#335577] mt-0.5">
                  Verified civic ledger, live participation tracking, and authenticated transcripts.
                </p>
              </div>
            </div>
          </div>

          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}

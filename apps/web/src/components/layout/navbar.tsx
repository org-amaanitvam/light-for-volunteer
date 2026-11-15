"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, ChevronDown, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [joinDisclosureOpen, setJoinDisclosureOpen] = useState(false);
  const joinDisclosureRef = useRef<HTMLDivElement>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  // Close disclosure dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (joinDisclosureRef.current && !joinDisclosureRef.current.contains(e.target as Node)) {
        setJoinDisclosureOpen(false);
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(e.target as Node)) {
        setAuthDropdownOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setJoinDisclosureOpen(false);
        setAuthDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const dashboardHref =
    user?.role === "organisation"
      ? "/organisation/dashboard"
      : user?.role === "admin"
        ? "/organisation/admin"
        : user?.role === "mentor"
          ? "/mentorship/profile"
          : "/volunteer/dashboard";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Opportunities", href: "/opportunities" },
    { name: "Mentors", href: "/mentorship" },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#e5e7eb] shadow-[0_1px_3px_rgba(31,45,53,0.04)] transition-[border-color,background-color] duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand Logo & Foundation Attribution */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26505c] rounded-lg">
          <div className="w-9 h-9 sm:w-10 sm:h-10 relative shrink-0 rounded-xl overflow-hidden border border-[#e5e7eb] shadow-xs">
            <Image
              src="/logo.jpeg"
              alt="Volunteer Yatra logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#26505c] group-hover:text-[#1e3f49] transition-colors">
              Volunteer Yatra
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-[#356775]">
              Light For Volunteer • Amaanitvam
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items (lg: 1024px+ breakpoint for balanced spacing) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`text-sm font-semibold py-1 transition-colors hover:text-[#26505c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26505c] rounded-md ${
                  isActive
                    ? "text-[#26505c] border-b-2 border-[#26505c]"
                    : "text-[#356775]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Auth (Desktop >= lg) */}
        <div className="hidden lg:flex items-center gap-3">
          <NotificationBell />

          {user ? (
            <div className="relative" ref={authDropdownRef}>
              <button
                type="button"
                onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                aria-expanded={authDropdownOpen}
                aria-controls="auth-user-dropdown"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e5e7eb] bg-[#edf3f4] hover:bg-[#e2ebec] text-[#1f2d35] transition-colors text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26505c] cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#26505c] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#26505c] transition-transform duration-150 ${authDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {authDropdownOpen && (
                <div
                  id="auth-user-dropdown"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#e5e7eb] bg-white p-2 shadow-xl z-50 animate-in fade-in duration-150 text-[#1f2d35]"
                >
                  <div className="px-3 py-2 border-b border-[#edf3f4] mb-1">
                    <p className="text-xs font-bold text-[#1f2d35]">{user.name}</p>
                    <p className="text-xs text-[#607b85] truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#edf3f4] text-[#26505c] capitalize">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() => setAuthDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#1f2d35] hover:bg-[#edf3f4] hover:text-[#26505c] rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#26505c]" /> My Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#d64545] hover:bg-[#fef2f2] rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="font-semibold text-[#356775] hover:text-[#26505c] text-sm px-3.5 py-2 rounded-xl hover:bg-[#edf3f4] transition-colors"
              >
                Log in
              </Link>

              {/* Accessible Join Volunteer Yatra Disclosure */}
              <div className="relative" ref={joinDisclosureRef}>
                <button
                  type="button"
                  onClick={() => setJoinDisclosureOpen((prev) => !prev)}
                  aria-expanded={joinDisclosureOpen}
                  aria-controls="join-disclosure-panel"
                  className="inline-flex items-center justify-center rounded-2xl text-sm font-bold h-11 px-5 bg-[#ffe970] hover:bg-[#f3b61f] text-[#26505c] shadow-[0_2px_8px_rgba(255,233,112,0.4)] gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26505c] cursor-pointer transition-all active:scale-[0.97]"
                >
                  Join Yatra <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${joinDisclosureOpen ? "rotate-180" : ""}`} />
                </button>

                {joinDisclosureOpen && (
                  <div
                    id="join-disclosure-panel"
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-[#e5e7eb] p-2 shadow-xl z-50 animate-in fade-in duration-150 text-[#1f2d35]"
                  >
                    <ul className="space-y-1">
                      <li>
                        <Link
                          href="/signup/volunteer"
                          onClick={() => setJoinDisclosureOpen(false)}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[#edf3f4] transition-colors text-left group"
                        >
                          <div className="p-1.5 rounded-lg bg-[#ffe970] text-[#26505c] mt-0.5 shrink-0 group-hover:bg-[#f3b61f] transition-colors">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1f2d35] group-hover:text-[#26505c]">
                              Join as Volunteer
                            </div>
                            <div className="text-[11px] text-[#607b85]">
                              Find causes &amp; build verified hours
                            </div>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/signup/organisation"
                          onClick={() => setJoinDisclosureOpen(false)}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[#edf3f4] transition-colors text-left group"
                        >
                          <div className="p-1.5 rounded-lg bg-[#edf3f4] text-[#26505c] mt-0.5 shrink-0 group-hover:bg-[#26505c] group-hover:text-white transition-colors">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1f2d35] group-hover:text-[#26505c]">
                              Register Organisation
                            </div>
                            <div className="text-[11px] text-[#607b85]">
                              Post drives &amp; coordinate volunteers
                            </div>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/signup/mentor"
                          onClick={() => setJoinDisclosureOpen(false)}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[#edf3f4] transition-colors text-left group"
                        >
                          <div className="p-1.5 rounded-lg bg-[#edf3f4] text-[#26505c] mt-0.5 shrink-0 group-hover:bg-[#26505c] group-hover:text-white transition-colors">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1f2d35] group-hover:text-[#26505c]">
                              Join as Mentor
                            </div>
                            <div className="text-[11px] text-[#607b85]">
                              Guide volunteers in community impact
                            </div>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile/Tablet menu trigger (below lg: <1024px) */}
        <div className="flex lg:hidden items-center gap-2">
          <NotificationBell />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-[#1f2d35] hover:bg-[#edf3f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26505c] cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#26505c]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Drawer (below lg) */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden border-t border-[#e5e7eb] bg-white px-5 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200 text-[#1f2d35] shadow-lg"
        >
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`text-sm font-semibold py-2.5 px-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-[#edf3f4] text-[#26505c] font-bold"
                      : "text-[#1f2d35] hover:bg-[#edf3f4] hover:text-[#26505c]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#e5e7eb] flex flex-col gap-2.5">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#607b85]">
                  Signed in as: <span className="font-semibold text-[#1f2d35]">{user.email}</span>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#edf3f4] px-3 py-2.5 text-sm font-semibold text-[#26505c] hover:bg-[#e2ebec]"
                >
                  <User className="h-4 w-4 text-[#26505c]" /> My Dashboard
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-[#d64545] border-[#fecaca] hover:bg-[#fef2f2] bg-transparent"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl border border-[#e5e7eb] bg-white hover:bg-[#edf3f4] text-[#1f2d35] text-sm font-semibold transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup/volunteer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 px-4 rounded-2xl bg-[#ffe970] hover:bg-[#f3b61f] text-[#26505c] text-sm font-bold shadow-sm transition-all"
                >
                  Join as Volunteer
                </Link>
                <Link
                  href="/signup/organisation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl bg-[#edf3f4] hover:bg-[#e2ebec] text-[#26505c] text-sm font-semibold transition-colors border border-[#e5e7eb]"
                >
                  Register Organisation
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

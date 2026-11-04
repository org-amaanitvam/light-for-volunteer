"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, Menu, X, User, LogOut, ChevronDown, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const dashboardHref = user?.role === "organisation"
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
{ name: "About Us", href: "/about" },
{ name: "Blog & Resources", href: "/blog" },
{ name: "Contact", href: "/contact" },
];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-sky-100/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-700 to-cyan-600 bg-clip-text text-transparent">
              Light of Volunteer
            </span>
            <span className="text-[10px] uppercase font-semibold text-sky-500 tracking-wider">
              Amaanitvam Foundation
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-sky-600 ${
                  isActive
                    ? "text-sky-600 font-semibold"
                    : "text-slate-600"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="hidden md:flex items-center gap-4">
          <NotificationBell />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-sky-900 transition text-sm font-medium focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-sky-600" />
              </button>

              {authDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setAuthDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-sky-100 bg-white p-2 shadow-xl z-40 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 py-2 border-b border-sky-50 mb-1">
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 uppercase text-[9px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-700">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 rounded-xl transition"
                    >
                      <User className="w-3.5 h-3.5 text-sky-500" /> My Profile / Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setAuthDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
                  Log in
                </Button>
              </Link>

              <div className="relative group">
                <Button
                  variant="gradient"
                  size="sm"
                  className="rounded-xl flex items-center gap-1.5 font-medium"
                >
                  Join Light <ChevronDown className="w-3.5 h-3.5" />
                </Button>

                {/* Submenu for Signup */}
                <div className="absolute right-0 top-full pt-2 w-56 hidden group-hover:block transition-all">
                  <div className="bg-white rounded-2xl border border-sky-100 p-2 shadow-xl backdrop-blur-md">
                    <Link
                      href="/signup/volunteer"
                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-sky-50 transition text-left"
                    >
                      <Users className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800">
                          Join as Volunteer
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Find causes & gain verified hours
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/signup/organisation"
                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-sky-50 transition text-left"
                    >
                      <Building2 className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800">
                          Register Organisation
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Post drives & manage volunteers
                        </div>
                      </div>
                    </Link>
                    <Link href="/signup/mentor" className="flex items-start gap-2.5 rounded-xl p-2.5 text-left transition hover:bg-sky-50">
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                      <div><div className="text-xs font-semibold text-slate-800">Join as Mentor</div><div className="text-[11px] text-slate-500">Share your experience with volunteers</div></div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-sky-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sky-100 bg-white/95 backdrop-blur-md px-5 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 py-1.5 hover:text-sky-600"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-sky-100 flex flex-col gap-2.5">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-500">
                  Signed in as: <span className="font-semibold text-slate-800">{user.email}</span>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-sky-200 px-3 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-50"
                >
                  <User className="h-4 w-4" /> My Profile / Dashboard
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-red-600 border-red-200"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup/volunteer" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full bg-sky-500">
                    Sign up as Volunteer
                  </Button>
                </Link>
                <Link href="/signup/organisation" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full text-sky-800">
                    Register as Organisation
                  </Button>
                </Link>
                <Link href="/signup/mentor" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Join as Mentor</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

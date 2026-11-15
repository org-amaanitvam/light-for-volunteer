"use client";

import React from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Globe,
  Share2,
  ShieldCheck,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#1e3f49] bg-[#26505c] text-[#edf3f4] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Foundation & Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe970] rounded-lg">
              <div className="w-10 h-10 rounded-2xl bg-[#ffe970] flex items-center justify-center text-[#26505c] shadow-sm">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-[#ffe970] transition-colors">
                  Volunteer Yatra
                </span>
                <span className="text-xs font-semibold text-[#ffe970]">
                  Light For Volunteer • Amaanitvam
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#edf3f4]/85 max-w-sm leading-relaxed">
              A warm, impact-driven travel and civic platform connecting passionate volunteers and interns with verified grassroots non-profits. We record, verify, and recognize community service across India.
            </p>

            {/* Official Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/lightofvolunteer?mdxt=dHZuMWNjbGgxYW9l"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#ffe970] hover:bg-[#ffe970] hover:text-[#26505c] transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe970]"
                aria-label="Follow Light For Volunteer on Instagram"
              >
                <Globe className="w-4 h-4" />
                <span className="sr-only">Instagram</span>
              </a>

              <a
                href="https://www.linkedin.com/company/light-of-volunteer/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#ffe970] hover:bg-[#ffe970] hover:text-[#26505c] transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe970]"
                aria-label="Follow Light For Volunteer on LinkedIn"
              >
                <Share2 className="w-4 h-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Explore Navigation */}
          <div>
            <h4 className="text-sm font-bold text-[#ffe970] mb-4">
              Explore
            </h4>

            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/opportunities" className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors">
                  Volunteer Opportunities
                </Link>
              </li>
              <li>
                <Link href="/mentorship" className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors">
                  Mentorship Network
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors">
                  Social Impact Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors">
                  About Amaanitvam
                </Link>
              </li>
            </ul>
          </div>

          {/* Participation Pathways */}
          <div>
            <h4 className="text-sm font-bold text-[#ffe970] mb-4">
              Participation
            </h4>

            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/signup/volunteer" className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors">
                  Volunteer Sign Up
                </Link>
              </li>
              <li>
                <Link href="/signup/organisation" className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors">
                  Register Organisation
                </Link>
              </li>
              <li>
                <Link href="/signup/mentor" className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors">
                  Join as Mentor
                </Link>
              </li>
              <li>
                <Link href="/volunteer/badges" className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors">
                  Recognition &amp; Credentials
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors">
                  Member Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Coordinates */}
          <div>
            <h4 className="text-sm font-bold text-[#ffe970] mb-4">
              Contact
            </h4>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#ffe970] shrink-0 mt-0.5" />
                <span className="text-[#edf3f4]/90">New Delhi &amp; Across India</span>
              </li>

              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#ffe970] shrink-0" />
                <a
                  href="mailto:lightofvolunteer@gmail.com"
                  className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors break-all"
                >
                  lightofvolunteer@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#ffe970] shrink-0" />
                <a
                  href="tel:+919891757935"
                  className="text-[#edf3f4]/90 hover:text-[#ffe970] transition-colors"
                >
                  +91 98917 57935
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#edf3f4]/70">
          <p>
            &copy; 2026 Volunteer Yatra • Light For Volunteer. An initiative of Amaanitvam Foundation.
          </p>

          <div className="flex items-center gap-1.5 text-[#ffe970] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#ffe970]" />
            <span>Verified Civic Platform · Built for Community Impact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

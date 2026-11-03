
"use client";

import React from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Heart,
  Globe,
  Share2,
} from "lucide-react";
export function Footer() {
  return (
    <footer className="border-t border-sky-100 bg-gradient-to-b from-sky-50/50 to-sky-100/40 text-slate-600 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <HeartHandshake className="w-5 h-5" />
              </div>

              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Light For Volunteer
                </span>
                <span className="block text-[10px] uppercase font-bold text-sky-600 tracking-wider">
                  Amaanitvam Foundation
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              Empowering change-makers and passionate volunteers. We connect
              grassroots NGOs, non-profits, and communities with people
              dedicated to creating meaningful social impact.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/lightofvolunteer?mdxt=dHZuMWNjbGgxYW9l"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-sky-200 flex items-center justify-center text-sky-600 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                aria-label="Instagram"
              >
                <Globe className="w-4 h-4" />
              </a>

              <a
                href="https://www.linkedin.com/company/light-of-volunteer/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-sky-200 flex items-center justify-center text-sky-600 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                aria-label="LinkedIn"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Explore
            </h4>

            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#opportunities" className="hover:text-sky-600 transition">
                  Volunteer Opportunities
                </Link>
              </li>

              <li>
                <Link href="/#organisations" className="hover:text-sky-600 transition">
                  Verified NGOs
                </Link>
              </li>

              <li>
                <Link href="/blog" className="hover:text-sky-600 transition">
                  Social Impact Blog
                </Link>
              </li>

              <li>
                <Link href="/about" className="hover:text-sky-600 transition">
                  About Amaanitvam
                </Link>
              </li>
            </ul>
          </div>

          {/* Join the Network */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Join the Network
            </h4>

            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/signup/volunteer" className="hover:text-sky-600 transition">
                  Volunteer Sign Up
                </Link>
              </li>

              <li>
                <Link href="/signup/organisation" className="hover:text-sky-600 transition">
                  Organisation Registration
                </Link>
              </li>

              <li>
                <Link href="/login" className="hover:text-sky-600 transition">
                  Member Portal Login
                </Link>
              </li>

              <li>
                <Link href="/#badges" className="hover:text-sky-600 transition">
                  Recognition & Badges
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Get in Touch
            </h4>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>New Delhi & Across India</span>
              </li>

              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                <a
                  href="mailto:lightofvolunteer@gmail.com"
                  className="hover:text-sky-600 transition break-all"
                >
                  lightofvolunteer@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                <a
                  href="tel:+919891757935"
                  className="hover:text-sky-600 transition"
                >
                  +91 98917 57935
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-sky-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 Light For Volunteer. An initiative of Amaanitvam Foundation.
          </p>

          <div className="flex items-center gap-1 text-slate-500">
            Built with
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
            for community impact
          </div>
        </div>
      </div>
    </footer>
  );
}

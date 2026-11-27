
"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";
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
  const { language } = useLanguage();

  const text = {
    en: {
      description:
        "A transparent civic ledger connecting passionate volunteers and interns with verified grassroots non-profits. We record, verify, and recognize community service across India.",
      explore: "Explore",
      opportunities: "Volunteer Opportunities",
      mentorship: "Mentorship Network",
      blog: "Social Impact Blog",
      about: "About Amaanitvam",
      participation: "Participation",
      volunteer: "Volunteer Sign Up",
      organisation: "Register Organisation",
      mentor: "Join as Mentor",
      recognition: "Recognition & Credentials",
      login: "Member Portal Login",
      contact: "Contact",
      location: "New Delhi & Across India",
      instagram: "Follow Light For Volunteer on Instagram",
      linkedin: "Follow Light For Volunteer on LinkedIn",
      copyright:
        "© 2026 Light For Volunteer. An initiative of Amaanitvam Foundation.",
      platform: "Verified Civic Platform · Built for Community Impact",
    },
    hi: {
      description:
        "एक पारदर्शी नागरिक मंच, जो उत्साही स्वयंसेवकों और प्रशिक्षुओं को सत्यापित जमीनी स्तर के गैर-लाभकारी संगठनों से जोड़ता है। हम पूरे भारत में सामुदायिक सेवा को दर्ज करते हैं, सत्यापित करते हैं और सम्मानित करते हैं।",
      explore: "जानें",
      opportunities: "स्वयंसेवा के अवसर",
      mentorship: "मार्गदर्शन नेटवर्क",
      blog: "सामाजिक प्रभाव ब्लॉग",
      about: "अमानित्वम के बारे में",
      participation: "भागीदारी",
      volunteer: "स्वयंसेवक के रूप में जुड़ें",
      organisation: "संस्था पंजीकृत करें",
      mentor: "मार्गदर्शक के रूप में जुड़ें",
      recognition: "सम्मान और प्रमाण-पत्र",
      login: "सदस्य पोर्टल लॉगिन",
      contact: "संपर्क करें",
      location: "नई दिल्ली और पूरे भारत में",
      instagram: "इंस्टाग्राम पर Light For Volunteer को फॉलो करें",
      linkedin: "लिंक्डइन पर Light For Volunteer को फॉलो करें",
      copyright:
        "© 2026 Light For Volunteer। अमानित्वम फाउंडेशन की एक पहल।",
      platform: "सत्यापित नागरिक मंच · सामुदायिक प्रभाव के लिए निर्मित",
    },
  };

  const t = text[language];

  return (
    <footer className="border-t border-[#bae6fd]/80 bg-[#f4f9ff] text-[#335577] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Foundation & Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] rounded-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0369a1] flex items-center justify-center text-white shadow-sm">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#0f2a43] group-hover:text-[#0369a1] transition-colors">
                  Light For Volunteer
                </span>
                <span className="text-xs font-semibold text-[#0369a1]">
                  Amaanitvam Foundation Initiative
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#335577] max-w-sm leading-relaxed">
              {t.description}
            </p>

            {/* Official Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/lightofvolunteer?mdxt=dHZuMWNjbGgxYW9l"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-[#bae6fd] flex items-center justify-center text-[#0369a1] hover:bg-[#0369a1] hover:text-white transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1]"
                aria-label={t.instagram}
              >
                <Globe className="w-4 h-4" />
                <span className="sr-only">Instagram</span>
              </a>

              <a
                href="https://www.linkedin.com/company/light-of-volunteer/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-[#bae6fd] flex items-center justify-center text-[#0369a1] hover:bg-[#0369a1] hover:text-white transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1]"
                aria-label={t.linkedin}
              >
                <Share2 className="w-4 h-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Explore Navigation */}
          <div>
            <h4 className="text-sm font-bold text-[#0c4a6e] mb-4">
              {t.explore}
            </h4>

            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/opportunities" className="hover:text-[#0369a1] transition-colors">
                  {t.opportunities}
                </Link>
              </li>
              <li>
                <Link href="/mentorship" className="hover:text-[#0369a1] transition-colors">
                  {t.mentorship}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#0369a1] transition-colors">
                  {t.blog}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#0369a1] transition-colors">
                  {t.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Participation Pathways */}
          <div>
            <h4 className="text-sm font-bold text-[#0c4a6e] mb-4">
              {t.participation}
            </h4>

            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/signup/volunteer" className="hover:text-[#0369a1] transition-colors">
                  {t.volunteer}
                </Link>
              </li>
              <li>
                <Link href="/signup/organisation" className="hover:text-[#0369a1] transition-colors">
                  {t.organisation}
                </Link>
              </li>
              <li>
                <Link href="/signup/mentor" className="hover:text-[#0369a1] transition-colors">
                  {t.mentor}
                </Link>
              </li>
              <li>
                <Link href="/volunteer/badges" className="hover:text-[#0369a1] transition-colors">
                  {t.recognition}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#0369a1] transition-colors">
                  {t.login}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Coordinates */}
          <div>
            <h4 className="text-sm font-bold text-[#0c4a6e] mb-4">
              {t.contact}
            </h4>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0369a1] shrink-0 mt-0.5" />
                <span>{t.location}</span>
              </li>

              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#0369a1] shrink-0" />
                <a
                  href="mailto:lightofvolunteer@gmail.com"
                  className="hover:text-[#0369a1] transition-colors break-all"
                >
                  lightofvolunteer@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#0369a1] shrink-0" />
                <a
                  href="tel:+919891757935"
                  className="hover:text-[#0369a1] transition-colors"
                >
                  +91 98917 57935
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#bae6fd]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5a7b9d]">
          <p>{t.copyright}</p>

          <div className="flex items-center gap-1.5 text-[#335577] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0369a1]" />
            <span>{t.platform}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

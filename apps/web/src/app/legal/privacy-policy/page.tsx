
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Mail,
  UserCheck,
} from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "1. Information We Collect",
    content: [
      "Account information such as your name, email address, phone number and account role.",
      "Profile information such as organisation details, location, website and descriptions.",
      "Documents submitted by organisations for verification, where applicable.",
      "Platform activity and information related to opportunities, applications and participation.",
    ],
  },
  {
    icon: Eye,
    title: "2. How We Use Your Information",
    content: [
      "To create and manage user accounts.",
      "To connect volunteers, mentors and organisations.",
      "To review organisation registration and verification submissions.",
      "To communicate important account updates and platform notifications.",
      "To maintain platform security and improve our services.",
    ],
  },
  {
    icon: Lock,
    title: "3. Information Protection",
    content: [
      "We aim to protect personal information through appropriate technical and organisational safeguards.",
      "Access to verification documents and account information should be limited to authorised personnel.",
      "Users should keep their login credentials confidential and notify us if they suspect unauthorised account access.",
    ],
  },
  {
    icon: UserCheck,
    title: "4. Information Sharing",
    content: [
      "Information may be shared with relevant platform users when necessary to provide platform services.",
      "Organisation information and verification status may be visible to users where required for transparency.",
      "Information may be disclosed where required by applicable law or a valid legal request.",
    ],
  },
  {
    icon: Database,
    title: "5. Data Retention",
    content: [
      "Information may be retained for as long as necessary to operate the platform, maintain records, resolve disputes and meet legal obligations.",
      "Specific retention periods and deletion procedures should be confirmed with the platform administrator.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "6. Your Choices and Rights",
    content: [
      "You should keep your account and profile information accurate and up to date.",
      "You may contact the platform team to request access to, correction of or deletion of your personal information, subject to applicable legal and operational requirements.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f4f9ff] text-[#244765]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e0f2fe] via-white to-[#eff6ff] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#0369a1] text-white flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0369a1] mb-3">
            Light For Volunteer
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0f2a43]">
            Privacy Policy
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-[#52718e]">
            Your privacy matters. This page explains how information may be
            collected, used and protected while using our platform.
          </p>

          <p className="mt-4 text-sm text-[#66829b]">
            Draft for review · Effective date to be confirmed
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white border border-[#dbeafe] rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-[#0f2a43] mb-3">
            About This Policy
          </h2>
          <p className="text-sm sm:text-base leading-7 text-[#52718e]">
            Light For Volunteer is an initiative of Amaanitvam Foundation.
            This draft describes the general privacy practices relevant to
            the platform, which connects volunteers, mentors and social impact
            organisations. The final policy should be reviewed and approved
            by the organisation before publication.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <section
                key={section.title}
                className="bg-white border border-[#dbeafe] rounded-2xl p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-[#0f2a43]">
                    {section.title}
                  </h2>
                </div>

                <ul className="space-y-3">
                  {section.content.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm sm:text-base leading-7 text-[#52718e]"
                    >
                      <span className="text-[#0284c7] mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <section className="mt-8 bg-[#e0f2fe] border border-[#bae6fd] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-[#0369a1]" />
            <h2 className="text-lg font-bold text-[#0f2a43]">
              Contact Us
            </h2>
          </div>

          <p className="text-sm sm:text-base leading-7 text-[#52718e]">
            If you have questions or privacy-related requests, contact our
            support team.
          </p>

          <a
            href="mailto:support@amaanitvam.org"
            className="inline-block mt-3 font-semibold text-[#0369a1] hover:underline"
          >
            support@amaanitvam.org
          </a>
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#0369a1] px-6 py-3 text-sm font-semibold text-white hover:bg-[#075985] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

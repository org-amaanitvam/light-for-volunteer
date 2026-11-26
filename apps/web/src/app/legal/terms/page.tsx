
import Link from "next/link";
import {
  FileText,
  Users,
  ShieldCheck,
  ClipboardCheck,
  AlertCircle,
  Scale,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: Users,
    title: "1. About the Platform",
    content: [
      "Light For Volunteer is an initiative of Amaanitvam Foundation.",
      "The platform connects volunteers, mentors, interns and social impact organisations.",
      "Users must provide accurate information when creating and maintaining their accounts.",
    ],
  },
  {
    icon: UserCheckIcon,
    title: "2. User Responsibilities",
    content: [
      "Users must keep their login credentials secure.",
      "Users must not submit false, misleading or fraudulent information.",
      "Users must communicate respectfully and behave responsibly while using the platform.",
      "Users must not misuse the platform or interfere with its normal operation.",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "3. Organisation Registration and Verification",
    content: [
      "Organisations may be asked to provide registration details and supporting documents.",
      "Submitted information and documents may be reviewed by authorised platform administrators.",
      "An organisation's verification status may be marked as Pending, Verified or Rejected.",
      "Submitting documents does not automatically guarantee verification or approval.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "4. Opportunities and Participation",
    content: [
      "Organisations are responsible for providing accurate information about their opportunities.",
      "Volunteers should review opportunity details and requirements before applying.",
      "Users should communicate with other participants through appropriate and respectful channels.",
      "The platform may review reported content or opportunities according to its moderation procedures.",
    ],
  },
  {
    icon: AlertCircle,
    title: "5. Prohibited Activities",
    content: [
      "Creating fake accounts or impersonating another person or organisation.",
      "Uploading misleading, unlawful or harmful content.",
      "Harassing, threatening or discriminating against other users.",
      "Using the platform for fraudulent, unauthorised or unlawful activities.",
    ],
  },
  {
    icon: Scale,
    title: "6. Platform Availability and Changes",
    content: [
      "Platform features and services may be updated, modified or temporarily unavailable.",
      "We aim to maintain a useful and reliable service but cannot guarantee uninterrupted availability.",
      "Any limitations of responsibility must be interpreted in accordance with applicable law.",
    ],
  },
  {
    icon: FileText,
    title: "7. Account Restrictions and Termination",
    content: [
      "Accounts may be reviewed if there are concerns about misuse, inaccurate information or violations of these terms.",
      "Appropriate action, including suspension or restriction, may be taken according to the platform's procedures and applicable law.",
    ],
  },
];

function UserCheckIcon({ className }: { className?: string }) {
  return <Users className={className} />;
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f4f9ff] text-[#244765]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e0f2fe] via-white to-[#eff6ff] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#0369a1] text-white flex items-center justify-center shadow-lg">
            <FileText className="w-8 h-8" />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0369a1] mb-3">
            Light For Volunteer
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0f2a43]">
            Terms and Conditions
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-[#52718e]">
            Please read these terms carefully before using the Light For
            Volunteer platform.
          </p>

          <p className="mt-4 text-sm text-[#66829b]">
            Draft for review · Effective date to be confirmed
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white border border-[#dbeafe] rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-[#0f2a43] mb-3">
            Welcome to Light For Volunteer
          </h2>
          <p className="text-sm sm:text-base leading-7 text-[#52718e]">
            These terms describe general conditions for accessing and using
            Light For Volunteer, an initiative of Amaanitvam Foundation.
            By using the platform, users are expected to follow the rules
            and responsibilities described here. The final terms must be
            reviewed and approved by the organisation before publication.
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
              Questions or Support?
            </h2>
          </div>

          <p className="text-sm sm:text-base leading-7 text-[#52718e]">
            For questions about these terms or the platform, contact our
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

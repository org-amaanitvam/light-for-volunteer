
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck,
  Building2,
  ClipboardCheck,
  SearchCheck,
  BadgeCheck,
  Mail,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: Building2,
    number: "01",
    title: "Organisation Registration",
    description:
      "Organisations register on Light For Volunteer by providing their organisation name, contact details, location, registration type and other relevant information.",
  },
  {
    icon: FileCheck,
    number: "02",
    title: "Document Submission",
    description:
      "Organisations provide supporting registration information and upload a PDF verification document through their organisation profile. The supported upload limit is 10 MB.",
  },
  {
    icon: SearchCheck,
    number: "03",
    title: "Administrative Review",
    description:
      "Authorised platform administrators review the submitted organisation information and available verification document before making a decision.",
  },
  {
    icon: ClipboardCheck,
    number: "04",
    title: "Verification Decision",
    description:
      "After review, the organisation's verification status may be marked as Verified or Rejected. A submission that has not yet been reviewed remains Pending.",
  },
  {
    icon: BadgeCheck,
    number: "05",
    title: "Profile Update and Resubmission",
    description:
      "Organisations can view their verification status through their profile. If a submission is rejected, the organisation can update its information or document and use the available resubmission process.",
  },
];

const documents = [
  "Organisation Registration Certificate",
  "Trust Deed or Society Registration Certificate, where applicable",
  "PAN Card",
  "12A or 80G registration documents, where applicable",
  "NGO Darpan ID, where applicable",
  "Certificate of Incorporation for registered companies",
];

export default function HowWeVerifyPage() {
  return (
    <div className="min-h-screen bg-[#f4f9ff] text-[#244765]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e0f2fe] via-white to-[#eff6ff] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#0369a1] text-white flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0369a1] mb-3">
            Trust Through Transparency
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0f2a43]">
            How We Verify NGOs
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-[#52718e]">
            We review organisation registration information and supporting
            documents to help build a more transparent and trustworthy
            volunteering community.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Introduction */}
        <section className="bg-white border border-[#dbeafe] rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-[#0f2a43] mb-4">
            Why Organisation Verification Matters
          </h2>

          <p className="text-sm sm:text-base leading-7 text-[#52718e]">
            Light For Volunteer is an initiative of Amaanitvam Foundation.
            Organisation verification is part of our effort to help volunteers
            discover organisations with reviewed registration information.
            Our review process helps administrators assess submitted
            information before an organisation receives verified status.
          </p>
        </section>

        {/* Verification Steps */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <p className="text-sm font-bold uppercase tracking-wider text-[#0369a1]">
              Our Process
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2a43] mt-2">
              Steps in Organisation Verification
            </h2>
          </div>

          <div className="space-y-5">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="bg-white border border-[#dbeafe] rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row gap-5"
                >
                  <div className="flex items-center gap-3 sm:block">
                    <div className="w-12 h-12 rounded-xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="text-sm font-bold text-[#0284c7] sm:hidden">
                      STEP {step.number}
                    </span>
                  </div>

                  <div className="flex-1">
                    <span className="hidden sm:block text-xs font-bold tracking-widest text-[#0284c7] mb-2">
                      STEP {step.number}
                    </span>

                    <h3 className="text-lg font-bold text-[#0f2a43] mb-2">
                      {step.title}
                    </h3>

                    <p className="text-sm sm:text-base leading-7 text-[#52718e]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Supporting Documents */}
        <section className="bg-white border border-[#dbeafe] rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#0f2a43]">
              Supporting Documents
            </h2>
          </div>

          <p className="text-sm sm:text-base leading-7 text-[#52718e] mb-5">
            Depending on the organisation&apos;s legal structure and registration
            type, relevant documents may include:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((document) => (
              <li
                key={document}
                className="flex items-start gap-3 bg-[#f4f9ff] rounded-xl p-4 text-sm text-[#335577]"
              >
                <ShieldCheck className="w-5 h-5 text-[#0284c7] shrink-0" />
                <span>{document}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs leading-6 text-[#66829b] mt-5">
            Document requirements depend on the organisation type. The
            organisation profile currently supports one PDF verification
            document per submission, up to 10 MB.
          </p>
        </section>

        {/* Status Information */}
        <section className="bg-white border border-[#dbeafe] rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0f2a43] mb-5">
            Understanding Verification Status
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <span className="w-3 h-3 rounded-full bg-amber-400 mt-2 shrink-0" />
              <div>
                <h3 className="font-bold text-[#0f2a43]">Pending</h3>
                <p className="text-sm leading-6 text-[#52718e]">
                  The organisation&apos;s submission is awaiting administrative
                  review.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="w-3 h-3 rounded-full bg-green-500 mt-2 shrink-0" />
              <div>
                <h3 className="font-bold text-[#0f2a43]">Verified</h3>
                <p className="text-sm leading-6 text-[#52718e]">
                  The organisation&apos;s submitted information has been reviewed
                  and its verification status has been approved.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="w-3 h-3 rounded-full bg-red-500 mt-2 shrink-0" />
              <div>
                <h3 className="font-bold text-[#0f2a43]">Rejected</h3>
                <p className="text-sm leading-6 text-[#52718e]">
                  The submission was not approved. The organisation can use
                  the available profile resubmission process.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Important Note */}
        <section className="bg-[#e0f2fe] border border-[#bae6fd] rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#0f2a43] mb-3">
            An Important Note
          </h2>

          <p className="text-sm sm:text-base leading-7 text-[#52718e]">
            Verification on Light For Volunteer indicates that submitted
            organisation information has undergone the platform&apos;s
            administrative review. It should not be understood as a guarantee
            of an organisation&apos;s activities, financial position, future
            conduct or the outcome of any volunteering opportunity. Volunteers
            should exercise their own judgement before participating.
          </p>
        </section>

        {/* Contact */}
        <section className="mt-8 text-center">
          <Mail className="w-7 h-7 text-[#0369a1] mx-auto mb-3" />

          <h2 className="text-xl font-bold text-[#0f2a43]">
            Have Questions?
          </h2>

          <p className="text-sm text-[#52718e] mt-2">
            Contact our support team for assistance with organisation
            verification.
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
            className="inline-flex items-center gap-2 rounded-xl bg-[#0369a1] px-6 py-3 text-sm font-semibold text-white hover:bg-[#075985] transition-colors"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

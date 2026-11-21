"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  ChevronRight,
  X,
  HelpCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OrganisationType = "ngo" | "company" | "institution";

type FormStep = "type" | "details" | "documents" | "otp" | "consent" | "success";

interface OrganisationFormData {
  type: OrganisationType | "";
  orgName: string;
  contactPerson: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  website: string;
  about: string;
  // Type-specific fields
  registrationType?: string; // Section 8 / Trust / Company / DARPAN etc.
  registrationId?: string;
  darpanId?: string;
  cin?: string;
  gstOrPan?: string;
  authorisationLetter?: string;
  affiliationProof?: string;
  // Files
  logoFile?: File | null;
  documentFiles?: Record<string, File | null>;
}

// ---------------------------------------------------------------------------
// Required documents per organisation type
// ---------------------------------------------------------------------------

const REQUIRED_DOCUMENTS: Record<OrganisationType, { key: string; label: string; accept: string }[]> = {
  ngo: [
    { key: "registrationCertificate", label: "Registration Certificate", accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "pan", label: "PAN Card", accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "12a", label: "12A Registration", accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "80g", label: "80G Certificate", accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "darpanId", label: "NGO Darpan ID", accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  company: [
    { key: "cin", label: "CIN Certificate", accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "gstOrPan", label: "GST or PAN", accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "authorisationLetter", label: "Authorisation Letter", accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  institution: [
    { key: "affiliationProof", label: "Affiliation Proof", accept: ".pdf,.jpg,.jpeg,.png" },
  ],
};

const TYPE_LABELS: Record<OrganisationType, string> = {
  ngo: "NGO / Non-Profit",
  company: "Company / Private Limited",
  institution: "Institution / College",
};

const TYPE_DESCRIPTIONS: Record<OrganisationType, string> = {
  ngo: "Trust, Section 8, Society, or DARPAN-registered non-profit",
  company: "Private Limited, LLP, or registered company",
  institution: "Educational or research institution",
};

// ---------------------------------------------------------------------------
// Helper: initial form state
// ---------------------------------------------------------------------------

const initialForm: OrganisationFormData = {
  type: "",
  orgName: "",
  contactPerson: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  website: "",
  about: "",
  documentFiles: {},
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OrganisationSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>("type");
  const [form, setForm] = useState<OrganisationFormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const requiredDocs = form.type ? REQUIRED_DOCUMENTS[form.type] : [];

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  const validateStep = useCallback((currentStep: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === "type") {
      if (!form.type) newErrors.type = "Please select an organisation type";
    }

    if (currentStep === "details") {
      if (!form.orgName.trim()) newErrors.orgName = "Organisation name is required";
      if (!form.contactPerson.trim()) newErrors.contactPerson = "Contact person is required";
      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email address";
      if (!form.password) newErrors.password = "Password is required";
      else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
      if (!form.city.trim()) newErrors.city = "City / headquarters is required";

      // Type-specific required fields
      if (form.type === "ngo") {
        if (!form.registrationType?.trim()) newErrors.registrationType = "Registration type is required";
        if (!form.registrationId?.trim()) newErrors.registrationId = "Registration ID is required";
        if (!form.darpanId?.trim()) newErrors.darpanId = "NGO Darpan ID is required";
      }
      if (form.type === "company") {
        if (!form.cin?.trim()) newErrors.cin = "CIN is required";
        if (!form.gstOrPan?.trim()) newErrors.gstOrPan = "GST or PAN is required";
      }
      if (form.type === "institution") {
        if (!form.affiliationProof?.trim()) newErrors.affiliationProof = "Affiliation proof is required";
      }
    }

    if (currentStep === "documents") {
      if (!form.logoFile) newErrors.logoFile = "Organisation logo is required";
      for (const doc of requiredDocs) {
        if (!form.documentFiles?.[doc.key]) {
          newErrors[doc.key] = `${doc.label} is required`;
        }
      }
    }

    if (currentStep === "otp") {
      if (!otpSent) newErrors.otp = "OTP has not been sent yet";
      else if (!otpCode || otpCode.length !== 6) newErrors.otp = "Please enter the 6-digit OTP";
    }

    if (currentStep === "consent") {
      if (!consentChecked) newErrors.consent = "You must accept the terms to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, requiredDocs, otpCode, otpSent]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleInputChange = (key: keyof OrganisationFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleFileChange = (key: string, file: File | null) => {
    setForm((prev) => ({
      ...prev,
      documentFiles: { ...prev.documentFiles, [key]: file },
    }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleLogoChange = (file: File | null) => {
    setForm((prev) => ({ ...prev, logoFile: file }));
    setErrors((prev) => ({ ...prev, logoFile: "" }));
  };

  const goToNextStep = () => {
    if (!validateStep(step)) return;
    const steps: FormStep[] = ["type", "details", "documents", "otp", "consent"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const goToPrevStep = () => {
    const steps: FormStep[] = ["type", "details", "documents", "otp", "consent"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      // Call backend OTP send endpoint (to be implemented by backend team)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, purpose: "organisation_signup" }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      setOtpSent(true);
      setStep("otp");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep("consent")) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.contactPerson,
          email: form.email,
          password: form.password,
          role: "organisation",
          phone: form.phone || undefined,
          city: form.city || undefined,
          orgName: form.orgName,
          registrationType: form.registrationType,
          registrationId: form.registrationId,
          darpanId: form.darpanId,
          cin: form.cin,
          gstOrPan: form.gstOrPan,
          affiliationProof: form.affiliationProof,
          website: form.website || undefined,
          about: form.about || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to register organisation");
      }

      const data = await res.json();
      setStep("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to register organisation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = (() => {
    const steps: FormStep[] = ["type", "details", "documents", "otp", "consent"];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  })();

  // -------------------------------------------------------------------------
  // Step renderers
  // -------------------------------------------------------------------------

  const renderStepType = () => (
    <>
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white mx-auto mb-4">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Select Organisation Type</h2>
        <p className="mt-2 text-sm text-slate-500">
          Choose the type that best describes your organisation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["ngo", "company", "institution"].map((t) => {
          const isSelected = form.type === t;
          return (
            <button
              key={t}
              onClick={() => {
                setForm((prev) => ({ ...prev, type: t as OrganisationType }));
                setErrors((prev) => ({ ...prev, type: "" }));
              }}
              className={`flex flex-col items-center p-6 rounded-2xl border transition-all ${
                isSelected
                  ? "border-cyan-600 bg-cyan-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isSelected ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {t === "ngo" ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : t === "company" ? (
                  <Building2 className="w-5 h-5" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </div>
              <span className={`font-semibold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                {TYPE_LABELS[t as OrganisationType]}
              </span>
              <p className="mt-1 text-xs text-slate-400 text-center">
                {TYPE_DESCRIPTIONS[t as OrganisationType]}
              </p>
            </button>
          );
        })}
      </div>

      {errors.type && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.type}</span>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          variant="gradient"
          onClick={goToNextStep}
          disabled={!form.type || loading}
          className="text-sm"
        >
          Next <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </>
  );

  const renderStepDetails = () => (
    <>
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white mx-auto mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Organisation Details</h2>
        <p className="mt-2 text-sm text-slate-500">
          Tell us about your organisation
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); goToNextStep(); }} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Organisation / NGO Name <span className="text-red-500">*</span>
            </label>
            <InputField
              id="orgName"
              value={form.orgName}
              onChange={(e) => handleInputChange("orgName", e.target.value)}
              error={errors.orgName}
              placeholder="e.g. Green Earth Foundation"
              icon={<Building2 className="w-4 h-4" />}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Authorized Contact Person <span className="text-red-500">*</span>
            </label>
            <InputField
              id="contactPerson"
              value={form.contactPerson}
              onChange={(e) => handleInputChange("contactPerson", e.target.value)}
              error={errors.contactPerson}
              placeholder="e.g. Priya Nair (Executive Director)"
              icon={<FileText className="w-4 h-4" />}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Official Email Address <span className="text-red-500">*</span>
            </label>
            <InputField
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={errors.email}
              placeholder="contact@greenearth.org"
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Create Password <span className="text-red-500">*</span>
            </label>
            <InputField
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              error={errors.password}
              placeholder="At least 8 characters"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Official Phone <span className="text-red-500">*</span>
            </label>
            <InputField
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              error={errors.phone}
              placeholder="+91 11 2345 6789"
              icon={<Phone className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City / Headquarter <span className="text-red-500">*</span>
            </label>
            <InputField
              id="city"
              value={form.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              error={errors.city}
              placeholder="New Delhi, Pune, Chennai..."
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Website
            </label>
            <InputField
              id="website"
              type="url"
              value={form.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://greenearth.org"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              About / Description
            </label>
            <textarea
              id="about"
              value={form.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
              placeholder="Tell us about your mission and impact..."
              className="w-full h-24 rounded-xl border border-sky-100 bg-white/90 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm resize-none"
            />
          </div>
        </div>

        {/* Type-specific fields */}
        {form.type === "ngo" && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h3 className="text-xs font-semibold text-amber-800 mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-amber-600" /> NGO Specific
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registration Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.registrationType || ""}
                  onChange={(e) => handleInputChange("registrationType", e.target.value)}
                  className="w-full h-11 rounded-xl border border-sky-100 bg-white px-3.5 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <option value="">Select type</option>
                  <option value="Section 8">Section 8 Company</option>
                  <option value="Trust">Trust</option>
                  <option value="Society">Society</option>
                  <option value="DARPAN">DARPAN Registered</option>
                </select>
                {errors.registrationType && (
                  <p className="mt-1 text-xs text-red-600">{errors.registrationType}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registration ID <span className="text-red-500">*</span>
                </label>
                <InputField
                  id="registrationId"
                  value={form.registrationId || ""}
                  onChange={(e) => handleInputChange("registrationId", e.target.value)}
                  error={errors.registrationId}
                  placeholder="e.g. 123456789"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  NGO Darpan ID <span className="text-red-500">*</span>
                </label>
                <InputField
                  id="darpanId"
                  value={form.darpanId || ""}
                  onChange={(e) => handleInputChange("darpanId", e.target.value)}
                  error={errors.darpanId}
                  placeholder="e.g. DL/2024/0000000"
                />
              </div>
            </div>
          </div>
        )}

        {form.type === "company" && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <h3 className="text-xs font-semibold text-blue-800 mb-3 flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-blue-600" /> Company Specific
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  CIN <span className="text-red-500">*</span>
                </label>
                <InputField
                  id="cin"
                  value={form.cin || ""}
                  onChange={(e) => handleInputChange("cin", e.target.value)}
                  error={errors.cin}
                  placeholder="e.g. U74999MH2020PTC123456"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  GST or PAN <span className="text-red-500">*</span>
                </label>
                <InputField
                  id="gstOrPan"
                  value={form.gstOrPan || ""}
                  onChange={(e) => handleInputChange("gstOrPan", e.target.value)}
                  error={errors.gstOrPan}
                  placeholder="e.g. 27ABCDE1234F1Z5"
                />
              </div>
            </div>
          </div>
        )}

        {form.type === "institution" && (
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <h3 className="text-xs font-semibold text-indigo-800 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-indigo-600" /> Institution Specific
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Affiliation Proof <span className="text-red-500">*</span>
                </label>
                <InputField
                  id="affiliationProof"
                  value={form.affiliationProof || ""}
                  onChange={(e) => handleInputChange("affiliationProof", e.target.value)}
                  error={errors.affiliationProof}
                  placeholder="e.g. AICTE / UGC affiliation number"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevStep}
            disabled={step === "type"}
            className="text-sm"
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="gradient"
            loading={loading}
            className="text-sm"
          >
            Next <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </>
  );

  const renderStepDocuments = () => (
    <>
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white mx-auto mb-4">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Upload Documents</h2>
        <p className="mt-2 text-sm text-slate-500">
          Upload your organisation logo and required verification documents
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); goToNextStep(); }} className="space-y-6">
        {/* Logo upload */}
        <div className="p-6 rounded-2xl border border-sky-100 bg-white/90">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="w-5 h-5 text-sky-600" />
            <h3 className="font-semibold text-slate-800">Organisation Logo</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Recommended: square image, max 2MB. Formats: JPG, PNG, WEBP.
          </p>
          <FileUploadZone
            label="Upload Logo"
            accept=".jpg,.jpeg,.png,.webp"
            onFileChange={handleLogoChange}
            file={form.logoFile ?? null}
            error={errors.logoFile}
          />
        </div>

        {/* Required documents */}
        <div>
          <h3 className="text-xs font-semibold text-slate-700 mb-4">
            Required Documents for {TYPE_LABELS[form.type as OrganisationType]}
          </h3>
          <div className="space-y-3">
            {requiredDocs.map((doc) => (
              <div key={doc.key} className="p-4 rounded-xl border border-sky-100 bg-white/90">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{doc.label}</div>
                    <div className="text-xs text-slate-500">
                      Accepted: {doc.accept.replace(/\./g, "").replace(/,/g, ", ")}
                    </div>
                  </div>
                  {form.documentFiles?.[doc.key] && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Uploaded</span>
                    </div>
                  )}
                </div>
                <FileUploadZone
                  label={`Upload ${doc.label}`}
                  accept={doc.accept}
                  onFileChange={(f) => handleFileChange(doc.key, f)}
                  file={form.documentFiles?.[doc.key] ?? null}
                  error={errors[doc.key]}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevStep}
            className="text-sm"
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="gradient"
            loading={loading}
            className="text-sm"
          >
            Next <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </>
  );

  const renderStepOTP = () => (
    <>
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white mx-auto mb-4">
          <Phone className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Verify Email</h2>
        <p className="mt-2 text-sm text-slate-500">
          We&rsquo;ve sent a 6-digit OTP to <span className="font-medium">{form.email}</span>
        </p>
      </div>

      {!otpSent ? (
        <div className="text-center py-10">
          <Button
            onClick={sendOtp}
            loading={loading}
            variant="gradient"
            className="w-full text-sm"
          >
            Send OTP
          </Button>
          {submitError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {submitError}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <OTPInput
              value={otpCode}
              onChange={setOtpCode}
              error={errors.otp}
            />
            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {submitError}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Didn&rsquo;t receive the code?</span>
              <Button
                type="button"
                variant="link"
                onClick={sendOtp}
                loading={loading && otpSent}
                className="px-0 py-0 text-sky-600 hover:text-sky-700 underline text-xs"
              >
                Resend OTP
              </Button>
            </div>
          </div>
          <div className="mt-8 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevStep}
              className="text-sm"
            >
              Back
            </Button>
            <Button
              type="button"
              variant="gradient"
              onClick={() => {
                if (!otpCode || otpCode.length !== 6) {
                  setErrors((prev) => ({ ...prev, otp: "Please enter the 6-digit OTP" }));
                  return;
                }
                setErrors((prev) => ({ ...prev, otp: "" }));
                goToNextStep();
              }}
              className="text-sm"
            >
              Next <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </>
      )}
    </>
  );

  const renderStepConsent = () => (
    <>
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-500 flex items-center justify-center text-white mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Review &amp; Consent</h2>
        <p className="mt-2 text-sm text-slate-500">
          Please review and agree to our terms before registering
        </p>
      </div>

      <div className="space-y-6">
        {/* Consent checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="consent"
            checked={consentChecked}
            onChange={() => setConsentChecked((prev) => !prev)}
            className="w-4 h-4 rounded border-sky-300 text-sky-600 focus:ring-sky-500 mt-0.5"
          />
          <label htmlFor="consent" className="text-sm text-slate-600 leading-relaxed">
            I agree to the{" "}
            <Link href="/legal/privacy-policy" className="text-sky-600 hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/legal/terms" className="text-sky-600 hover:underline">
              Terms of Service
            </Link>
            . I understand my organisation will undergo verification before
            posting opportunities.
          </label>
        </div>

        {/* Grievance contact */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-semibold text-slate-800">Grievance Contact</span>
          </div>
          <p className="text-xs text-slate-500">
            For any grievances during registration or verification, contact
            <span className="font-medium">support@amaanitvam.org</span>
          </p>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-xl border border-sky-100 bg-white/90">
          <h3 className="text-xs font-semibold text-slate-700 mb-3">Registration Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Organisation Type</span>
              <span className="font-medium">{TYPE_LABELS[form.type as OrganisationType]}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Organisation Name</span>
              <span className="font-medium truncate max-w-xs">{form.orgName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Email</span>
              <span className="font-medium">{form.email}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>City</span>
              <span className="font-medium">{form.city}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevStep}
            className="text-sm"
          >
            Back
          </Button>
          <Button
            type="button"
            variant="gradient"
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            loading={loading}
            className="text-sm"
          >
            Register Organisation <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </>
  );

  const renderStepSuccess = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-6">
        <CheckCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted</h2>
      <p className="text-sm text-slate-500 mb-8">
        Your organisation registration has been submitted. Our team will review
        your documents and verify your account within 2-3 business days.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:underline"
      >
        <ArrowRight className="w-4 h-4" /> Go to Login
      </Link>
    </div>
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const stepContents: Record<FormStep, React.ReactNode> = {
    type: renderStepType(),
    details: renderStepDetails(),
    documents: renderStepDocuments(),
    otp: renderStepOTP(),
    consent: renderStepConsent(),
    success: renderStepSuccess(),
  };

  const stepLabels: Record<FormStep, string> = {
    type: "Organisation Type",
    details: "Details",
    documents: "Documents",
    otp: "OTP Verification",
    consent: "Consent",
    success: "Complete",
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30">
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-600 to-sky-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {["type", "details", "documents", "otp", "consent"].map((s, i) => {
            const isActive = step === s;
            const isCompleted =
              ["type", "details", "documents", "otp", "consent"].indexOf(s) <
              ["type", "details", "documents", "otp", "consent"].indexOf(step);
            return (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-cyan-600 text-white shadow-sm shadow-cyan-600/30"
                        : isCompleted
                        ? "bg-green-100 text-green-600 border border-green-200"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive || isCompleted ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {stepLabels[s as FormStep]}
                  </span>
                </div>
                {i < 4 && <ChevronRight className="w-3 h-3 text-slate-300 mx-1" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Error banner */}
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {stepContents[step]}

        {/* Footer links */}
        {step !== "success" && (
          <div className="mt-8 text-center border-t border-sky-100 pt-6">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700 underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface InputFieldProps {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

function InputField({
  id,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  icon,
}: InputFieldProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
        placeholder={placeholder}
        className={`pl-10 text-xs w-full h-11 rounded-xl border bg-white/90 px-3.5 py-2 text-slate-800 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm ${
          error
            ? "border-red-300 focus-visible:ring-red-400 focus-visible:border-red-400"
            : "border-sky-100 focus-visible:ring-sky-400 focus-visible:border-sky-400"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

interface FileUploadZoneProps {
  label: string;
  accept: string;
  onFileChange: (file: File | null) => void;
  file: File | null;
  error?: string;
}

function FileUploadZone({
  label,
  accept,
  onFileChange,
  file,
  error,
}: FileUploadZoneProps) {
  return (
    <div className="relative">
      <label
        className="block cursor-pointer"
        onClick={() => {
          const input = document.getElementById(
            `file-input-${label.replace(/\s+/g, "-")}`
          ) as HTMLInputElement | undefined;
          input?.click();
        }}
      >
        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          file
            ? "border-green-300 bg-green-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50"
        }`}>
          {file ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
              <div className="text-sm font-medium text-green-800">{file.name}</div>
              <div className="text-xs text-green-600">Uploaded</div>
            </>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-slate-400 mb-3" />
              <div className="text-sm font-medium text-slate-600">{label}</div>
              <div className="text-xs text-slate-400">Click to upload ({accept})</div>
            </>
          )}
          <input
            id={`file-input-${label.replace(/\s+/g, "-")}`}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              onFileChange(f);
            }}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </label>
    </div>
  );
}

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function OTPInput({ value, onChange, error }: OTPInputProps) {
  const [inputs, setInputs] = useState<string[]>(Array(6).fill(""));

  React.useEffect(() => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setInputs(digits.padEnd(6, "").split(""));
    onChange(digits);
  }, [value, onChange]);

  const handleInput = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = (e.target as HTMLInputElement).value.replace(/\D/g, "");
    if (val) {
      const next = [...inputs];
      next[index] = val;
      setInputs(next);
      if (index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | undefined;
        nextInput?.focus();
      }
      const combined = next.join("");
      onChange(combined);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = paste.padEnd(6, "").split("");
    setInputs(next);
    onChange(next.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !(e.target as HTMLInputElement).value && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement | undefined;
      prev?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {inputs.map((digit, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-10 h-11 rounded-xl border text-center text-lg font-mono text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 text-center"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "default" | "gradient" | "outline" | "link" | "destructive";
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}

function Button({
  children,
  onClick,
  type = "button",
  variant = "default",
  loading = false,
  className = "",
  disabled,
}: ButtonProps) {
  const variants: Record<string, string> = {
    default: "bg-sky-500 text-white hover:bg-sky-600 shadow-sky-500/20",
    gradient:
      "bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600 shadow-md shadow-sky-500/25",
    outline:
      "border border-sky-200 bg-white/80 text-sky-900 hover:bg-sky-50/80 hover:border-sky-300",
    link: "text-sky-600 underline-offset-4 hover:underline shadow-none",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20",
  };

  return (
    <button
      type={type as "button" | "submit"}
      onClick={onClick}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.98] h-11 px-4 py-2 ${variants[variant]} ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loading && typeof children === "string" ? children : children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
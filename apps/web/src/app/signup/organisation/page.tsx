"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export default function OrganisationSignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.signup({
        name: contactPerson.trim(),
        email,
        password,
        role: "organisation",
        phone: phone || undefined,
        city: city || undefined,
      });
      await api.createMyOrganisation({ orgName: orgName.trim() });
      setUser(res.user);
      router.push("/organisation/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to register organisation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Building2 className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Register Your Organisation
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Post verified drives, recruit passionate volunteers, and manage social impact
          </p>
        </div>

        <Card className="border-sky-100 shadow-xl shadow-sky-500/5">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Organisation Profile</CardTitle>
            <CardDescription className="text-xs">
              Provide your non-profit or institution details to initiate registration
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Organisation / NGO Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Green Earth Foundation"
                    className="pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Authorized Contact Person
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Priya Nair (Executive Director)"
                    className="pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@greenearth.org"
                    className="pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="pl-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 11 2345 6789"
                      className="pl-10 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    City / Headquarter
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New Delhi, Pune, Chennai..."
                      className="pl-10 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-50/70 text-xs text-cyan-900 space-y-1 border border-cyan-100">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" /> Amaanitvam Verification Guarantee
                </div>
                <p className="text-[11px] text-cyan-800">
                  After signup, our impact team will help verify your 80G/12A or NGO Darpan details to display a verified badge.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="gradient"
                className="w-full mt-2 h-11 text-sm font-semibold from-cyan-600 to-sky-500"
              >
                {loading ? "Registering Organisation..." : "Complete Organisation Signup"}{" "}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="mt-6 text-center border-t border-sky-100 pt-5">
              <p className="text-xs text-slate-500">
                Looking to volunteer individually?{" "}
                <Link
                  href="/signup/volunteer"
                  className="font-semibold text-sky-600 hover:text-sky-700 underline"
                >
                  Volunteer Sign up
                </Link>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-sky-600 hover:text-sky-700 underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

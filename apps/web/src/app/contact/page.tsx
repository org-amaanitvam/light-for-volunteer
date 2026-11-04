"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 sm:py-24 bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-4">
            <MessageSquare className="w-4 h-4" /> Get in Touch
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            We’d love to hear from you
          </h1>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">
            Have questions about volunteer drives, organisation onboarding, or partnerships? Reach out to our community team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Details Card */}
          <div className="space-y-6">
            <Card className="border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Email Us</h3>
                  <p className="text-xs text-slate-500 mt-1">Our support team replies within 24h</p>
                  <a
                    href="mailto:lightofvolunteer@gmail.com"
                    className="text-xs font-semibold text-sky-600 hover:underline mt-2 inline-block"
                  >
                    lightofvolunteer@gmail.com
                  </a>
                </div>
              </div>
            </Card>

            <Card className="border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Call Us</h3>
                  <p className="text-xs text-slate-500 mt-1">Mon–Fri from 9am to 6pm IST</p>
                  <p className="text-xs font-semibold text-slate-800 mt-2">+91 9891757935</p>
                </div>
              </div>
            </Card>

            <Card className="border-sky-100 bg-white p-6 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Follow Us</h3>
                <div className="mt-3 flex flex-col gap-3">
                  <a
                    href="https://www.instagram.com/lightofvolunteer?mdxt=dHZuMWNjbGgxYW9l"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Instagram
                  </a>
                  <a
                    href="https://www.linkedin.com/company/light-of-volunteer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </Card>

            <Card className="border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Amaanitvam Foundation</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    New Delhi, India — Supporting social impact initiatives nationwide
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-sky-100 shadow-xl shadow-sky-500/5 p-6 sm:p-8">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Thank you for writing to us!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    We have received your message. A member of our community impact team will reach out to you shortly.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Name
                      </label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Aditi Verma"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Email
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="aditi@example.com"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Subject
                    </label>
                    <Input
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Volunteering question / NGO Partnership"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help you..."
                      className="w-full rounded-xl border border-sky-100 bg-white/90 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full sm:w-auto px-8 h-11 text-xs font-semibold"
                  >
                    Send Message <Send className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

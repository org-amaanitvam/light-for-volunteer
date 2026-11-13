"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

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
    <div className="min-h-screen bg-[#f8fbff]">
      {/* Architectural Header Section with Zephyr Background */}
      <section className="relative overflow-hidden border-b border-[#bae6fd]/40 bg-[#0c4a6e] py-14 sm:py-16">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/Zephyr%20032.png')",
            backgroundPosition: "center 25%",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0c4a6e]/95 via-[#075985]/80 to-[#0c4a6e]/70 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#e0f2fe] text-xs font-semibold mb-4 shadow-xs">
                <MessageSquare className="w-4 h-4 text-[#38bdf8]" /> Get in Touch
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight sm:text-5xl">
                We’d love to hear from you
              </h1>
              <p className="mt-4 text-[#e0f2fe]/90 text-sm sm:text-base">
                Have questions about volunteer drives, organisation onboarding, or partnerships? Reach out to our community team.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Details Cards */}
          <div className="space-y-6">
            <ScrollReveal delay={0} direction="up">
              <Card className="border-[#bae6fd]/80 bg-white p-6 shadow-xs hover:border-[#7dd3fc] hover:shadow-[0_4px_16px_rgba(3,105,161,0.08)] transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0f2a43]">Email Us</h3>
                    <p className="text-xs text-[#5a7b9d] mt-1">Our support team replies within 24h</p>
                    <a
                      href="mailto:lightofvolunteer@gmail.com"
                      className="text-xs font-semibold text-[#0369a1] hover:underline mt-2 inline-block"
                    >
                      lightofvolunteer@gmail.com
                    </a>
                  </div>
                </div>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100} direction="up">
              <Card className="border-[#bae6fd]/80 bg-white p-6 shadow-xs hover:border-[#7dd3fc] hover:shadow-[0_4px_16px_rgba(3,105,161,0.08)] transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0f2a43]">Call Us</h3>
                    <p className="text-xs text-[#5a7b9d] mt-1">Mon-Fri from 9am to 6pm IST</p>
                    <a
                      href="tel:+919876543210"
                      className="text-xs font-semibold text-[#0369a1] hover:underline mt-2 inline-block tabular-nums"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </div>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200} direction="up">
              <Card className="border-[#bae6fd]/80 bg-white p-6 shadow-xs hover:border-[#7dd3fc] hover:shadow-[0_4px_16px_rgba(3,105,161,0.08)] transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0f2a43]">Headquarters</h3>
                    <p className="text-xs text-[#5a7b9d] mt-1 leading-relaxed">
                      Amaanitvam Foundation, Civic Innovation Lab<br />
                      New Delhi, India
                    </p>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2">
            <ScrollReveal delay={150} direction="up">
              <Card className="border-[#bae6fd]/80 bg-white p-8 sm:p-10 shadow-xs">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f2a43]">Message Received!</h3>
                    <p className="text-xs text-[#5a7b9d] mt-2 max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting the Amaanitvam Volunteer Network. A member of our team will get back to you shortly.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="mt-6 border-[#bae6fd] text-[#0369a1] hover:bg-[#e0f2fe]/40"
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-[#0f2a43] mb-1.5">
                          Your Name
                        </label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Aditi Verma"
                          className="text-xs rounded-xl border-[#bae6fd] bg-[#f8fbff] focus:bg-white focus:border-[#0369a1]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0f2a43] mb-1.5">
                          Your Email
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="aditi@example.com"
                          className="text-xs rounded-xl border-[#bae6fd] bg-[#f8fbff] focus:bg-white focus:border-[#0369a1]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0f2a43] mb-1.5">
                        Subject
                      </label>
                      <Input
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Volunteering question / NGO Partnership"
                        className="text-xs rounded-xl border-[#bae6fd] bg-[#f8fbff] focus:bg-white focus:border-[#0369a1]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0f2a43] mb-1.5">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us how we can help you..."
                        className="w-full rounded-xl border border-[#bae6fd] bg-[#f8fbff] p-3 text-xs text-[#0f2a43] placeholder:text-[#5a7b9d] focus:bg-white focus:border-[#0369a1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1]/20 transition"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      className="w-full sm:w-auto px-8 h-11 text-xs font-semibold bg-[#0369a1] hover:bg-[#075985]"
                    >
                      Send Message <Send className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </form>
                )}
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}

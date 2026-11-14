import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatWindow } from "@/components/chat/chat-window";
import { AuthProvider } from "@/context/auth-context";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Light For Volunteer | Amaanitvam Foundation",
  description:
    "A marketplace connecting social impact organisations with passionate volunteers and interns. Create real change in Education, Health, Environment and Community Welfare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col relative selection:bg-sky-200 selection:text-sky-900`}>
        {/* WCAG 2.4.1 Bypass Blocks - Skip to content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-700 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 font-medium text-sm"
        >
          Skip to main content
        </a>

        {/* Global Platform-Wide Atmospheric Background (Zephyr 032.png) */}
        <div
          className="fixed inset-0 -z-50 bg-cover pointer-events-none"
          style={{
            backgroundImage: "url('/Zephyr%20032.png')",
            backgroundPosition: "center 15%",
          }}
          aria-hidden="true"
        >
          {/* Balanced White & Blue atmospheric wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/75 to-[#f8fafc]" />
        </div>

        <AuthProvider>
          <Suspense fallback={<div className="h-16 sm:h-18 border-b border-[#bae6fd]/80 bg-white" />}><Navbar /></Suspense>
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
          <Footer />
          <ChatWindow />
        </AuthProvider>
      </body>
    </html>
  );
}

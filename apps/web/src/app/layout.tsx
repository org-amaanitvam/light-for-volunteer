import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatWindow } from "@/components/chat/chat-window";
import { AuthProvider } from "@/context/auth-context";

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
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50/50 selection:bg-sky-200 selection:text-sky-900`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWindow />
        </AuthProvider>
      </body>
    </html>
  );
}

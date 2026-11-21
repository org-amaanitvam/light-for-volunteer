import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Light For Volunteer | Amaanitvam Foundation",
  description:
    "A marketplace connecting social impact organisations with passionate volunteers and interns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}

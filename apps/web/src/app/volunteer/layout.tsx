"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarNav } from "@/components/volunteer/sidebar-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading volunteer workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "volunteer" && user.role !== "mentor") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="max-w-md border-amber-200 bg-amber-50/40 text-center shadow-lg">
          <CardContent className="pt-8 pb-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
              🛡️
            </div>
            <h2 className="text-xl font-bold text-slate-900">Volunteer or Mentor Role Required</h2>
            <p className="mt-2 text-sm text-slate-600">
              You are signed in as <span className="font-semibold text-slate-800">{user.email}</span> with the role{" "}
              <span className="font-semibold capitalize text-sky-700">{user.role}</span>. This portal is available to volunteers and mentors.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => router.push("/")}>
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col md:flex-row bg-slate-50/60">
      <div className="hidden md:block md:w-64 md:shrink-0">
        <SidebarNav />
      </div>
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

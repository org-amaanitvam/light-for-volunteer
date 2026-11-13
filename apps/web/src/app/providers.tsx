"use client";

import type { ReactNode } from "react";
import { Theme } from "@astryxdesign/core/theme";
import { AuthProvider } from "@/context/auth-context";
import { themes, defaultThemeSlug } from "../astryx-themes";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Theme theme={themes[defaultThemeSlug]}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Theme>
  );
}

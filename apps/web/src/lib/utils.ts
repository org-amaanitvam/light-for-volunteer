import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates and sanitizes internal redirect destinations to prevent open redirect vulnerabilities.
 * Ensures the destination is strictly a relative path on the current origin without backslash or protocol tricks.
 */
export function sanitizeRedirect(target: string | null | undefined): string | null {
  if (!target || typeof target !== "string") return null;
  const trimmed = target.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.includes("\\")) {
    return null;
  }
  try {
    const url = new URL(trimmed, "http://localhost");
    if (url.origin !== "http://localhost") return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

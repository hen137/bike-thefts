"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "@/types/contexts";

/**
 * ThemeProvider component using next-themes
 *
 * Features:
 * - Manages light/dark theme state
 * - Persists theme preference to localStorage
 * - Provides theme toggle function
 * - Initializes theme from localStorage or system preference
 * - Prevents flash of unstyled content
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

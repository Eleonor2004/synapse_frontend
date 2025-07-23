// src/providers/ThemeProvider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      {...props}
      // Force re-render on theme change
      forcedTheme={undefined}
      // Ensure the theme is applied correctly
      enableColorScheme={false}
    >
      {children}
    </NextThemesProvider>
  );
}
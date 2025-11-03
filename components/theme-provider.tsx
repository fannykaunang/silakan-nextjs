// components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class" // pakai class strategy
      enableSystem={true} // opsional: disable "system"
      storageKey="theme" // kunci konsisten di localStorage
      defaultTheme="system" // hormati OS jika belum ada preferensi
      disableTransitionOnChange // hindari flicker saat toggle
      themes={["light", "dark", "system"]}>
      {children}
    </NextThemesProvider>
  );
}

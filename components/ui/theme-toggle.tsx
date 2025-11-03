// components/ui/theme-toggle.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) {
    // Hindari hydration mismatch
    return (
      <button
        type="button"
        className="p-2 rounded-lg border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        aria-label="Ganti tema">
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-lg border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
      aria-label={`Ganti ke tema ${isDark ? "terang" : "gelap"}`}
      title={`Tema: ${isDark ? "Gelap" : "Terang"}`}>
      <span className="relative block">
        {/* Sun (muncul saat light) */}
        <Sun
          className={`w-5 h-5 transform transition-all duration-300 ${
            isDark
              ? "scale-0 rotate-90 opacity-0 absolute"
              : "scale-100 rotate-0 opacity-100"
          }`}
        />
        {/* Moon (muncul saat dark) */}
        <Moon
          className={`w-5 h-5 transform transition-all duration-300 ${
            isDark
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 -rotate-90 opacity-0 absolute"
          }`}
        />
      </span>
    </button>
  );
}

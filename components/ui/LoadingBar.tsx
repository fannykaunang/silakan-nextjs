// components/ui/LoadingBar.tsx
"use client";

import { useLoading } from "@/components/providers/LoadingProvider";
import { useEffect, useState } from "react";

export default function LoadingBar() {
  const { isLoading } = useLoading();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    // Initial check
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      <div
        className={`h-1 transition-all duration-300 ${
          isLoading ? "w-full opacity-100" : "w-0 opacity-0"
        } ${theme === "dark" ? "bg-blue-400" : "bg-blue-600"}`}
      />
    </div>
  );
}

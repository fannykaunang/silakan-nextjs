// components/ui/LoadingSpinner.tsx
"use client";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useEffect, useState } from "react";

export default function LoadingSpinner() {
  const { isLoading } = useLoading();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow smooth transition
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300 ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}>
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>

          {/* Animated ring */}
          <div
            className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"
            style={{ animationDuration: "0.8s" }}></div>

          {/* Inner pulse */}
          <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
        </div>

        {/* Loading text */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Memuat
          </span>
          <div className="flex gap-1">
            <span
              className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}></span>
            <span
              className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}></span>
            <span
              className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

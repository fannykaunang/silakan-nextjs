// components/providers/NavigationEventsProvider.tsx
"use client";

import { useLoading } from "./LoadingProvider";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const NavigationEventsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { startLoading, stopLoading } = useLoading();
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);

  useEffect(() => {
    // Only trigger loading if the path has actually changed
    if (previousPathRef.current !== pathname) {
      startLoading();

      // Stop loading after a short delay to ensure it's visible
      const timeout = setTimeout(() => {
        stopLoading();
        previousPathRef.current = pathname;
      }, 800);

      return () => clearTimeout(timeout);
    }
  }, [pathname, startLoading, stopLoading]);

  return <>{children}</>;
};

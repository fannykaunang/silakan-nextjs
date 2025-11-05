// components/providers/RouterEventsProvider.tsx
"use client";

import { useLoading } from "./LoadingProvider";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const RouterEventsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { startLoading, stopLoading } = useLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [previousPath, setPreviousPath] = useState(pathname);

  useEffect(() => {
    // When the pathname changes, start loading
    if (previousPath !== pathname) {
      startLoading();

      // Set a timeout to stop loading after a short delay
      // This ensures the loading bar is visible even for fast page loads
      const timeout = setTimeout(() => {
        stopLoading();
        setPreviousPath(pathname);
      }, 800); // Adjust this value as needed

      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams, previousPath, startLoading, stopLoading]);

  return <>{children}</>;
};

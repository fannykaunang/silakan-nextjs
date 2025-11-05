// hooks/useNavigationEvents.ts
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export function useNavigationEvents(
  onRouteChangeStart: () => void,
  onRouteChangeComplete: () => void
) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPathRef = useRef(pathname);

  useEffect(() => {
    // Override router methods to detect navigation
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (url: any) => {
      if (typeof url === "string" && currentPathRef.current !== url) {
        onRouteChangeStart();
        currentPathRef.current = url;
      }
      return originalPush(url);
    };

    router.replace = (url: any) => {
      if (typeof url === "string" && currentPathRef.current !== url) {
        onRouteChangeStart();
        currentPathRef.current = url;
      }
      return originalReplace(url);
    };

    // Simulate route change complete after a delay
    const timer = setTimeout(() => {
      onRouteChangeComplete();
    }, 800);

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      clearTimeout(timer);
    };
  }, [pathname, router, onRouteChangeStart, onRouteChangeComplete]);
}

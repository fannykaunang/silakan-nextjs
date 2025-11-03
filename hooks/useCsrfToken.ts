// // hooks/useCsrfToken.ts
// "use client";
// import { useState, useEffect } from "react";

// export function useCsrfToken() {
//   const [csrfToken, setCsrfToken] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchToken = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await fetch("/api/csrf-token", {
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Failed to fetch CSRF token");
//       const data = await res.json();
//       setCsrfToken(data.token);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Unknown error");
//       console.error("CSRF token fetch error:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchToken();
//   }, []);

//   const isReady = !!csrfToken && !isLoading && !error;

//   return { csrfToken, isLoading, isReady, error, refetch: fetchToken };
// }

// hooks/useCsrfToken.ts
"use client";
import { useState, useEffect, useCallback } from "react";

// ✅ Helper untuk baca cookie dari browser
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ STEP 1: Trigger server untuk set cookie
      const res = await fetch("/api/csrf-token", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch CSRF token`);
      }

      // ✅ STEP 2: Baca token dari cookie (bukan dari response body)
      // Tunggu sebentar untuk cookie di-set
      await new Promise((resolve) => setTimeout(resolve, 100));

      const tokenFromCookie = getCookie("csrf_token");

      if (!tokenFromCookie) {
        throw new Error("Token not found in cookie");
      }

      console.log("✅ CSRF token ready from cookie");
      setCsrfToken(tokenFromCookie);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ CSRF token fetch error:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Refresh token dari cookie secara periodik
  const refreshTokenFromCookie = useCallback(() => {
    const tokenFromCookie = getCookie("csrf_token");
    if (tokenFromCookie && tokenFromCookie !== csrfToken) {
      console.log("🔄 CSRF token updated from cookie");
      setCsrfToken(tokenFromCookie);
    }
  }, [csrfToken]);

  useEffect(() => {
    fetchToken();

    // ✅ Check cookie setiap 5 detik untuk sinkronisasi
    const syncInterval = setInterval(refreshTokenFromCookie, 5000);

    // Auto-refetch setiap 30 menit
    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing CSRF token...");
      fetchToken();
    }, 30 * 60 * 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(refreshInterval);
    };
  }, [fetchToken, refreshTokenFromCookie]);

  return {
    csrfToken,
    isLoading,
    error,
    isReady: !isLoading && !!csrfToken,
    refetch: fetchToken,
  };
}

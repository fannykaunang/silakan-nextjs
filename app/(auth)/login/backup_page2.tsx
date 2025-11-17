// app/(auth)/login/page.tsx
// OPTIMIZED LOGIN PAGE - Fixed Response Delay

"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useThreeBackground, PRESET_CONFIGS } from "@/hooks/useThreeBackground";
import WorkingPeopleAnimation from "@/components/WorkingPeopleAnimation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

  // ✅ Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // ✅ 3D Background dengan theme support
  const canvasRef = useThreeBackground({
    config: PRESET_CONFIGS.merauke[theme],
    enableStarField: true,
    cameraAnimation: true,
    enableFloatingLogos: true,
    logoImage: "/Lambang_Kabupaten_Merauke.png",
    logoCount: 15,
    logoSize: 8,
    theme: theme,
  });

  // Fetch CSRF token
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch("/api/csrf-token", {
          credentials: "include",
        });
        const data = await res.json();
        setCsrfToken(data.token);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
        setErrorMsg("Gagal memuat token keamanan. Silakan refresh halaman.");
      }
    };

    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    if (!csrfToken) {
      setErrorMsg("Token keamanan tidak tersedia. Silakan refresh halaman.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setShowAlert(false);
    startLoading(); // Start loading bar

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email, pwd: password }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        const message =
          data?.response ||
          data?.message ||
          (res.status === 429
            ? "Terlalu banyak permintaan, coba lagi nanti"
            : res.status === 403
            ? "Token keamanan tidak valid. Silakan refresh halaman."
            : "Terjadi kesalahan saat login.");

        throw new Error(message);
      }

      // ✅ SUCCESS: Show alert immediately
      setShowAlert(true);

      // ✅ Stop loading bar immediately after success
      stopLoading();

      // ✅ Navigate without artificial delay
      // Use router.push directly with prefetch
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat login.");
      stopLoading(); // Stop loading on error

      // Refresh CSRF token on error
      try {
        const res = await fetch("/api/csrf-token", {
          credentials: "include",
        });
        const data = await res.json();
        setCsrfToken(data.token);
      } catch {
        // Ignore
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  // Theme-aware gradients
  const backgroundGradient =
    theme === "light"
      ? "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)"
      : "linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #2d1b69 100%)";

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ✅ 3D Background with Theme Support */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{
          background: backgroundGradient,
        }}
      />

      {/* ✅ Working People Animation (Bottom Center) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 z-0 opacity-40 pointer-events-none">
        <WorkingPeopleAnimation theme={theme} />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20 dark:border-gray-700/20">
            {/* Header with Logo */}
            <div className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg transform hover:scale-110 transition-transform bg-transparent">
                  <Image
                    src="/Lambang_Kabupaten_Merauke.png"
                    alt="Logo Kabupaten Merauke"
                    fill
                    className="object-contain p-2"
                    priority
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                SILAKAN
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sistem Informasi Laporan Kegiatan
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gunakan akun{" "}
                <Link
                  href="https://entago.merauke.go.id?ref=silakan"
                  target="_blank"
                  className="font-bold hover:text-blue-600 transition-colors">
                  E-NTAGO
                </Link>{" "}
                Anda
              </p>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4 animate-shake">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                  ⚠️ {errorMsg}
                </p>
              </div>
            )}

            {showAlert && (
              <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-400 text-sm">
                  ✓ Login berhasil! Anda akan diarahkan...
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                  Ingat saya
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !csrfToken}
                aria-busy={isLoading}
                aria-live="polite"
                className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 font-semibold transition-all shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                <span className="flex items-center justify-center gap-2">
                  {isLoading && (
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  )}
                  {isLoading
                    ? "Memproses..."
                    : !csrfToken
                    ? "Memuat..."
                    : "Masuk"}
                </span>
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-300">
              Belum punya akun?{" "}
              <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
                Daftar sekarang
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-700 dark:text-white/90 mt-8 backdrop-blur-sm bg-white/20 dark:bg-black/20 rounded-lg py-3 px-4">
            © 2025 - {currentYear}{" "}
            <Link
              href="https://kominfo.merauke.go.id?ref=silakan"
              target="_blank"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Dinas Kominfo Kabupaten Merauke
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

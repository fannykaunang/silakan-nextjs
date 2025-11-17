// app/(auth)/login/_client.tsx

"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useThreeBackground, PRESET_CONFIGS } from "@/hooks/useThreeBackground";
import WorkingPeopleAnimation from "@/components/WorkingPeopleAnimation";
import type { AppSettings } from "@/lib/models/app-settings-model";

type AppSettingsResponse = {
  success: boolean;
  data?: AppSettings;
};

const DEFAULT_APP_INFO = {
  alias: "SILAKAN",
  name: "Sistem Informasi Laporan Kegiatan",
  versi: "1.0.0",
  copyright: "Pemerintah Kabupaten Merauke",
  tahun: new Date().getFullYear(),
};

export default function LoginPageClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [appInfo, setAppInfo] = useState(DEFAULT_APP_INFO);

  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

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

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchAppSettings() {
      try {
        const response = await fetch("/api/settings/app", {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const result: AppSettingsResponse = await response.json();
        if (!isMounted || !result?.data) return;

        const alias = result.data.alias_aplikasi?.trim();
        const name = result.data.nama_aplikasi?.trim();
        const versi = result.data.versi?.trim();
        const copyright = result.data.copyright?.trim();
        const tahun = result.data.tahun;
        setAppInfo({
          alias: alias || DEFAULT_APP_INFO.alias,
          name: name || DEFAULT_APP_INFO.name,
          versi: versi || DEFAULT_APP_INFO.versi,
          copyright: copyright || DEFAULT_APP_INFO.copyright,
          tahun: tahun || DEFAULT_APP_INFO.tahun,
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Failed to load app settings", error);
      }
    }

    fetchAppSettings();

    return () => {
      isMounted = false;
      controller.abort();
    };
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
    startLoading();

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

      setShowAlert(true);
      stopLoading();
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat login.");
      stopLoading();

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

  const backgroundGradient =
    theme === "light"
      ? "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)"
      : "linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #2d1b69 100%)";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{
          background: backgroundGradient,
        }}
      />

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 z-0 opacity-40 pointer-events-none">
        <WorkingPeopleAnimation theme={theme} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20 dark:border-gray-700/20">
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
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600">
                {appInfo.alias}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{appInfo.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gunakan akun{" "}
                <Link
                  href="https://entago.merauke.go.id/backend/auth/login"
                  target="_blank"
                  className="text-blue-600 hover:underline">
                  E-NTAGO
                </Link>{" "}
                untuk login
              </p>
            </div>

            {showAlert && (
              <div className="rounded-xl border border-green-200 px-4 py-3 text-sm text-green-500">
                Login berhasil! Mengarahkan ke dashboard...
              </div>
            )}

            {errorMsg && (
              <div className="rounded-xl border border-red-200 px-4 py-3 text-sm text-red-500">
                {errorMsg}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email E-NTAGO
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@merauke.go.id"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/30 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kata Sandi E-NTAGO
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/30 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 cursor-pointer">
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <input type="checkbox" className="rounded border-gray-300" />
                  Ingat saya
                </label>
                <Link href="/" className="text-blue-600 hover:text-blue-700">
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-linear-to-r from-blue-600 to-purple-600 py-3 text-white font-semibold shadow-lg shadow-blue-500/30 transition hover:shadow-xl disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed">
                {isLoading ? "Memproses..." : "Masuk ke SILAKAN"}
              </button>
            </form>

            <div className="text-center text-sm text-gray-500">
              Belum punya akun? Hubungi admin E-NTAGO Kabupaten Merauke
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>
              &copy; {appInfo.tahun} - {currentYear} {appInfo.copyright}. All
              rights reserved.
            </p>
            <p className="text-xs">
              Versi aplikasi: {appInfo.versi} | Server: Merauke
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

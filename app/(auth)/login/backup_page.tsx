// app/(auth)/login/page.tsx
"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");

  const router = useRouter();

  // ✅ Fetch CSRF token saat component mount
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

    // ✅ Validasi CSRF token ada
    if (!csrfToken) {
      setErrorMsg("Token keamanan tidak tersedia. Silakan refresh halaman.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setShowAlert(false);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token": csrfToken, // ✅ Kirim CSRF token di header
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
        const rlReason = res.headers.get("x-app-rate-limit-reason");

        const message =
          data?.response ||
          data?.message ||
          data?.error ||
          data?.msg ||
          (res.status === 429
            ? "Terlalu banyak permintaan, coba lagi nanti"
            : res.status === 404
            ? "Endpoint tidak ditemukan (404). Periksa URL API/route handler."
            : res.status === 403
            ? "Token keamanan tidak valid. Silakan refresh halaman."
            : res.statusText || "Terjadi kesalahan saat login.");

        if (rlReason) console.warn("Rate-limited because:", rlReason);

        throw new Error(message);
      }

      // ⚠️ HAPUS atau gunakan sessionStorage untuk non-sensitive data saja
      // localStorage.setItem("user", JSON.stringify(data));

      // Login sukses
      setShowAlert(true);
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat login.");

      // ✅ Refresh CSRF token setelah error
      try {
        const res = await fetch("/api/csrf-token", {
          credentials: "include",
        });
        const data = await res.json();
        setCsrfToken(data.token);
      } catch {
        // Ignore error
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-800 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              SILAKAN Masuk
            </h1>
            <p className="dark:text-gray-400">
              Gunakan akun{" "}
              <Link
                href="https://entago.merauke.go.id?ref=silakan"
                target="_blank"
                className="font-bold">
                E-NTAGO
              </Link>{" "}
              Anda untuk melanjutkan
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <p className="text-red-700 text-sm font-medium">⚠️ {errorMsg}</p>
            </div>
          )}

          {/* Success Alert */}
          {showAlert && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                ✓ Login berhasil! Anda akan diarahkan...
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Password
                </label>
                <button
                  type="button"
                  disabled={isLoading}
                  className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed">
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
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }>
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                Ingat saya
              </label>
            </div>

            {/* Submit Button */}
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

          {/* Footer */}
          <div className="text-center text-sm dark:text-gray-300">
            Belum punya akun?{" "}
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Daftar sekarang
            </button>
          </div>
        </div>

        <p className="text-center text-sm dark:text-gray-400 mt-8">
          © 2025 - {currentYear}{" "}
          <Link
            href={`https://kominfo.merauke.go.id?ref=silakan`}
            target="_blank"
            className="font-semibold text-gray-600 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer">
            Dinas Kominfo Kabupaten Merauke
          </Link>
          . All rights reserved.
        </p>
      </div>
    </div>
  );
}

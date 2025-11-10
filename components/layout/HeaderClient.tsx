// components/layout/HeaderClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Search,
  ChevronDown,
  Settings as SettingsIcon,
  LogOut,
  User,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ui/theme-toggle";
import { useCsrfToken } from "@/hooks/useCsrfToken";

interface HeaderProps {
  userEmail?: string;
  userName?: string;
  userLevel?: number;
  userPin?: string; // Tambahan dari server
}

interface NotifikasiData {
  notifikasi_id: number;
  judul: string;
  pesan: string;
  tipe_notifikasi: string;
  is_read: number;
  created_at: string;
  link_tujuan: string | null;
}

export default function Header({
  userEmail = "email@domain.com",
  userName,
  userLevel = 0,
  userPin,
}: HeaderProps) {
  const router = useRouter();
  const [notifikasi, setNotifikasi] = useState<NotifikasiData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const displayName = userName || userEmail?.split("@")[0] || "Pengguna";
  const fallbackPhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  // Fetch user photo
  useEffect(() => {
    fetchUserPhoto();
  }, [userPin]);

  // Fetch notifikasi
  useEffect(() => {
    fetchNotifikasi();

    // Auto refresh setiap 60 detik
    const interval = setInterval(() => {
      fetchNotifikasi();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Destructure dengan nama yang jelas
  const {
    csrfToken,
    isLoading: isTokenLoading,
    isReady: isTokenReady,
    error: tokenError,
    refetch: refetchToken,
  } = useCsrfToken();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Debug CSRF token - hanya log setelah loading selesai
  useEffect(() => {
    if (!isTokenLoading) {
      console.log(
        "🔐 CSRF Token Status:",
        isTokenReady ? "✅ Ready" : "❌ Not Ready"
      );
      if (tokenError) {
        console.error("❌ CSRF Token Error:", tokenError);
      }
    }
  }, [isTokenReady, isTokenLoading, tokenError]);

  const fetchUserPhoto = async () => {
    try {
      // Jika ada userPin dari props (passed from server)
      if (userPin) {
        const response = await fetch(
          `https://dev.api.eabsen.merauke.go.id/api/pegawai/${userPin}`
        );
        const result = await response.json();

        if (response.ok && result.photo_path) {
          setUserPhoto(`https://entago.merauke.go.id/${result.photo_path}`);
          return;
        }
      }

      // ALTERNATIF: Ambil dari internal API (lebih cepat)
      const profileResponse = await fetch("/api/profile");
      const profileResult = await profileResponse.json();

      if (
        profileResponse.ok &&
        profileResult.success &&
        profileResult.data?.photo_path
      ) {
        setUserPhoto(
          `https://entago.merauke.go.id/${profileResult.data.photo_path}`
        );
        return;
      }

      // Fallback ke dicebear
      setUserPhoto(fallbackPhoto);
    } catch (error) {
      console.error("Error fetching photo:", error);
      setUserPhoto(fallbackPhoto);
    }
  };

  const fetchNotifikasi = async () => {
    try {
      const response = await fetch("/api/notifikasi");
      const result = await response.json();

      if (response.ok && result.success) {
        // Ambil 5 notifikasi terbaru
        const latest = result.data.slice(0, 5);
        setNotifikasi(latest);
        setUnreadCount(result.unread || 0);
      }
    } catch (error) {
      console.error("Error fetching notifikasi:", error);
    }
  };

  const handleNotifClick = async (notif: NotifikasiData) => {
    // Mark as read jika belum dibaca
    if (notif.is_read === 0) {
      try {
        await fetch(`/api/notifikasi/${notif.notifikasi_id}/read`, {
          method: "PATCH",
        });
        fetchNotifikasi(); // Refresh
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }

    // Navigate jika ada link
    if (notif.link_tujuan) {
      router.push(notif.link_tujuan);
    }

    setIsNotifOpen(false);
  };

  const doLogoutRequest = async (token: string) => {
    const res = await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token,
      },
      credentials: "include",
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  };

  const handleLogout = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Pastikan token siap; kalau belum, refresh dulu
      if (!isTokenReady || !csrfToken) {
        await refetchToken();
      }

      let token = csrfToken;
      if (!token) {
        // jika masih kosong setelah refetch
        throw new Error("Token keamanan belum siap. Coba lagi.");
      }

      // Try #1
      let { res, data } = await doLogoutRequest(token);

      // Jika 403, refresh token lalu coba sekali lagi
      if (res.status === 403) {
        await refetchToken();
        token =
          (await new Promise<string>((resolve) => {
            // kecil: tunggu microtask agar state hook ter-update
            setTimeout(() => resolve(csrfToken), 0);
          })) || csrfToken;

        if (!token) {
          throw new Error(
            "Token keamanan tidak valid. Muat ulang halaman lalu coba lagi."
          );
        }

        ({ res, data } = await doLogoutRequest(token));
      }

      if (!res.ok) {
        throw new Error(data?.response || "Logout gagal");
      }

      // Clear client storage
      localStorage.clear();
      sessionStorage.clear();

      setIsLogoutModalOpen(false);
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      console.error("Logout error:", err);
      alert(err?.message || "Terjadi kesalahan saat logout");
    } finally {
      setIsLoading(false);
    }
  };

  const getTipeIcon = (tipe: string) => {
    const icons: { [key: string]: any } = {
      Verifikasi: CheckCircle,
      Penolakan: XCircle,
      Komentar: MessageSquare,
      Reminder: Clock,
      Info: Info,
      Peringatan: AlertTriangle,
    };
    const Icon = icons[tipe] || Bell;
    return <Icon className="w-4 h-4" />;
  };

  const getTipeColor = (tipe: string) => {
    const colors: { [key: string]: string } = {
      Verifikasi: "text-green-600",
      Penolakan: "text-red-600",
      Komentar: "text-blue-600",
      Reminder: "text-yellow-600",
      Info: "text-purple-600",
      Peringatan: "text-orange-600",
    };
    return colors[tipe] || "text-gray-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString("id-ID");
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="hidden relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifikasi Dropdown */}
          <DropdownMenu open={isNotifOpen} onOpenChange={setIsNotifOpen}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <Bell className="w-5 h-5 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifikasi</span>
                <Link
                  href="/notifikasi"
                  className="text-xs text-blue-600 hover:text-blue-700 font-normal"
                  onClick={() => setIsNotifOpen(false)}>
                  Lihat Semua
                </Link>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {notifikasi.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifikasi.map((notif) => (
                    <div
                      key={notif.notifikasi_id}
                      onClick={() => handleNotifClick(notif)}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${
                        notif.is_read === 0
                          ? "bg-blue-50 dark:bg-blue-900/10"
                          : ""
                      }`}>
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 ${getTipeColor(
                            notif.tipe_notifikasi
                          )}`}>
                          {getTipeIcon(notif.tipe_notifikasi)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 ${
                              notif.is_read === 0 ? "font-bold" : ""
                            }`}>
                            {notif.judul}
                            {notif.is_read === 0 && (
                              <span className="ml-2 inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                            {notif.pesan}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDate(notif.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center cursor-pointer gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg py-1 pr-2 transition"
                aria-label="Buka menu profil">
                <img
                  src={userPhoto || fallbackPhoto}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                  onError={(e) => {
                    // Fallback jika gambar gagal load
                    (e.target as HTMLImageElement).src = fallbackPhoto;
                  }}
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {displayName}
                  </p>
                  <p className="text-xs dark:text-gray-400">{userEmail}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <User className="w-4 h-4" /> Profil
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={() => router.push("/dashboard/profile")}>
                <User className="w-4 h-4 mr-2" />
                Lihat Profil
              </DropdownMenuItem>

              {/* tampilkan hanya jika Admin */}
              {userLevel === 3 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => router.push("/dashboard/settings")}>
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Pengaturan
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setIsLogoutModalOpen(true)}
                disabled={isLoading || !isTokenReady}
                className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              {/* Icon */}
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                Logout sistem?
              </h3>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Apakah Anda yakin ingin keluar dari sistem?
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  disabled={isLoading}
                  className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Batal
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

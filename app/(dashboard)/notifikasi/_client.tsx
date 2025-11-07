// app/(dashboard)/dashboard/notifikasi/_client.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Check,
  CheckCheck,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  MessageSquare,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface NotifikasiData {
  notifikasi_id: number;
  pegawai_id: number;
  judul: string;
  pesan: string;
  tipe_notifikasi: string;
  laporan_id: number | null;
  link_tujuan: string | null;
  action_required: number;
  is_read: number;
  tanggal_dibaca: string | null;
  created_at: string;
}

export default function NotifikasiClient() {
  const [notifikasi, setNotifikasi] = useState<NotifikasiData[]>([]);
  const [filteredNotifikasi, setFilteredNotifikasi] = useState<
    NotifikasiData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipe, setFilterTipe] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch notifikasi
  useEffect(() => {
    fetchNotifikasi();
  }, []);

  // Filter notifikasi
  useEffect(() => {
    let filtered = [...notifikasi];

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (notif) =>
          notif.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notif.pesan?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tipe
    if (filterTipe !== "all") {
      filtered = filtered.filter(
        (notif) => notif.tipe_notifikasi === filterTipe
      );
    }

    // Filter by status (read/unread)
    if (filterStatus !== "all") {
      if (filterStatus === "unread") {
        filtered = filtered.filter((notif) => notif.is_read === 0);
      } else if (filterStatus === "read") {
        filtered = filtered.filter((notif) => notif.is_read === 1);
      }
    }

    setFilteredNotifikasi(filtered);
    setCurrentPage(1);
  }, [searchQuery, filterTipe, filterStatus, notifikasi]);

  const fetchNotifikasi = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/notifikasi");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memuat notifikasi");
      }

      setNotifikasi(result.data);
      setFilteredNotifikasi(result.data);
    } catch (err: any) {
      console.error("Error fetching notifikasi:", err);
      setError(err?.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notifikasiId: number) => {
    try {
      const response = await fetch(`/api/notifikasi/${notifikasiId}/read`, {
        method: "PATCH",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update local state
        setNotifikasi((prev) =>
          prev.map((notif) =>
            notif.notifikasi_id === notifikasiId
              ? {
                  ...notif,
                  is_read: 1,
                  tanggal_dibaca: new Date().toISOString(),
                }
              : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifikasi/read-all", {
        method: "PATCH",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchNotifikasi();
        alert(`${result.count} notifikasi ditandai sudah dibaca`);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      alert("Gagal menandai semua notifikasi");
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotifikasi.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredNotifikasi.length / itemsPerPage);

  const getTipeIcon = (tipe: string) => {
    const icons: { [key: string]: any } = {
      Verifikasi: CheckCircle,
      Penolakan: XCircle,
      Komentar: MessageSquare,
      Reminder: Clock,
      Info: Info,
      Peringatan: AlertTriangle,
    };
    return icons[tipe] || Bell;
  };

  const getTipeColor = (tipe: string) => {
    const colors: { [key: string]: string } = {
      Verifikasi:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Penolakan: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Komentar: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Reminder:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Info: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Peringatan:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return (
      colors[tipe] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    );
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

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const unreadCount = notifikasi.filter((n) => n.is_read === 0).length;
  const uniqueTipes = Array.from(
    new Set(notifikasi.map((n) => n.tipe_notifikasi))
  ).sort();

  if (loading && notifikasi.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Memuat notifikasi...
          </p>
        </div>
      </div>
    );
  }

  if (error && notifikasi.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            {error}
          </p>
          <button
            onClick={fetchNotifikasi}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notifikasi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <CheckCheck className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {notifikasi.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Belum Dibaca
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {unreadCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sudah Dibaca
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {notifikasi.filter((n) => n.is_read === 1).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hasil Filter
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {filteredNotifikasi.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari notifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Filter Tipe */}
          <div>
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="all">Semua Tipe</option>
              {uniqueTipes.map((tipe) => (
                <option key={tipe} value={tipe}>
                  {tipe}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="all">Semua Status</option>
              <option value="unread">Belum Dibaca</option>
              <option value="read">Sudah Dibaca</option>
            </select>
          </div>
        </div>

        {/* Reset Filters */}
        {(searchQuery || filterTipe !== "all" || filterStatus !== "all") && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Filter aktif: {filteredNotifikasi.length} dari {notifikasi.length}{" "}
              notifikasi
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterTipe("all");
                setFilterStatus("all");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
              <X className="w-4 h-4" />
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Notifikasi List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {currentItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold">Tidak ada notifikasi</p>
            <p className="text-sm mt-1">
              {searchQuery || filterTipe !== "all" || filterStatus !== "all"
                ? "Coba ubah filter pencarian"
                : "Belum ada notifikasi untuk Anda"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentItems.map((notif) => {
              const TipeIcon = getTipeIcon(notif.tipe_notifikasi);
              return (
                <div
                  key={notif.notifikasi_id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${
                    notif.is_read === 0 ? "bg-blue-50 dark:bg-blue-900/10" : ""
                  }`}
                  onClick={() => {
                    if (notif.is_read === 0) {
                      handleMarkAsRead(notif.notifikasi_id);
                    }
                    if (notif.link_tujuan) {
                      window.location.href = notif.link_tujuan;
                    }
                  }}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTipeColor(
                        notif.tipe_notifikasi
                      )}`}>
                      <TipeIcon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${
                              notif.is_read === 0 ? "font-bold" : ""
                            }`}>
                            {notif.judul}
                            {notif.is_read === 0 && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                            {notif.pesan}
                          </p>
                        </div>

                        {/* Badge & Actions */}
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getTipeColor(
                              notif.tipe_notifikasi
                            )}`}>
                            {notif.tipe_notifikasi}
                          </span>
                          {notif.is_read === 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.notifikasi_id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                              title="Tandai sudah dibaca">
                              <Check className="w-3 h-3" />
                              Tandai dibaca
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(notif.created_at)}
                        </div>
                        {notif.action_required === 1 && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full font-medium">
                            Perlu Tindakan
                          </span>
                        )}
                        {notif.is_read === 1 && notif.tanggal_dibaca && (
                          <span className="flex items-center gap-1">
                            <CheckCheck className="w-3 h-3" />
                            Dibaca {formatDate(notif.tanggal_dibaca)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Menampilkan {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredNotifikasi.length)} dari{" "}
              {filteredNotifikasi.length} notifikasi
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 dark:text-gray-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      }`}>
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 dark:text-gray-300">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// app/(dashboard)/dashboard/logs/_client.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  showSuccess,
  showError,
  showConfirm,
  showLoading,
  closeLoading,
  showToast,
} from "@/lib/utils/sweetalert";
import {
  Activity,
  Search,
  Trash2,
  AlertCircle,
  Calendar,
  User,
  Globe,
  Monitor,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

interface LogData {
  log_id: number;
  pegawai_id: number | null;
  pegawai_nama: string | null;
  aksi: string;
  modul: string;
  detail_aksi: string | null;
  data_sebelum: any;
  data_sesudah: any;
  ip_address: string | null;
  user_agent: string | null;
  endpoint: string | null;
  method: string | null;
  created_at: string;
}

export default function LogsClient() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModul, setFilterModul] = useState<string>("all");
  const [filterAksi, setFilterAksi] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogData | null>(null);

  // Fetch logs
  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  useEffect(() => {
    let filtered = [...logs];

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (log) =>
          log.pegawai_nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.aksi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.modul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.detail_aksi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.endpoint?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by modul
    if (filterModul !== "all") {
      filtered = filtered.filter((log) => log.modul === filterModul);
    }

    // Filter by aksi
    if (filterAksi !== "all") {
      filtered = filtered.filter((log) => log.aksi === filterAksi);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [searchQuery, filterModul, filterAksi, logs]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/logs");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memuat log aktivitas");
      }

      setLogs(result.data);
      setFilteredLogs(result.data);
    } catch (err: any) {
      console.error("Error fetching logs:", err);
      setError(err?.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (log: LogData) => {
    setSelectedLog(log);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLog) return;

    try {
      showLoading("Menghapus log...");

      const response = await fetch(`/api/logs?id=${selectedLog.log_id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      closeLoading();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus log");
      }

      showToast("success", "Log berhasil dihapus");

      // Close modal and reset
      setIsDeleteModalOpen(false);
      setSelectedLog(null);

      fetchLogs();
    } catch (error: any) {
      closeLoading();
      showError(
        "Gagal!",
        error?.message || "Terjadi kesalahan saat menghapus log"
      );
    }
  };

  const handleDeleteAll = async () => {
    // Confirm dengan SweetAlert2
    const confirmed = await showConfirm(
      "Hapus Semua Log?",
      `Anda akan menghapus ${logs.length} log aktivitas secara permanen. Tindakan ini tidak dapat dibatalkan!`,
      "Ya, Hapus Semua",
      "Batal"
    );

    if (!confirmed) return;

    try {
      showLoading("Menghapus semua log...");

      const response = await fetch("/api/logs/clear", {
        method: "DELETE",
      });

      const result = await response.json();

      closeLoading();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus log");
      }

      await showSuccess(
        "Berhasil!",
        `Berhasil menghapus ${result.deletedCount} log aktivitas`
      );
      fetchLogs();
    } catch (error: any) {
      closeLoading();
      showError(
        "Gagal!",
        error?.message || "Terjadi kesalahan saat menghapus log"
      );
    }
  };

  // Get unique modules and actions for filters
  const uniqueModuls = Array.from(new Set(logs.map((log) => log.modul))).sort();
  const uniqueAksi = Array.from(new Set(logs.map((log) => log.aksi))).sort();

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const getAksiColor = (aksi: string) => {
    const colors: { [key: string]: string } = {
      Login:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Logout: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      Create: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Update:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      View: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return (
      colors[aksi] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    );
  };

  const getMethodColor = (method: string | null) => {
    if (!method)
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    const colors: { [key: string]: string } = {
      GET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      PATCH:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      colors[method] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Memuat log aktivitas...
          </p>
        </div>
      </div>
    );
  }

  if (error && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            {error}
          </p>
          <button
            onClick={fetchLogs}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Log Aktivitas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor semua aktivitas pengguna di sistem
            </p>
          </div>
          <button
            onClick={handleDeleteAll}
            disabled={logs.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Trash2 className="w-4 h-4" />
            Hapus Semua Log
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Log
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {logs.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-300" />
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
                  {filteredLogs.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Modul Unik
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {uniqueModuls.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aksi Unik
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {uniqueAksi.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-300" />
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
                placeholder="Cari log aktivitas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Filter Modul */}
            <div>
              <select
                value={filterModul}
                onChange={(e) => setFilterModul(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="all">Semua Modul</option>
                {uniqueModuls.map((modul) => (
                  <option key={modul} value={modul}>
                    {modul}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Aksi */}
            <div>
              <select
                value={filterAksi}
                onChange={(e) => setFilterAksi(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="all">Semua Aksi</option>
                {uniqueAksi.map((aksi) => (
                  <option key={aksi} value={aksi}>
                    {aksi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {(searchQuery || filterModul !== "all" || filterAksi !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Filter aktif: {filteredLogs.length} dari {logs.length} log
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterModul("all");
                  setFilterAksi("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                <X className="w-4 h-4" />
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Modul
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Detail
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold">
                        Tidak ada log aktivitas
                      </p>
                      <p className="text-sm mt-1">
                        {searchQuery ||
                        filterModul !== "all" ||
                        filterAksi !== "all"
                          ? "Coba ubah filter pencarian"
                          : "Belum ada aktivitas tercatat"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((log) => (
                    <tr
                      key={log.log_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-gray-100">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {log.pegawai_nama || "System"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getAksiColor(
                            log.aksi
                          )}`}>
                          {log.aksi}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {log.modul}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                          {log.detail_aksi || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {log.method && (
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded ${getMethodColor(
                                log.method
                              )} w-fit`}>
                              {log.method}
                            </span>
                          )}
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {log.endpoint || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {log.ip_address || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(log)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                          title="Hapus log">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Menampilkan {indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, filteredLogs.length)} dari{" "}
                {filteredLogs.length} log
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              {/* Icon */}
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                Hapus Log Ini?
              </h3>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Log aktivitas{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedLog.aksi}
                </span>{" "}
                oleh{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedLog.pegawai_nama || "System"}
                </span>{" "}
                pada modul{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedLog.modul}
                </span>{" "}
                akan dihapus permanen.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedLog(null);
                  }}
                  disabled={loading}
                  className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50">
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

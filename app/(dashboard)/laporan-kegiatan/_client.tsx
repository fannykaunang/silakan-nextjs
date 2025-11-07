// app/(dashboard)/dashboard/laporan-kegiatan/_client.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Filter,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  User,
  Tag,
  AlertCircle,
  FileBarChart,
  PenSquare,
} from "lucide-react";
import Swal from "sweetalert2";

interface LaporanData {
  laporan_id: number;
  pegawai_id: number;
  pegawai_nama: string;
  pegawai_nip: string;
  skpd: string;
  tanggal_kegiatan: string;
  kategori_id: number;
  nama_kategori: string;
  nama_kegiatan: string;
  deskripsi_kegiatan: string;
  waktu_mulai: string;
  waktu_selesai: string;
  durasi_menit: number;
  lokasi_kegiatan: string | null;
  status_laporan: "Draft" | "Diajukan" | "Diverifikasi" | "Ditolak" | "Revisi";
  rating_kualitas: number | null;
  created_at: string;
  updated_at: string;
}

interface Kategori {
  kategori_id: number;
  nama_kategori: string;
}

export default function LaporanListClient() {
  const router = useRouter();
  const [laporanList, setLaporanList] = useState<LaporanData[]>([]);
  const [filteredList, setFilteredList] = useState<LaporanData[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSKPD, setFilterSKPD] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get unique SKPDs for filter
  const uniqueSKPDs = Array.from(
    new Set(laporanList.map((l) => l.skpd).filter(Boolean))
  ).sort();

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "Draft", label: "Draft" },
    { value: "Diajukan", label: "Diajukan" },
    { value: "Diverifikasi", label: "Diverifikasi" },
    { value: "Ditolak", label: "Ditolak" },
    { value: "Revisi", label: "Revisi" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [laporanList, searchQuery, filterSKPD, filterKategori, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch laporan
      const laporanRes = await fetch("/api/laporan-kegiatan");
      if (!laporanRes.ok) throw new Error("Gagal mengambil data laporan");
      const laporanData = await laporanRes.json();
      setLaporanList(laporanData);

      // Check if admin (if first item has different pegawai_id, then admin)
      if (laporanData.length > 0) {
        // Simple check: if we see multiple different pegawai_ids, user is admin
        const uniquePegawaiIds = new Set(
          laporanData.map((l: LaporanData) => l.pegawai_id)
        );
        setIsAdmin(uniquePegawaiIds.size > 1);
      }

      // Fetch kategoris for filter (only active ones)
      const kategoriRes = await fetch("/api/kategori?is_active=1");
      if (kategoriRes.ok) {
        const kategoriResponse = await kategoriRes.json();
        // Handle response format: { success: true, data: [...], count: ... }
        if (kategoriResponse.success && kategoriResponse.data) {
          setKategoris(kategoriResponse.data);
        }
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error?.message || "Terjadi kesalahan saat memuat data");
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengambil data laporan",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...laporanList];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (laporan) =>
          laporan.nama_kegiatan.toLowerCase().includes(query) ||
          laporan.pegawai_nama.toLowerCase().includes(query) ||
          laporan.nama_kategori.toLowerCase().includes(query) ||
          laporan.deskripsi_kegiatan.toLowerCase().includes(query)
      );
    }

    // SKPD filter (admin only)
    if (filterSKPD) {
      filtered = filtered.filter((laporan) => laporan.skpd === filterSKPD);
    }

    // Kategori filter
    if (filterKategori) {
      filtered = filtered.filter(
        (laporan) => laporan.kategori_id === parseInt(filterKategori)
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(
        (laporan) => laporan.status_laporan === filterStatus
      );
    }

    setFilteredList(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDelete = async (laporan: LaporanData) => {
    // Check if can be deleted
    const canDelete = ["Draft", "Diajukan", "Revisi"].includes(
      laporan.status_laporan
    );

    if (!canDelete) {
      await Swal.fire({
        icon: "warning",
        title: "Tidak Dapat Dihapus",
        text: `Laporan dengan status ${laporan.status_laporan} tidak dapat dihapus`,
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Hapus Laporan?",
      html: `Apakah Anda yakin ingin menghapus laporan:<br/><strong>${laporan.nama_kegiatan}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#fff",
      color: document.documentElement.classList.contains("dark")
        ? "#fff"
        : "#000",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `/api/laporan-kegiatan/${laporan.laporan_id}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal menghapus laporan");
        }

        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Laporan berhasil dihapus",
          timer: 1500,
          showConfirmButton: false,
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        });

        // Refresh data
        fetchData();
      } catch (error: any) {
        console.error("Error deleting laporan:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Gagal menghapus laporan",
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        });
      }
    }
  };

  const handlePrint = (laporan: LaporanData) => {
    // TODO: Implement print functionality
    Swal.fire({
      icon: "info",
      title: "Print",
      text: `Print functionality untuk: ${laporan.nama_kegiatan}`,
      background: document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#fff",
      color: document.documentElement.classList.contains("dark")
        ? "#fff"
        : "#000",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterSKPD("");
    setFilterKategori("");
    setFilterStatus("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderStars = (rating: number | null) => {
    if (!rating) {
      return <span className="text-gray-400 text-xs">Belum dinilai</span>;
    }

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      Draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      Diajukan: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Diverifikasi:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Ditolak: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      Revisi:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          badges[status as keyof typeof badges] || badges.Draft
        }`}>
        {status}
      </span>
    );
  };

  const canEdit = (status: string) => {
    return ["Draft", "Diajukan", "Revisi"].includes(status);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Memuat Laporan Kegiatan...
          </p>
        </div>
      </div>
    );
  }

  if (error && laporanList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            {error}
          </p>
          <button
            onClick={fetchData}
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Laporan Kegiatan Harian
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Kelola dan pantau laporan kegiatan harian ASN
              </p>
            </div>
            <button
              onClick={() => router.push("/laporan-kegiatan/tambah")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg cursor-pointer">
              <Plus className="w-5 h-5" />
              Tambah Kegiatan
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Laporan"
              value={laporanList.length}
              icon={FileBarChart}
            />
            <StatCard
              title="Draft"
              value={
                laporanList.filter((l) => l.status_laporan === "Draft").length
              }
              icon={PenSquare}
              accent="bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200"
            />
            <StatCard
              title="Diverifikasi"
              value={
                laporanList.filter((l) => l.status_laporan === "Diverifikasi")
                  .length
              }
              icon={Eye}
              accent="bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-200"
            />
            <StatCard
              title="Hasil Filter"
              value={filteredList.length}
              icon={Filter}
              accent="bg-blue-70 text-blue-700 dark:bg-blue-700/40 dark:text-blue-200"
            />
          </div>

          {/* Search & Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter & Pencarian
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pencarian
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama kegiatan, pegawai, kategori..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* SKPD Filter (Admin only) */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKPD
                  </label>
                  <select
                    value={filterSKPD}
                    onChange={(e) => setFilterSKPD(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="">Semua SKPD</option>
                    {uniqueSKPDs.map((skpd) => (
                      <option key={skpd} value={skpd}>
                        {skpd}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kategori Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori
                </label>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Semua Kategori</option>
                  {kategoris.map((kat) => (
                    <option key={kat.kategori_id} value={kat.kategori_id}>
                      {kat.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || filterSKPD || filterKategori || filterStatus) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                  Hapus Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pegawai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kegiatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Waktu & Durasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">Tidak ada data</p>
                      <p className="text-sm">
                        Belum ada laporan kegiatan atau coba ubah filter
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((laporan) => (
                    <tr
                      key={laporan.laporan_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {/* Tanggal */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(laporan.tanggal_kegiatan)}
                        </div>
                      </td>

                      {/* Pegawai */}
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/pegawai/${laporan.pegawai_id}`}
                            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                            {laporan.pegawai_nama}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {laporan.pegawai_nip}
                          </p>
                          {isAdmin && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {laporan.skpd}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Kegiatan */}
                      <td className="px-6 py-4 max-w-xs">
                        <div>
                          <Link
                            href={`/laporan-kegiatan/${laporan.laporan_id}`}
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline line-clamp-1">
                            {laporan.nama_kegiatan}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            {laporan.deskripsi_kegiatan}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Tag className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {laporan.nama_kategori}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Waktu & Durasi */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatTime(laporan.waktu_mulai)} -{" "}
                          {formatTime(laporan.waktu_selesai)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDuration(laporan.durasi_menit)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(laporan.status_laporan)}
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(laporan.rating_kualitas)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* View/Edit */}
                          <button
                            onClick={() =>
                              router.push(
                                `/laporan-kegiatan/${laporan.laporan_id}`
                              )
                            }
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title={
                              canEdit(laporan.status_laporan) ? "Edit" : "Lihat"
                            }>
                            {canEdit(laporan.status_laporan) ? (
                              <Edit2 className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>

                          {/* Delete */}
                          {canEdit(laporan.status_laporan) && (
                            <button
                              onClick={() => handleDelete(laporan)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Hapus">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}

                          {/* Print */}
                          <button
                            onClick={() => handlePrint(laporan)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            title="Print">
                            <Printer className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Menampilkan{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    sampai{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredList.length)}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium">{filteredList.length}</span>{" "}
                    hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? "z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                            }`}>
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent?: string;
}

function StatCard({ title, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`p-3 rounded-lg ${
            accent ||
            "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200"
          }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

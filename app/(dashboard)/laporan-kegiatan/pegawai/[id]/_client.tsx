// app/(dashboard)/laporan-kegiatan/pegawai/[id]/_client.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  User,
  Tag,
  Briefcase,
  Building2,
  XCircle,
  PenSquare,
  Printer,
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

interface PegawaiInfo {
  pegawai_id: number;
  pegawai_nama: string;
  pegawai_nip: string;
  jabatan?: string | null;
  skpd?: string | null;
}

type LaporanStatus =
  | "Draft"
  | "Diajukan"
  | "Diverifikasi"
  | "Ditolak"
  | "Revisi";

const statusOptions: { value: "" | LaporanStatus; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "Draft", label: "Draft" },
  { value: "Diajukan", label: "Diajukan" },
  { value: "Diverifikasi", label: "Diverifikasi" },
  { value: "Ditolak", label: "Ditolak" },
  { value: "Revisi", label: "Revisi" },
];

export default function PegawaiLaporanListClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pegawaiId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [pegawai, setPegawai] = useState<PegawaiInfo | null>(null);
  const [laporanList, setLaporanList] = useState<LaporanData[]>([]);
  const [filteredList, setFilteredList] = useState<LaporanData[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | LaporanStatus>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!pegawaiId) {
      return;
    }

    fetchData(pegawaiId);
    fetchKategori();
  }, [pegawaiId]);

  useEffect(() => {
    applyFilters();
  }, [
    laporanList,
    searchQuery,
    filterKategori,
    filterStatus,
    startDate,
    endDate,
  ]);

  const fetchData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/laporan-kegiatan/pegawai/${id}`, {
        cache: "no-store",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        const message =
          result?.error || result?.message || "Gagal mengambil data laporan";
        setError(message);
        await Swal.fire({
          icon: "error",
          title: "Gagal",
          text: message,
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        });
        setLaporanList([]);
        setPegawai(result?.pegawai ?? null);
        return;
      }

      const data: LaporanData[] = Array.isArray(result.data) ? result.data : [];

      setPegawai(result.pegawai ?? null);
      setLaporanList(data);
      setFilteredList(data);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Error fetching laporan pegawai:", err);
      const message =
        err?.message || "Terjadi kesalahan saat mengambil data laporan";
      setError(message);
      await Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: message,
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

  const fetchKategori = async () => {
    try {
      const response = await fetch("/api/kategori?is_active=1", {
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.success && Array.isArray(data.data)) {
        setKategoris(data.data);
      }
    } catch (err) {
      console.error("Error fetching kategori:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...laporanList];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (laporan) =>
          laporan.nama_kegiatan.toLowerCase().includes(query) ||
          laporan.nama_kategori.toLowerCase().includes(query) ||
          laporan.deskripsi_kegiatan.toLowerCase().includes(query)
      );
    }

    if (filterKategori) {
      filtered = filtered.filter(
        (laporan) => laporan.kategori_id === Number(filterKategori)
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(
        (laporan) => laporan.status_laporan === filterStatus
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((laporan) => {
        const laporanDate = new Date(laporan.tanggal_kegiatan);
        laporanDate.setHours(0, 0, 0, 0);
        return laporanDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((laporan) => {
        const laporanDate = new Date(laporan.tanggal_kegiatan);
        return laporanDate <= end;
      });
    }

    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterKategori("");
    setFilterStatus("");
    setStartDate("");
    setEndDate("");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => timeString.substring(0, 5);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusBadge = (status: LaporanStatus) => {
    const badges: Record<LaporanStatus, string> = {
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
          badges[status] || badges.Draft
        }`}>
        {status}
      </span>
    );
  };

  type StatusCountMap = Record<LaporanStatus, number>;
  type StatusCounts = StatusCountMap & { total: number };

  const statusCounts = useMemo<StatusCounts>(() => {
    const counts = laporanList.reduce<StatusCountMap>(
      (acc, laporan) => {
        const status = laporan.status_laporan as LaporanStatus;

        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      },
      {
        Draft: 0,
        Diajukan: 0,
        Diverifikasi: 0,
        Ditolak: 0,
        Revisi: 0,
      }
    );
    return {
      ...counts,
      total:
        counts.Draft +
        counts.Diajukan +
        counts.Diverifikasi +
        counts.Ditolak +
        counts.Revisi,
    };
  }, [laporanList]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pegawaiId || (!pegawai && !laporanList.length && error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-md text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Data tidak tersedia
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error ||
              "Data laporan tidak ditemukan atau Anda tidak memiliki akses."}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                <ChevronLeft className="w-4 h-4" />
                Kembali
              </button>
              <span>/</span>
              <span>Laporan Pegawai</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-7 h-7 text-blue-600" />
              Laporan Kegiatan Pegawai
            </h1>
            {pegawai && (
              <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {pegawai.pegawai_nama}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-500" />
                  <span>{pegawai.pegawai_nip}</span>
                </div>
                {pegawai.jabatan && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span>{pegawai.jabatan}</span>
                  </div>
                )}
                {pegawai.skpd && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>{pegawai.skpd}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Laporan"
            value={statusCounts.total}
            icon={FileText}
          />
          <StatCard
            title="Draft"
            value={statusCounts.Draft}
            icon={PenSquare}
            accent="bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200"
          />
          <StatCard
            title="Diajukan"
            value={statusCounts.Diajukan}
            icon={Calendar}
            accent="bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200"
          />
          <StatCard
            title="Diverifikasi"
            value={statusCounts.Diverifikasi}
            icon={Eye}
            accent="bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-200"
          />
          <StatCard
            title="Ditolak"
            value={statusCounts.Ditolak}
            icon={XCircle}
            accent="bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-200"
          />
          <StatCard
            title="Revisi"
            value={statusCounts.Revisi}
            icon={Tag}
            accent="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-200"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama kegiatan, kategori, atau deskripsi"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex items-center gap-2 self-start">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/40 rounded-lg transition">
                  <Printer className="w-4 h-4" />
                  Cetak
                </button>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <X className="w-4 h-4" />
                  Reset Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as "" | LaporanStatus)
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    {statusOptions.map((status) => (
                      <option key={status.value || "all"} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Kategori Kegiatan
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filterKategori}
                    onChange={(e) => setFilterKategori(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <option value="">Semua Kategori</option>
                    {kategoris.map((kategori) => (
                      <option
                        key={kategori.kategori_id}
                        value={kategori.kategori_id}>
                        {kategori.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Periode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="Dari"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="Sampai"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nama Kegiatan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Durasi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      Tidak ada laporan ditemukan dengan filter saat ini.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((laporan, index) => (
                    <tr
                      key={laporan.laporan_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatDate(laporan.tanggal_kegiatan)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTime(laporan.waktu_mulai)} -{" "}
                            {formatTime(laporan.waktu_selesai)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {laporan.nama_kegiatan}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {laporan.deskripsi_kegiatan}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {laporan.nama_kategori}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatDuration(laporan.durasi_menit)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(laporan.status_laporan)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/laporan-kegiatan/${laporan.laporan_id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition">
                            <Eye className="w-4 h-4" />
                            Detail
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredList.length > 0 && (
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>
                Menampilkan {indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, filteredList.length)} dari{" "}
                {filteredList.length} laporan
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center w-9 h-9 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}>
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center w-9 h-9 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ChevronRight className="w-4 h-4" />
                </button>
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
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// app/(dashboard)/laporan-kegiatan/verifikasi/[id]/_client.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  PenSquare,
  ShieldAlert,
  User,
  XCircle,
} from "lucide-react";

type AllowedStatus = "Diverifikasi" | "Revisi" | "Ditolak";

type LaporanStatus =
  | "Draft"
  | "Diajukan"
  | "Diverifikasi"
  | "Ditolak"
  | "Revisi";

interface LaporanDetail {
  laporan_id: number;
  pegawai_id: number;
  pegawai_nama: string;
  pegawai_nip: string;
  skpd: string;
  nama_kegiatan: string;
  nama_kategori: string;
  tanggal_kegiatan: string;
  waktu_mulai: string;
  waktu_selesai: string;
  durasi_menit: number;
  status_laporan: LaporanStatus;
  deskripsi_kegiatan: string;
  hasil_output: string | null;
  target_output: string | null;
  catatan_verifikasi: string | null;
  rating_kualitas: number | null;
  verifikator_nama?: string | null;
  tanggal_verifikasi?: string | null;
}

interface RekapHarianSummary {
  rekap_id: number;
  pegawai_id: number;
  tanggal: string;
  jumlah_kegiatan: number;
  total_durasi_menit: number;
  jumlah_diverifikasi: number;
  jumlah_pending: number;
  jumlah_ditolak: number;
  produktivitas_persen: number;
  rata_rata_rating: number | string | null;
  is_complete: boolean;
}

interface VerificationResponse {
  success: boolean;
  message?: string;
  data?: {
    laporan: LaporanDetail;
    rekapHarian: RekapHarianSummary | null;
  };
}

const STATUS_OPTIONS: {
  value: AllowedStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    value: "Diverifikasi",
    label: "Setujui Laporan",
    description: "Laporan telah sesuai dan dapat diverifikasi",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    value: "Revisi",
    label: "Butuh Revisi",
    description: "Minta pegawai melakukan perbaikan sebelum diverifikasi",
    icon: PenSquare,
    color: "text-amber-600",
  },
  {
    value: "Ditolak",
    label: "Tolak Laporan",
    description: "Laporan tidak dapat diterima",
    icon: XCircle,
    color: "text-red-600",
  },
];

const STATUS_BADGE_STYLES: Record<LaporanStatus, string> = {
  Draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  Diajukan: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Diverifikasi:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Ditolak: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Revisi: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (value: string) => value?.slice(0, 5) ?? "-";

const formatDuration = (minutes: number) => {
  if (!minutes) return "0 menit";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours} jam ${mins ? `${mins} menit` : ""}`.trim();
  }
  return `${mins} menit`;
};

const formatPercent = (value: number | string | null | undefined) => {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return "0.00%";
  }
  return `${numeric.toFixed(2)}%`;
};

const formatRating = (value: number | string | null | undefined) => {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return "0.00";
  }
  return numeric.toFixed(2);
};

export default function LaporanVerifikasiClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const laporanId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [laporan, setLaporan] = useState<LaporanDetail | null>(null);
  const [rekap, setRekap] = useState<RekapHarianSummary | null>(null);
  const [status, setStatus] = useState<AllowedStatus>("Diverifikasi");
  const [catatan, setCatatan] = useState("");
  const [rating, setRating] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.email) {
          setUserEmail(parsed.email);
        }
      } catch (err) {
        console.warn("Failed to parse user storage", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!laporanId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/laporan-kegiatan/${laporanId}/verifikasi`
        );
        const payload: VerificationResponse = await res.json();

        if (!res.ok || !payload.success || !payload.data) {
          throw new Error(
            payload.message || "Gagal memuat data verifikasi laporan"
          );
        }

        const fetchedLaporan = payload.data.laporan;
        const fetchedRekap = payload.data.rekapHarian ?? null;

        setLaporan(fetchedLaporan);
        setRekap(fetchedRekap);

        const currentStatus = fetchedLaporan.status_laporan;
        const allowedStatuses: AllowedStatus[] = [
          "Diverifikasi",
          "Revisi",
          "Ditolak",
        ];

        if (allowedStatuses.includes(currentStatus as AllowedStatus)) {
          setStatus(currentStatus as AllowedStatus);
        } else {
          setStatus("Diverifikasi");
        }

        setCatatan(fetchedLaporan.catatan_verifikasi ?? "");
        setRating(
          fetchedLaporan.rating_kualitas !== null &&
            fetchedLaporan.rating_kualitas !== undefined
            ? String(fetchedLaporan.rating_kualitas)
            : ""
        );
        setIsComplete(Boolean(fetchedRekap?.is_complete));
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [laporanId]);

  const statusBadge = useMemo(() => {
    if (!laporan) return null;
    const badgeClass =
      STATUS_BADGE_STYLES[laporan.status_laporan] || STATUS_BADGE_STYLES.Draft;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
        {laporan.status_laporan}
      </span>
    );
  }, [laporan]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!laporanId || !laporan) return;

    const darkMode = document.documentElement.classList.contains("dark");

    const confirmation = await Swal.fire({
      title: "Konfirmasi Verifikasi",
      text: `Anda akan mengubah status laporan menjadi ${status}. Lanjutkan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, proses",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      background: darkMode ? "#1f2937" : "#ffffff",
      color: darkMode ? "#f9fafb" : "#111827",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    // Validasi rating wajib diisi
    if (rating === "" || rating === null || rating === undefined) {
      setRatingError(true);
      return;
    }

    const numericRating = rating === "" ? null : Number(rating);

    if (numericRating !== null) {
      if (Number.isNaN(numericRating)) {
        await Swal.fire({
          icon: "error",
          title: "Rating tidak valid",
          text: "Masukkan nilai rating antara 0 hingga 5.",
          confirmButtonColor: "#ef4444",
          background: darkMode ? "#1f2937" : "#ffffff",
          color: darkMode ? "#f9fafb" : "#111827",
        });
        return;
      }

      if (numericRating < 0 || numericRating > 5) {
        await Swal.fire({
          icon: "error",
          title: "Rating tidak valid",
          text: "Nilai rating harus berada di antara 0 hingga 5.",
          confirmButtonColor: "#ef4444",
          background: darkMode ? "#1f2937" : "#ffffff",
          color: darkMode ? "#f9fafb" : "#111827",
        });
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        status_laporan: status,
        catatan_verifikasi: catatan.trim() || null,
        rating_kualitas: numericRating,
        is_complete: isComplete,
      };

      const response = await fetch(
        `/api/laporan-kegiatan/${laporanId}/verifikasi`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result: VerificationResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Gagal memproses verifikasi laporan");
      }

      const updatedLaporan = result.data.laporan;
      const updatedRekap = result.data.rekapHarian ?? null;

      setLaporan(updatedLaporan);
      setRekap(updatedRekap);
      setCatatan(updatedLaporan.catatan_verifikasi ?? "");
      setRating(
        updatedLaporan.rating_kualitas !== null &&
          updatedLaporan.rating_kualitas !== undefined
          ? String(updatedLaporan.rating_kualitas)
          : ""
      );
      setIsComplete(Boolean(updatedRekap?.is_complete));

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: result.message || "Laporan berhasil diproses",
        confirmButtonColor: "#2563eb",
        background: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#f9fafb" : "#111827",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/laporan-kegiatan");
        }
      });
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses verifikasi",
        confirmButtonColor: "#ef4444",
        background: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#f9fafb" : "#111827",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Memuat data laporan...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
              Akses Ditolak
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
          </div>
          <button
            onClick={() => router.push("/laporan-kegiatan")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke daftar laporan
          </button>
        </div>
      );
    }

    if (!laporan) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-300">
            Data laporan tidak tersedia.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          {statusBadge}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wide">
                  Detail Laporan Kegiatan
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {laporan.nama_kegiatan}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                {laporan.pegawai_nama} ({laporan.pegawai_nip})
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {laporan.skpd}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-xl p-4">
              <p className="text-xs text-blue-600 dark:text-blue-300 uppercase">
                Tanggal
              </p>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-200 mt-1">
                {formatDate(laporan.tanggal_kegiatan)}
              </p>
            </div>
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl p-4">
              <p className="text-xs text-emerald-600 dark:text-emerald-300 uppercase">
                Kategori
              </p>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200 mt-1">
                {laporan.nama_kategori}
              </p>
            </div>
            <div className="bg-purple-50/60 dark:bg-purple-950/30 rounded-xl p-4">
              <p className="text-xs text-purple-600 dark:text-purple-300 uppercase">
                Waktu
              </p>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-200 mt-1">
                {formatTime(laporan.waktu_mulai)} -{" "}
                {formatTime(laporan.waktu_selesai)}
              </p>
            </div>
            <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-xl p-4">
              <p className="text-xs text-amber-600 dark:text-amber-300 uppercase">
                Durasi
              </p>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-200 mt-1">
                {formatDuration(laporan.durasi_menit)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Target Output
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                {laporan.target_output || "-"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Hasil Output
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                {laporan.hasil_output || "-"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Deskripsi Kegiatan
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {laporan.deskripsi_kegiatan || "Tidak ada deskripsi"}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Tindakan Verifikasi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Pilih status verifikasi dan lengkapi catatan jika diperlukan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = status === option.value;
              return (
                <label
                  key={option.value}
                  className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                    isActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}>
                  <input
                    type="radio"
                    name="status_laporan"
                    value={option.value}
                    checked={isActive}
                    onChange={() => setStatus(option.value)}
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${option.color}`} />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {option.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Catatan Verifikasi
              </label>
              <textarea
                value={catatan}
                onChange={(event) => setCatatan(event.target.value)}
                rows={5}
                placeholder="Tambahkan catatan untuk pegawai..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Rating Kualitas (0-5)
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.5}
                  value={rating}
                  onChange={(event) => {
                    setRating(event.target.value);
                    setRatingError(false);
                  }}
                  placeholder="Masukkan rating"
                  className={`w-full rounded-xl border ${
                    ratingError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:ring-blue-500"
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2`}
                />
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                <input
                  id="is-complete"
                  type="checkbox"
                  checked={isComplete}
                  onChange={(event) => setIsComplete(event.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is-complete" className="flex-1">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Tandai rekap harian sebagai selesai
                  </span>
                  <span className="block text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Checklist ini akan menandai rekap harian pegawai sebagai
                    selesai (is_complete).
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft className="w-4 h-4" />
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Simpan Verifikasi
            </button>
          </div>
        </form>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Clock className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Rekap Harian Pegawai
            </h2>
          </div>
          {rekap ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500">Tanggal</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {formatDate(rekap.tanggal)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500">Jumlah Kegiatan</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {rekap.jumlah_kegiatan}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500">Diverifikasi</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {rekap.jumlah_diverifikasi}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500">Produktivitas</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {formatPercent(rekap.produktivitas_persen)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {rekap.jumlah_pending}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500">Ditolak</p>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {rekap.jumlah_ditolak}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500">Total Durasi</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {formatDuration(rekap.total_durasi_menit)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500">Rata-Rata Rating</p>
                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {formatRating(rekap.rata_rata_rating)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 md:col-span-2">
                <p className="text-xs text-gray-500">Status Rekap</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {isComplete ? "Selesai" : "Belum selesai"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
              Rekap harian belum tersedia untuk tanggal ini.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="max-w-6xl mx-auto py-4">{renderContent()}</div>
    </DashboardLayout>
  );
}

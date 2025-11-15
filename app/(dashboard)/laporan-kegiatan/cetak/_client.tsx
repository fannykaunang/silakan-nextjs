// app/(dashboard)/laporan-kegiatan/cetak/_client.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Printer } from "lucide-react";
import Swal from "sweetalert2";

interface PegawaiOption {
  id: number;
  nama: string;
  nip: string | null;
  jabatan: string | null;
  skpd: string | null;
}

interface LaporanItem {
  laporan_id: number;
  tanggal_kegiatan: string;
  nama_kegiatan: string;
  deskripsi_kegiatan: string | null;
  nama_kategori: string;
  waktu_mulai: string;
  waktu_selesai: string;
}

interface LampiranItem {
  file_id: number;
  laporan_id: number;
  nama_file_asli: string;
  nama_file_sistem: string;
  path_file: string;
  tipe_file: string | null;
  ukuran_file: number | null;
  uploaded_by: number;
  deskripsi_file: string | null;
  created_at: string;
  nama_kegiatan: string;
  tanggal_kegiatan: string;
}

interface SignatureState {
  pembuatTitle: string;
  pembuatName: string;
  pembuatJabatan: string;
  pembuatNip: string;
  pemeriksaTitle: string;
  pemeriksaName: string;
  pemeriksaJabatan: string;
  pemeriksaNip: string;
  approverTitle: string;
  approverName: string;
  approverJabatan: string;
  approverNip: string;
}

interface PegawaiApiItem {
  pegawai_id: number;
  pegawai_nama: string;
  pegawai_nip?: string | null;
  jabatan?: string | null;
  skpd?: string | null;
}

interface PegawaiApiResponse {
  success: boolean;
  data?: PegawaiApiItem[];
  meta?: {
    total?: number;
    role?: "admin" | "subadmin" | "atasan" | "pegawai" | string | null;
    currentPegawaiId?: number | null;
  };
  message?: string;
  error?: string;
}

interface CetakApiResponse {
  success: boolean;
  data?: {
    pegawai?: PegawaiApiItem;
    laporan?: LaporanItem[];
    lampiran?: LampiranItem[];
  };
  error?: string;
  message?: string;
}

const today = new Date();
const defaultMonth = today.getMonth() + 1;
const defaultYear = today.getFullYear();
const PRINT_CONTAINER_ID = "laporan-kegiatan-print-area";
const PRINT_FOCUS_CLASS = "laporan-print-focus-table";

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Date(2000, index, 1).toLocaleDateString("id-ID", {
    month: "long",
  }),
}));

const yearOptions = Array.from(
  { length: 7 },
  (_, index) => defaultYear - 3 + index
);

function formatActivity(item: LaporanItem): string {
  const name = item.nama_kegiatan?.trim();
  const description = item.deskripsi_kegiatan?.trim();

  if (name && description) {
    if (description.toLowerCase().includes(name.toLowerCase())) {
      return description;
    }
    return `${name} – ${description}`;
  }

  return description || name || "-";
}

function parseDateValue(value: string | Date | null | undefined): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct;

  const normalizedSpaces = trimmed.replace(/\s+/g, "T");
  if (normalizedSpaces !== trimmed) {
    const normalizedDate = new Date(normalizedSpaces);
    if (!Number.isNaN(normalizedDate.getTime())) {
      return normalizedDate;
    }
  }

  if (!trimmed.includes("T")) {
    const appended = new Date(`${trimmed}T00:00:00`);
    if (!Number.isNaN(appended.getTime())) {
      return appended;
    }
  }

  return null;
}

function formatFullDate(date: string | Date | null | undefined): string {
  const parsed = parseDateValue(date);
  if (!parsed) {
    if (typeof date === "string" && date.trim()) {
      return date;
    }
    return "-";
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getDayName(date: string | Date | null | undefined): string {
  const parsed = parseDateValue(date);
  if (!parsed) return "-";
  return parsed.toLocaleDateString("id-ID", { weekday: "long" }).toUpperCase();
}

function formatDateTime(value: string | Date | null | undefined): string {
  const parsed = parseDateValue(value);
  if (!parsed) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    return "-";
  }

  return parsed.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || Number.isNaN(bytes) || bytes <= 0) return "-";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const normalized = Number.isInteger(size) ? size : Number(size.toFixed(1));
  return `${normalized} ${units[unitIndex]}`;
}

function formatFileType(value: string | null | undefined): string {
  if (!value) return "-";
  return value.split("/").pop()?.toUpperCase() || value.toUpperCase();
}

export default function CetakLaporanBulananClient() {
  const [pegawaiList, setPegawaiList] = useState<PegawaiOption[]>([]);
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [pegawaiInfo, setPegawaiInfo] = useState<PegawaiOption | null>(null);
  const [laporanList, setLaporanList] = useState<LaporanItem[]>([]);
  const [lampiranList, setLampiranList] = useState<LampiranItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const [reportTitle, setReportTitle] = useState(
    "LAPORAN KEGIATAN TIM ABSENSI"
  );
  const [reportSubtitle, setReportSubtitle] = useState(
    "BIDANG PENGEMBANGAN LAYANAN"
  );
  const subtitleDirtyRef = useRef<boolean>(false);

  const [signature, setSignature] = useState<SignatureState>({
    pembuatTitle: "PEMBUAT LAPORAN",
    pembuatName: "",
    pembuatJabatan: "",
    pembuatNip: "",
    pemeriksaTitle: "PEMERIKSA",
    pemeriksaName: "",
    pemeriksaJabatan: "",
    pemeriksaNip: "",
    approverTitle: "MENYETUJUI",
    approverName: "",
    approverJabatan: "",
    approverNip: "",
  });

  const printTableRef = useRef<HTMLDivElement | null>(null);

  // =========================== FETCH PEGAWAI ===========================
  useEffect(() => {
    const fetchPegawai = async () => {
      try {
        const response = await fetch("/api/laporan-kegiatan/cetak/pegawai", {
          cache: "no-store",
        });

        const raw: unknown = await response.json().catch(() => null);
        const result = raw as PegawaiApiResponse | null;

        if (!response.ok || !result?.success || !Array.isArray(result.data)) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Gagal mengambil daftar pegawai yang tersedia"
          );
        }

        const mapped: PegawaiOption[] = result.data.map((item) => ({
          id: Number(item.pegawai_id),
          nama: item.pegawai_nama,
          nip: item.pegawai_nip ?? null,
          jabatan: item.jabatan ?? null,
          skpd: item.skpd ?? null,
        }));

        setPegawaiList(mapped);

        const preferredId =
          typeof result.meta?.currentPegawaiId === "number" &&
          mapped.some((option) => option.id === result.meta?.currentPegawaiId)
            ? String(result.meta.currentPegawaiId)
            : mapped.length > 0
            ? String(mapped[0].id)
            : "";

        setSelectedPegawaiId((previous) => {
          if (
            previous &&
            mapped.some((option) => String(option.id) === String(previous))
          ) {
            return previous;
          }
          return preferredId;
        });
      } catch (error) {
        console.error("Error fetching pegawai list:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Daftar pegawai tidak dapat dimuat";
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
      }
    };

    fetchPegawai();
  }, []);

  // =========================== FETCH LAPORAN ===========================
  const fetchLaporan = useCallback(async () => {
    if (!selectedPegawaiId) {
      setPegawaiInfo(null);
      setLaporanList([]);
      setLampiranList([]);
      setHasFetched(false);
      return;
    }

    try {
      setLoading(true);
      setHasFetched(true);

      const params = new URLSearchParams({
        pegawaiId: selectedPegawaiId,
        tahun: String(selectedYear),
        bulan: String(selectedMonth),
      });

      const response = await fetch(`/api/laporan-kegiatan/cetak?${params}`, {
        cache: "no-store",
      });
      const raw: unknown = await response.json().catch(() => null);
      const result = raw as CetakApiResponse | null;

      if (!response.ok || !result?.success) {
        const message =
          result?.error || result?.message || "Gagal memuat data laporan";
        throw new Error(message);
      }

      const pegawaiPayload = result.data?.pegawai;
      const laporanPayload = result.data?.laporan ?? [];
      const lampiranPayload = result.data?.lampiran ?? [];

      const mappedPegawai: PegawaiOption | null = pegawaiPayload
        ? {
            id: Number(pegawaiPayload.pegawai_id),
            nama: pegawaiPayload.pegawai_nama,
            nip: pegawaiPayload.pegawai_nip ?? null,
            jabatan: pegawaiPayload.jabatan ?? null,
            skpd: pegawaiPayload.skpd ?? null,
          }
        : null;

      setPegawaiInfo(mappedPegawai);
      setLaporanList(laporanPayload);
      setLampiranList(lampiranPayload);

      setSignature((prev) => ({
        ...prev,
        pembuatName: mappedPegawai?.nama ?? "",
        pembuatJabatan: mappedPegawai?.jabatan ?? "",
        pembuatNip: mappedPegawai?.nip ?? "",
      }));

      if (!subtitleDirtyRef.current && mappedPegawai?.skpd) {
        setReportSubtitle(mappedPegawai.skpd.toUpperCase());
      }
    } catch (error) {
      console.error("Error fetching laporan bulanan:", error);
      setPegawaiInfo(null);
      setLaporanList([]);
      setLampiranList([]);

      const message =
        error instanceof Error
          ? error.message
          : "Data laporan tidak dapat dimuat";

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
    } finally {
      setLoading(false);
    }
  }, [selectedPegawaiId, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  // =========================== MEMOIZED DATA ===========================
  const groupedRows = useMemo(() => {
    const grouped = new Map<
      string,
      { tanggal: string; parsedDate: Date | null; items: LaporanItem[] }
    >();

    laporanList.forEach((item) => {
      const parsedDate = parseDateValue(item.tanggal_kegiatan);
      const normalizedKey = parsedDate
        ? parsedDate.toISOString().slice(0, 10)
        : item.tanggal_kegiatan;

      if (!grouped.has(normalizedKey)) {
        grouped.set(normalizedKey, {
          tanggal: item.tanggal_kegiatan,
          parsedDate,
          items: [],
        });
      }

      const bucket = grouped.get(normalizedKey)!;
      bucket.items.push(item);

      if (!bucket.parsedDate && parsedDate) {
        bucket.parsedDate = parsedDate;
      }

      if (!bucket.tanggal && item.tanggal_kegiatan) {
        bucket.tanggal = item.tanggal_kegiatan;
      }
    });

    return Array.from(grouped.values())
      .sort((a, b) => {
        const parsedA = a.parsedDate?.getTime();
        const parsedB = b.parsedDate?.getTime();

        if (typeof parsedA === "number" && typeof parsedB === "number") {
          return parsedA - parsedB;
        }
        if (typeof parsedA === "number") return -1;
        if (typeof parsedB === "number") return 1;

        return a.tanggal.localeCompare(b.tanggal);
      })
      .map((group) => ({
        tanggal: group.tanggal,
        parsedDate: group.parsedDate,
        hari: getDayName(group.parsedDate ?? group.tanggal),
        activities: group.items.map((item) => formatActivity(item)),
      }));
  }, [laporanList]);

  const formattedMonthLabel = useMemo(() => {
    const parsed = new Date(selectedYear, selectedMonth - 1, 1);
    return parsed.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  }, [selectedMonth, selectedYear]);

  // =========================== HANDLERS ===========================
  const handlePrint = useCallback(async () => {
    if (!printTableRef.current) {
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Bagian tabel tidak ditemukan untuk dicetak.",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
      return;
    }

    document.body.classList.add(PRINT_FOCUS_CLASS);

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      window.print();
    } finally {
      setTimeout(() => {
        document.body.classList.remove(PRINT_FOCUS_CLASS);
      }, 0);
    }
  }, []);

  const handleSignatureChange = (
    field: keyof SignatureState,
    value: string
  ) => {
    setSignature((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubtitleChange = (value: string) => {
    subtitleDirtyRef.current = true;
    setReportSubtitle(value);
  };

  // =========================== RENDER ===========================
  return (
    <div className="space-y-6 pb-20">
      {/* Panel kontrol (tidak ikut tercetak) */}
      <div className="print:hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Cetak Laporan Kegiatan Bulanan
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Pilih pegawai serta periode yang ingin dicetak kemudian sesuaikan
          informasi kepala laporan dan kolom tanda tangan sebelum mencetak.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Pegawai
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={selectedPegawaiId}
              onChange={(event) => {
                setSelectedPegawaiId(event.target.value);
                subtitleDirtyRef.current = false;
              }}>
              {pegawaiList.length === 0 && (
                <option value="">Memuat data pegawai...</option>
              )}
              {pegawaiList.map((pegawai) => (
                <option key={pegawai.id} value={pegawai.id}>
                  {pegawai.nama}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Bulan
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(Number(event.target.value))
              }>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Tahun
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Judul Laporan
            <input
              type="text"
              value={reportTitle}
              onChange={(event) => setReportTitle(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Unit / Bidang
            <input
              type="text"
              value={reportSubtitle}
              onChange={(event) => handleSubtitleChange(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
        </div>

        {/* Kolom tanda tangan */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <fieldset className="space-y-3 rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
            <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Pembuat Laporan
            </legend>
            <input
              type="text"
              placeholder="Judul Kolom"
              value={signature.pembuatTitle}
              onChange={(event) =>
                handleSignatureChange("pembuatTitle", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Nama"
              value={signature.pembuatName}
              onChange={(event) =>
                handleSignatureChange("pembuatName", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Jabatan"
              value={signature.pembuatJabatan}
              onChange={(event) =>
                handleSignatureChange("pembuatJabatan", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="NIP"
              value={signature.pembuatNip}
              onChange={(event) =>
                handleSignatureChange("pembuatNip", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </fieldset>

          <fieldset className="space-y-3 rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
            <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Pemeriksa
            </legend>
            <input
              type="text"
              placeholder="Judul Kolom"
              value={signature.pemeriksaTitle}
              onChange={(event) =>
                handleSignatureChange("pemeriksaTitle", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Nama"
              value={signature.pemeriksaName}
              onChange={(event) =>
                handleSignatureChange("pemeriksaName", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Jabatan"
              value={signature.pemeriksaJabatan}
              onChange={(event) =>
                handleSignatureChange("pemeriksaJabatan", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="NIP"
              value={signature.pemeriksaNip}
              onChange={(event) =>
                handleSignatureChange("pemeriksaNip", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </fieldset>

          <fieldset className="space-y-3 rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
            <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Pihak Menyetujui
            </legend>
            <input
              type="text"
              placeholder="Judul Kolom"
              value={signature.approverTitle}
              onChange={(event) =>
                handleSignatureChange("approverTitle", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Nama"
              value={signature.approverName}
              onChange={(event) =>
                handleSignatureChange("approverName", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Jabatan"
              value={signature.approverJabatan}
              onChange={(event) =>
                handleSignatureChange("approverJabatan", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="NIP"
              value={signature.approverNip}
              onChange={(event) =>
                handleSignatureChange("approverNip", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </fieldset>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fetchLaporan}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 ${
              loading
                ? "cursor-wait bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}>
            <Loader2
              className={`h-4 w-4 ${loading ? "animate-spin" : "opacity-0"}`}
            />
            Muat Data
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!laporanList.length}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 ${
              laporanList.length
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}>
            <Printer className="h-4 w-4" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* AREA CETAK */}
      <div
        id={PRINT_CONTAINER_ID}
        ref={printTableRef}
        className="mx-auto max-w-5xl rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-200 print:shadow-none dark:bg-white">
        <div className="space-y-4 text-center">
          <h2 className="text-lg font-semibold tracking-widest text-gray-900">
            {reportTitle.toUpperCase()}
          </h2>
          <h3 className="text-base font-semibold uppercase tracking-wide text-gray-800">
            {reportSubtitle}
          </h3>
        </div>

        <div className="mt-8 grid gap-2 text-sm text-gray-900">
          <p>
            <span className="inline-block w-28 font-semibold">NAMA</span>
            <span>: {pegawaiInfo?.nama || "-"}</span>
          </p>
          <p>
            <span className="inline-block w-28 font-semibold">JABATAN</span>
            <span>: {pegawaiInfo?.jabatan || "-"}</span>
          </p>
          <p>
            <span className="inline-block w-28 font-semibold">BULAN</span>
            <span>: {formattedMonthLabel}</span>
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {/* TABEL UTAMA */}
          <div className="overflow-hidden rounded-lg border border-black">
            <table className="min-w-full border-collapse text-sm text-gray-900 dark:text-gray-100">
              <thead>
                <tr className="bg-gray-100 text-gray-900 dark:text-gray-700">
                  <th className="border-b border-r border-black px-3 py-2 text-center font-semibold">
                    NO
                  </th>
                  <th className="border-b border-r border-black px-3 py-2 text-center font-semibold">
                    HARI
                  </th>
                  <th className="border-b border-r border-black px-3 py-2 text-center font-semibold">
                    TANGGAL
                  </th>
                  <th className="border-b border-black px-3 py-2 text-left font-semibold">
                    URAIAN KEGIATAN
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border-t border-black px-4 py-10 text-center text-sm italic text-gray-500 dark:text-gray-400 empty-state">
                      {hasFetched
                        ? "Belum ada kegiatan pada periode ini"
                        : "Silakan pilih pegawai dan periode kemudian muat data"}
                    </td>
                  </tr>
                ) : (
                  groupedRows.map((row, index) => (
                    <tr key={row.tanggal} className="align-top">
                      <td className="border-t border-r border-black px-3 py-3 text-center dark:text-gray-700">
                        {index + 1}
                      </td>
                      <td className="border-t border-r border-black px-3 py-3 text-center font-semibold dark:text-gray-700">
                        {row.hari}
                      </td>
                      <td className="border-t border-r border-black px-3 py-3 text-center dark:text-gray-700">
                        {formatFullDate(row.parsedDate ?? row.tanggal)}
                      </td>
                      <td className="border-t border-black px-3 py-3 text-sm dark:text-gray-700">
                        <ul className="space-y-2">
                          {row.activities.map((activity, activityIndex) => (
                            <li
                              key={`${row.tanggal}-${activityIndex}`}
                              className="flex items-start gap-3">
                              <span
                                aria-hidden="true"
                                className="mt-1 text-lg leading-none text-current">
                                •
                              </span>
                              <span className="text-justify">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABEL LAMPIRAN */}
          <div className="overflow-hidden rounded-lg border border-black">
            <table className="min-w-full border-collapse text-sm text-gray-900 dark:text-gray-100">
              <thead>
                <tr className="bg-gray-100 text-gray-900 dark:text-gray-700">
                  <th className="border-b border-black px-3 py-2 text-center font-semibold">
                    LAMPIRAN BUKTI (FILE)
                  </th>
                </tr>
              </thead>
              <tbody>
                {lampiranList.length === 0 ? (
                  <tr>
                    <td className="border-t border-black px-4 py-6 text-center text-sm italic text-gray-500 dark:text-gray-400">
                      {hasFetched
                        ? "Tidak ada lampiran bukti kegiatan pada periode ini"
                        : "Lampiran akan ditampilkan setelah data laporan dimuat"}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className="border-t border-black px-4 py-6">
                      <div className="flex flex-wrap items-start justify-start gap-6">
                        {lampiranList.map((lampiran) => {
                          const isImageType = lampiran.tipe_file
                            ?.toLowerCase()
                            .startsWith("image/");
                          const sanitizedPath =
                            lampiran.path_file?.trim() || "";
                          const showImagePreview = Boolean(
                            isImageType && sanitizedPath
                          );

                          return (
                            <div
                              key={`${lampiran.file_id}-${lampiran.laporan_id}`}
                              className="flex w-48 flex-col items-center gap-3 text-center">
                              {showImagePreview ? (
                                <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700">
                                  <img
                                    src={sanitizedPath}
                                    alt={
                                      lampiran.nama_file_asli ||
                                      "Lampiran bukti kegiatan"
                                    }
                                    className="max-h-36 w-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-40 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                  <span className="text-sm font-semibold uppercase tracking-wide">
                                    {formatFileType(lampiran.tipe_file)}
                                  </span>
                                  <span className="wrap-break-word text-[11px] leading-relaxed">
                                    {sanitizedPath ||
                                      "Lokasi file tidak tersedia"}
                                  </span>
                                </div>
                              )}
                              <div className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-600">
                                {lampiran.nama_kegiatan || "-"}
                              </div>
                              <div className="w-full space-y-1 text-[11px] leading-relaxed text-gray-600 dark:text-gray-500">
                                <div className="hidden">
                                  Diunggah:{" "}
                                  {formatDateTime(lampiran.created_at)}
                                </div>
                                {!showImagePreview && (
                                  <div className="pt-1 text-left">
                                    Lokasi:{" "}
                                    <span className="wrap-break-word">
                                      {sanitizedPath || "-"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TANDA TANGAN */}
        <div className="mt-10 grid gap-6 text-sm text-gray-900 md:grid-cols-3">
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-semibold uppercase tracking-wide">
              {signature.pembuatTitle || "PEMBUAT LAPORAN"}
            </span>
            <div className="h-20" aria-hidden="true" />
            <span className="font-semibold underline decoration-1 underline-offset-4">
              {signature.pembuatName ||
                "(........................................)"}
            </span>
            {signature.pembuatJabatan && (
              <span className="mt-1 text-xs uppercase tracking-wide text-gray-600">
                {signature.pembuatJabatan}
              </span>
            )}
            {signature.pembuatNip && (
              <span className="text-xs text-gray-600">
                NIP. {signature.pembuatNip}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-semibold uppercase tracking-wide">
              {signature.pemeriksaTitle || "PEMERIKSA"}
            </span>
            <div className="h-20" aria-hidden="true" />
            <span className="font-semibold underline decoration-1 underline-offset-4">
              {signature.pemeriksaName ||
                "(........................................)"}
            </span>
            {signature.pemeriksaJabatan && (
              <span className="mt-1 text-xs uppercase tracking-wide text-gray-600">
                {signature.pemeriksaJabatan}
              </span>
            )}
            {signature.pemeriksaNip && (
              <span className="text-xs text-gray-600">
                NIP. {signature.pemeriksaNip}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-semibold uppercase tracking-wide">
              {signature.approverTitle || "MENYETUJUI"}
            </span>
            <div className="h-20" aria-hidden="true" />
            <span className="font-semibold underline decoration-1 underline-offset-4">
              {signature.approverName ||
                "(........................................)"}
            </span>
            {signature.approverJabatan && (
              <span className="mt-1 text-xs uppercase tracking-wide text-gray-600">
                {signature.approverJabatan}
              </span>
            )}
            {signature.approverNip && (
              <span className="text-xs text-gray-600">
                NIP. {signature.approverNip}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* STYLE PRINT */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm;
          }

          body {
            background: #fff !important;
            color: #000 !important;
          }

          body.${PRINT_FOCUS_CLASS} * {
            visibility: hidden !important;
          }

          body.${PRINT_FOCUS_CLASS}
            #${PRINT_CONTAINER_ID},
            body.${PRINT_FOCUS_CLASS}
            #${PRINT_CONTAINER_ID}
            * {
            visibility: visible !important;
          }

          body.${PRINT_FOCUS_CLASS} #${PRINT_CONTAINER_ID} {
            position: absolute;
            inset: 0;
            margin-left: 0;
            margin-right: 0;
            padding-left: 10;
            padding-right: 10;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

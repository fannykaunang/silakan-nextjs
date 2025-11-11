// app/(dashboard)/reminder/_client.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlarmClock,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type {
  ReminderDay,
  ReminderListItem,
  ReminderStats,
  ReminderType,
} from "@/lib/types";
import {
  closeLoading,
  showDeleteConfirm,
  showError,
  showLoading,
  showSuccess,
  showToast,
} from "@/lib/utils/sweetalert";

type PegawaiOption = { pegawai_id: number; pegawai_nama: string | null };

type ReminderResponse = {
  success: boolean;
  data?: ReminderListItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: ReminderStats;
  meta?: {
    isAdmin: boolean;
    currentPegawaiId: number | null;
    currentPegawaiName: string | null;
  };
  pegawaiOptions?: PegawaiOption[];
  message?: string;
};

type ReminderFormState = {
  pegawai_id: number | null;
  judul_reminder: string;
  pesan_reminder: string;
  tipe_reminder: ReminderType;
  waktu_reminder: string;
  hari_dalam_minggu: ReminderDay[];
  tanggal_spesifik: string;
  is_active: boolean;
};

type ReminderSubmitPayload = {
  pegawai_id?: number;
  judul_reminder: string;
  pesan_reminder: string;
  tipe_reminder: ReminderType;
  waktu_reminder: string;
  hari_dalam_minggu: ReminderDay[];
  tanggal_spesifik: string | null;
  is_active: boolean;
};

const REMINDER_TYPES: ReminderType[] = [
  "Harian",
  "Mingguan",
  "Bulanan",
  "Sekali",
];

const REMINDER_DAYS: ReminderDay[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const DEFAULT_LIMIT = 10;

const DEFAULT_STATS: ReminderStats = {
  total: 0,
  active: 0,
  harian: 0,
  mingguan: 0,
  bulanan: 0,
};

const defaultFormState: ReminderFormState = {
  pegawai_id: null,
  judul_reminder: "",
  pesan_reminder: "",
  tipe_reminder: "Harian",
  waktu_reminder: "08:00",
  hari_dalam_minggu: [],
  tanggal_spesifik: "",
  is_active: true,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value ?? 0);
}

function formatTime(value: string | null | undefined) {
  if (!value) return "-";
  const [hour, minute] = value.split(":");
  return `${hour ?? "00"}:${minute ?? "00"}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseHariSet(value: string | null | undefined): ReminderDay[] {
  if (!value) return [];
  return value
    .split(",")
    .map((day) => day.trim())
    .filter((day): day is ReminderDay =>
      REMINDER_DAYS.includes(day as ReminderDay)
    );
}

export default function ReminderClient() {
  const [reminders, setReminders] = useState<ReminderListItem[]>([]);
  const [stats, setStats] = useState<ReminderStats>(DEFAULT_STATS);
  const [pegawaiOptions, setPegawaiOptions] = useState<PegawaiOption[]>([]);
  const [meta, setMeta] = useState<{
    isAdmin: boolean;
    currentPegawaiId: number | null;
    currentPegawaiName: string | null;
  }>({ isAdmin: false, currentPegawaiId: null, currentPegawaiName: null });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tipeFilter, setTipeFilter] = useState<ReminderType | "all">("all");
  const [dayFilter, setDayFilter] = useState<ReminderDay | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<ReminderFormState>(defaultFormState);
  const [selectedReminder, setSelectedReminder] =
    useState<ReminderListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, tipeFilter, dayFilter]);

  const fetchReminders = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(DEFAULT_LIMIT));

        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch.trim());
        }

        if (tipeFilter !== "all") {
          params.set("tipe", tipeFilter);
        }

        if (dayFilter !== "all") {
          params.set("day", dayFilter);
        }

        const response = await fetch(`/api/reminder?${params.toString()}`, {
          cache: "no-store",
        });

        const payload: ReminderResponse = await response.json().catch(() => ({
          success: false,
          message: "Respons tidak valid",
        }));

        if (!response.ok || payload.success !== true || !payload.data) {
          throw new Error(payload.message || "Gagal memuat data reminder");
        }

        setReminders(payload.data);
        setStats(payload.stats ?? DEFAULT_STATS);
        setPagination(
          payload.pagination ?? {
            page,
            limit: DEFAULT_LIMIT,
            total: payload.data.length,
            totalPages: 1,
          }
        );
        setMeta(
          payload.meta ?? {
            isAdmin: false,
            currentPegawaiId: null,
            currentPegawaiName: null,
          }
        );
        setPegawaiOptions(payload.pegawaiOptions ?? []);
      } catch (err: any) {
        console.error("Failed to fetch reminders:", err);
        setError(err?.message || "Terjadi kesalahan saat memuat data reminder");
      } finally {
        setLoading(false);
      }
    },
    [dayFilter, debouncedSearch, tipeFilter]
  );

  useEffect(() => {
    fetchReminders(currentPage);
  }, [fetchReminders, currentPage, refreshKey]);

  useEffect(() => {
    if (!meta.currentPegawaiId) {
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const handleReminderEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as {
          reminderId: number;
          title: string;
          message?: string | null;
          tipe: string;
          scheduled_at?: string;
        };

        const scheduledTime = payload.scheduled_at
          ? new Date(payload.scheduled_at)
          : null;

        const formattedTime =
          scheduledTime && !Number.isNaN(scheduledTime.getTime())
            ? scheduledTime.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

        const toastTitle = [
          payload.title,
          formattedTime ? `(${formattedTime} WIB)` : null,
        ]
          .filter(Boolean)
          .join(" ");

        const toastMessage = payload.message
          ? [toastTitle, payload.message].filter(Boolean).join(" • ")
          : toastTitle || "Pengingat baru";

        showToast("info", toastMessage);
      } catch (error) {
        console.error("Failed to parse reminder notification:", error);
      }
    };

    const handleErrorEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as { message?: string };
        if (payload?.message) {
          console.warn("SSE reminder warning:", payload.message);
        }
      } catch (error) {
        console.error("Failed to parse reminder SSE error payload:", error);
      }
    };

    const connect = () => {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource("/api/reminder/events");
      eventSource.addEventListener("reminder", handleReminderEvent);
      eventSource.addEventListener("notify-error", handleErrorEvent);
      eventSource.onerror = () => {
        eventSource?.close();
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }
        reconnectTimer = setTimeout(() => {
          connect();
        }, 5000);
      };
    };

    connect();

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      eventSource?.removeEventListener("reminder", handleReminderEvent);
      eventSource?.removeEventListener("notify-error", handleErrorEvent);
      eventSource?.close();
    };
  }, [meta.currentPegawaiId]);

  const canManageReminder = useCallback(
    (reminder: ReminderListItem) => {
      if (meta.isAdmin) return true;
      if (!meta.currentPegawaiId) return false;
      return reminder.pegawai_id === meta.currentPegawaiId;
    },
    [meta.currentPegawaiId, meta.isAdmin]
  );

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        searchValue.trim() !== "" || tipeFilter !== "all" || dayFilter !== "all"
      ),
    [dayFilter, searchValue, tipeFilter]
  );

  const handleResetFilters = () => {
    setSearchValue("");
    setTipeFilter("all");
    setDayFilter("all");
    setRefreshKey((prev) => prev + 1);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedReminder(null);
    setFormData((prev) => ({
      ...defaultFormState,
      pegawai_id: meta.isAdmin ? null : meta.currentPegawaiId,
    }));
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (reminder: ReminderListItem) => {
    setModalMode("edit");
    setSelectedReminder(reminder);
    setFormData({
      pegawai_id: reminder.pegawai_id,
      judul_reminder: reminder.judul_reminder,
      pesan_reminder: reminder.pesan_reminder ?? "",
      tipe_reminder: reminder.tipe_reminder,
      waktu_reminder: formatTime(reminder.waktu_reminder),
      hari_dalam_minggu: parseHariSet(reminder.hari_dalam_minggu),
      tanggal_spesifik: reminder.tanggal_spesifik ?? "",
      is_active: reminder.is_active === 1,
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReminder(null);
    setActionError(null);
    setSubmitting(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    const targetPegawaiId = meta.isAdmin
      ? formData.pegawai_id
      : meta.currentPegawaiId;

    if (!targetPegawaiId) {
      setActionError("Pegawai tujuan reminder tidak valid");
      return;
    }

    if (
      formData.tipe_reminder === "Mingguan" &&
      formData.hari_dalam_minggu.length === 0
    ) {
      setActionError("Pilih minimal satu hari untuk reminder mingguan");
      return;
    }

    if (formData.tipe_reminder === "Sekali" && !formData.tanggal_spesifik) {
      setActionError("Tanggal wajib diisi untuk reminder sekali");
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      showLoading("Menyimpan reminder...");

      const payload: ReminderSubmitPayload = {
        judul_reminder: formData.judul_reminder,
        pesan_reminder: formData.pesan_reminder,
        tipe_reminder: formData.tipe_reminder,
        waktu_reminder: formData.waktu_reminder,
        hari_dalam_minggu:
          formData.tipe_reminder === "Mingguan"
            ? formData.hari_dalam_minggu
            : [],
        tanggal_spesifik:
          formData.tipe_reminder === "Sekali"
            ? formData.tanggal_spesifik
            : null,
        is_active: formData.is_active,
      };

      if (meta.isAdmin && typeof targetPegawaiId === "number") {
        payload.pegawai_id = targetPegawaiId;
      }

      const endpoint =
        modalMode === "edit" && selectedReminder
          ? `/api/reminder/${selectedReminder.reminder_id}`
          : "/api/reminder";

      const response = await fetch(endpoint, {
        method: modalMode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({ success: false }));

      closeLoading();

      if (!response.ok || result.success !== true) {
        const message = result?.message || "Gagal menyimpan reminder";
        setActionError(message);
        return;
      }

      showSuccess("Berhasil", "Reminder berhasil disimpan", 1500);
      closeModal();
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      console.error("Failed to submit reminder:", err);
      closeLoading();
      setActionError(err?.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reminder: ReminderListItem) => {
    if (!(await showDeleteConfirm(reminder.judul_reminder))) {
      return;
    }

    try {
      showLoading("Menghapus reminder...");
      const response = await fetch(`/api/reminder/${reminder.reminder_id}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => ({ success: false }));
      closeLoading();

      if (!response.ok || payload.success !== true) {
        throw new Error(payload?.message || "Gagal menghapus reminder");
      }

      showSuccess("Berhasil", "Reminder berhasil dihapus", 1500);
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      closeLoading();
      console.error("Failed to delete reminder:", err);
      showError(
        "Gagal",
        err?.message || "Terjadi kesalahan saat menghapus reminder"
      );
    }
  };

  const statCards = useMemo(
    () => [
      {
        title: "Total Reminder",
        value: formatNumber(stats.total),
        description: "Jumlah seluruh reminder yang tersedia.",
        icon: BellRing,
        color: "bg-gradient-to-br from-blue-500 to-blue-600",
      },
      {
        title: "Reminder Aktif",
        value: formatNumber(stats.active),
        description: "Reminder yang masih aktif dan berjalan.",
        icon: CheckCircle2,
        color: "bg-gradient-to-br from-green-500 to-emerald-600",
      },
      {
        title: "Tipe Mingguan",
        value: formatNumber(stats.mingguan),
        description: "Reminder berulang mingguan yang terjadwal.",
        icon: CalendarClock,
        color: "bg-gradient-to-br from-amber-500 to-orange-600",
      },
      {
        title: "Tipe Harian",
        value: formatNumber(stats.harian),
        description: "Reminder harian untuk aktivitas rutin.",
        icon: AlarmClock,
        color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      },
    ],
    [stats]
  );

  if (loading && reminders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Memuat data...
          </p>
        </div>
      </div>
    );
  }

  const totalStart = (pagination.page - 1) * pagination.limit + 1;
  const isMingguan = formData.tipe_reminder === "Mingguan";
  const isSekali = formData.tipe_reminder === "Sekali";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Manajemen Reminder Kegiatan
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
              Kelola pengingat kegiatan harian, mingguan, dan khusus untuk
              memastikan aktivitas berjalan sesuai jadwal. Otomatis dikirim ke
              nomor WhatsApp Anda.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur">
            <AlarmClock className="h-5 w-5" />
            <div>
              <p className="font-semibold">Pengingat Terkelola</p>
              <p className="text-xs text-blue-100">
                {formatNumber(stats.total)} reminder tercatat dalam sistem
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {card.description}
                </p>
              </div>
              <div className={`rounded-lg p-3 text-white ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Cari judul reminder"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </div>
              <select
                value={tipeFilter}
                onChange={(event) =>
                  setTipeFilter(
                    (event.target.value as ReminderType | "all") || "all"
                  )
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:w-48">
                <option value="all">Semua Tipe</option>
                {REMINDER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={dayFilter}
                onChange={(event) =>
                  setDayFilter(
                    (event.target.value as ReminderDay | "all") || "all"
                  )
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:w-48">
                <option value="all">Semua Hari</option>
                {REMINDER_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={openCreateModal}
              className="px-6 py-2 pl-9 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Tambah Reminder
            </button>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <X className="w-4 h-4" />
              Reset Filter
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                No
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Judul Reminder
              </th>
              {meta.isAdmin && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Pegawai
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tipe
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Jadwal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {loading ? (
              <tr>
                <td
                  colSpan={meta.isAdmin ? 7 : 6}
                  className="px-4 py-10 text-center text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat reminder...
                  </div>
                </td>
              </tr>
            ) : reminders.length === 0 ? (
              <tr>
                <td
                  colSpan={meta.isAdmin ? 7 : 6}
                  className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Belum ada data reminder.
                </td>
              </tr>
            ) : (
              reminders.map((reminder, index) => {
                const hariSet = parseHariSet(reminder.hari_dalam_minggu);
                const scheduleLabel = (() => {
                  if (reminder.tipe_reminder === "Sekali") {
                    return formatDate(reminder.tanggal_spesifik);
                  }
                  if (reminder.tipe_reminder === "Mingguan") {
                    return hariSet.length > 0 ? hariSet.join(", ") : "-";
                  }
                  if (reminder.tipe_reminder === "Harian") {
                    return "Setiap hari";
                  }
                  return reminder.tanggal_spesifik
                    ? formatDate(reminder.tanggal_spesifik)
                    : "Setiap bulan";
                })();

                return (
                  <tr
                    key={reminder.reminder_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {totalStart + index}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                      <p>{reminder.judul_reminder}</p>
                      {reminder.pesan_reminder && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {reminder.pesan_reminder}
                        </p>
                      )}
                    </td>
                    {meta.isAdmin && (
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {reminder.pegawai_nama ?? "-"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {reminder.tipe_reminder}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          {formatTime(reminder.waktu_reminder)} WIB
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {scheduleLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          reminder.is_active === 1
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-600"
                        }`}>
                        {reminder.is_active === 1 ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {canManageReminder(reminder) && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(reminder)}
                              className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
                              <Edit2 className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(reminder)}
                              className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30">
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                              Hapus
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 md:flex-row">
        <div>
          Menampilkan {reminders.length} dari {formatNumber(pagination.total)}{" "}
          reminder
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={pagination.page <= 1 || loading}
            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Sebelumnya
          </button>
          <span>
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, pagination.totalPages)
              )
            }
            disabled={pagination.page >= pagination.totalPages || loading}
            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
            Selanjutnya
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {modalMode === "create" ? "Tambah Reminder" : "Edit Reminder"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {modalMode === "create"
                    ? "Lengkapi informasi reminder baru."
                    : "Perbarui informasi reminder."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {meta.isAdmin && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pegawai
                  </label>
                  <select
                    value={formData.pegawai_id ?? ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        pegawai_id: Number(event.target.value) || null,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    <option value="">Pilih Pegawai</option>
                    {pegawaiOptions.map((option) => (
                      <option key={option.pegawai_id} value={option.pegawai_id}>
                        {option.pegawai_nama ?? `Pegawai ${option.pegawai_id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!meta.isAdmin && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pegawai
                  </label>
                  <input
                    type="text"
                    disabled
                    value={meta.currentPegawaiName ?? "Pegawai"}
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Judul Reminder
                </label>
                <input
                  type="text"
                  value={formData.judul_reminder}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      judul_reminder: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Masukkan judul reminder"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pesan Reminder
                </label>
                <textarea
                  value={formData.pesan_reminder}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      pesan_reminder: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Masukkan pesan atau instruksi reminder"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipe Reminder
                  </label>
                  <select
                    value={formData.tipe_reminder}
                    onChange={(event) => {
                      const tipe = event.target.value as ReminderType;
                      setFormData((prev) => ({
                        ...prev,
                        tipe_reminder: tipe,
                        hari_dalam_minggu:
                          tipe === "Mingguan" ? prev.hari_dalam_minggu : [],
                        tanggal_spesifik:
                          tipe === "Sekali" ? prev.tanggal_spesifik : "",
                      }));
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    {REMINDER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Waktu Reminder
                  </label>
                  <input
                    type="time"
                    value={formData.waktu_reminder}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        waktu_reminder: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              {isMingguan && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pilih Hari
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {REMINDER_DAYS.map((day) => {
                      const checked = formData.hari_dalam_minggu.includes(day);
                      return (
                        <label
                          key={day}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                            checked
                              ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-200"
                              : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                          }`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              const next = event.target.checked
                                ? [...formData.hari_dalam_minggu, day]
                                : formData.hari_dalam_minggu.filter(
                                    (item) => item !== day
                                  );
                              setFormData((prev) => ({
                                ...prev,
                                hari_dalam_minggu: next,
                              }));
                            }}
                            className="h-4 w-4"
                          />
                          {day}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {isSekali && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tanggal Reminder
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal_spesifik}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        tanggal_spesifik: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">
                    Status Reminder
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Nonaktifkan jika reminder tidak ingin dikirim sementara
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: event.target.checked,
                      }))
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                </label>
              </div>

              {actionError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300">
                  {actionError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-70">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modalMode === "create" ? "Simpan" : "Perbarui"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

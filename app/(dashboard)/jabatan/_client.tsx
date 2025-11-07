// app/(dashboard)/jabatan/_client.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  closeLoading,
  showDeleteConfirm,
  showError,
  showLoading,
  showSuccess,
} from "@/lib/utils/sweetalert";

import type { Jabatan, JenisJabatan } from "@/lib/types";

type PaginationMeta = {
  limit: number;
  total: number;
  totalPages: number;
};

type SessionInfo = {
  level: number | null;
};

const ITEMS_PER_PAGE = 10;
const JENIS_OPTIONS: JenisJabatan[] = ["ASN", "Honorer"];

export default function JabatanClient() {
  const [jabatan, setJabatan] = useState<Jabatan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState<"all" | JenisJabatan>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfo>({ level: null });
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<{
    nama_jabatan: string;
    jenis_jabatan: JenisJabatan;
  }>({ nama_jabatan: "", jenis_jabatan: "ASN" });
  const [selectedJabatan, setSelectedJabatan] = useState<Jabatan | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canManage = useMemo(() => session.level === 3, [session.level]);

  const fetchJabatan = useCallback(
    async (page: number, search: string, jenis: "all" | JenisJabatan) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(ITEMS_PER_PAGE));

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (jenis !== "all") {
          params.set("jenis", jenis);
        }

        const response = await fetch(`/api/jabatan?${params.toString()}`, {
          cache: "no-store",
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || payload?.success !== true) {
          throw new Error(payload?.message || "Gagal memuat daftar jabatan");
        }

        setJabatan(payload.data || []);
        const paginationPayload = payload.pagination || {};
        const totalPages = paginationPayload.totalPages || 1;
        setPagination({
          limit: paginationPayload.limit || ITEMS_PER_PAGE,
          total: paginationPayload.total || 0,
          totalPages,
        });

        const requestedPage = paginationPayload.page || page || 1;
        const resolvedPage = Math.min(Math.max(requestedPage, 1), totalPages);
        setCurrentPage(resolvedPage);
      } catch (err: any) {
        console.error("Failed to fetch jabatan:", err);
        setError(err?.message || "Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 400);

    return () => clearTimeout(handle);
  }, [searchValue]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/login", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || payload?.result !== 1) {
          setError(
            payload?.response ||
              payload?.message ||
              "Gagal memuat informasi sesi pengguna"
          );
          setSessionLoaded(true);
          return;
        }

        setSession({ level: payload.level ?? null });
      } catch (err: any) {
        console.error("Failed to fetch session info:", err);
        setError("Tidak dapat memuat informasi sesi pengguna");
      } finally {
        setSessionLoaded(true);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;

    if (!canManage) {
      setLoading(false);
      setError("Hanya admin yang dapat mengakses daftar jabatan");
      return;
    }

    fetchJabatan(currentPage, debouncedSearch, jenisFilter);
  }, [
    sessionLoaded,
    canManage,
    currentPage,
    debouncedSearch,
    jenisFilter,
    refreshKey,
    fetchJabatan,
  ]);

  useEffect(() => {
    if (!sessionLoaded || !canManage) return;
    setCurrentPage(1);
  }, [debouncedSearch, jenisFilter, sessionLoaded, canManage]);

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ nama_jabatan: "", jenis_jabatan: "ASN" });
    setSelectedJabatan(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (jabatanData: Jabatan) => {
    setModalMode("edit");
    setSelectedJabatan(jabatanData);
    setFormData({
      nama_jabatan: jabatanData.nama_jabatan ?? "",
      jenis_jabatan: (jabatanData.jenis_jabatan as JenisJabatan) || "ASN",
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJabatan(null);
    setActionError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.nama_jabatan.trim()) {
      setActionError("Nama jabatan wajib diisi");
      return;
    }

    const payload = {
      nama_jabatan: formData.nama_jabatan.trim(),
      jenis_jabatan: formData.jenis_jabatan,
    };

    try {
      showLoading(modalMode === "create" ? "Menambahkan..." : "Menyimpan...");

      const response = await fetch(
        modalMode === "create"
          ? "/api/jabatan"
          : `/api/jabatan/${selectedJabatan?.jabatan_id}`,
        {
          method: modalMode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => ({}));

      closeLoading();

      if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || "Operasi gagal");
      }

      showSuccess(
        modalMode === "create"
          ? "Jabatan berhasil ditambahkan"
          : "Jabatan berhasil diperbarui"
      );

      closeModal();
      if (modalMode === "create") {
        setCurrentPage(1);
      }
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      closeLoading();
      console.error("Failed to submit jabatan:", err);
      showError("Gagal", err?.message || "Operasi gagal");
    }
  };

  const handleDelete = async (jabatanData: Jabatan) => {
    const confirmed = await showDeleteConfirm(
      jabatanData.nama_jabatan || "jabatan"
    );

    if (!confirmed) return;

    try {
      showLoading("Menghapus jabatan...");
      const response = await fetch(`/api/jabatan/${jabatanData.jabatan_id}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => ({}));

      closeLoading();

      if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || "Gagal menghapus jabatan");
      }

      showSuccess("Jabatan berhasil dihapus");

      const nextPage =
        jabatan.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;

      setCurrentPage(nextPage);
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      closeLoading();
      console.error("Failed to delete jabatan:", err);
      showError("Gagal", err?.message || "Gagal menghapus jabatan");
    }
  };

  const hasData = pagination.total > 0;
  const totalStart = hasData ? (currentPage - 1) * pagination.limit + 1 : 0;
  const totalEnd = hasData
    ? Math.min(currentPage * pagination.limit, pagination.total)
    : 0;

  if (loading && jabatan.length === 0) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Daftar Jabatan
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Kelola data jabatan dan jenisnya.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg cursor-pointer">
              <Plus className="h-4 w-4" />
              Tambah Jabatan
            </button>
          </div>
        </div>
      </div>

      {!canManage ? (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            {error || "Anda tidak memiliki akses untuk melihat halaman ini."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Cari nama jabatan"
                  className="w-full py-2 pl-9 pr-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <select
                value={jenisFilter}
                onChange={(event) =>
                  setJenisFilter(event.target.value as "all" | JenisJabatan)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:w-48">
                <option value="all">Semua Jenis</option>
                {JENIS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && !loading && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nama Jabatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Jenis Jabatan
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-gray-500">
                      Memuat data jabatan...
                    </td>
                  </tr>
                ) : jabatan.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-gray-500">
                      Tidak ada data jabatan.
                    </td>
                  </tr>
                ) : (
                  jabatan.map((item, index) => (
                    <tr
                      key={item.jabatan_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">
                        {totalStart + index}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {item.nama_jabatan || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {item.jenis_jabatan || "-"}
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer">
                            <Edit2 className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-700/20 cursor-pointer">
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row">
            <div className="text-gray-600 dark:text-gray-300">
              {pagination.total > 0 ? (
                <span>
                  Menampilkan {totalStart} - {totalEnd} dari {pagination.total}{" "}
                  jabatan
                </span>
              ) : (
                <span>Tidak ada data untuk ditampilkan</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1 || loading}
                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Sebelumnya
              </button>
              <span className="text-gray-500 dark:text-gray-400">
                Halaman {currentPage} dari {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, pagination.totalPages)
                  )
                }
                disabled={currentPage >= pagination.totalPages || loading}
                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
                Selanjutnya
                <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {modalMode === "create" ? "Tambah Jabatan" : "Edit Jabatan"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {modalMode === "create"
                    ? "Lengkapi informasi jabatan baru."
                    : "Perbarui informasi jabatan."}
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
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Jabatan
                </label>
                <input
                  type="text"
                  value={formData.nama_jabatan}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      nama_jabatan: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Masukkan nama jabatan"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jenis Jabatan
                </label>
                <select
                  value={formData.jenis_jabatan}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      jenis_jabatan: event.target.value as JenisJabatan,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                  {JENIS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {actionError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{actionError}</span>
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
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
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

// app/(dashboard)/dashboard/pegawai/_client.tsx
"use client";

import { useCsrfToken } from "@/hooks/useCsrfToken";
import { useState, useEffect } from "react";
import {
  showError,
  showLoading,
  closeLoading,
  showToast,
} from "@/lib/utils/sweetalert";
import {
  Users,
  Search,
  Edit2,
  Trash2,
  FileText,
  X,
  Save,
  AlertCircle,
  User,
  Phone,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface PegawaiData {
  pegawai_id: number;
  pegawai_pin: string;
  pegawai_nip: string;
  pegawai_nama: string;
  tempat_lahir: string;
  tgl_lahir: string;
  gender: number;
  pegawai_telp: string;
  pegawai_privilege: string;
  pegawai_status: number;
  jabatan: string;
  skpdid: number | null;
  skpd: string;
  sotk: string;
  photo_path: string;
}

export default function PegawaiClient() {
  const [pegawaiList, setPegawaiList] = useState<PegawaiData[]>([]);
  const [filteredList, setFilteredList] = useState<PegawaiData[]>([]);
  const [isFetching, setIsFetching] = useState(true); // ✅ Rename dari 'loading'
  const [isSaving, setIsSaving] = useState(false); // ✅ Tambahan untuk save state
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiData | null>(
    null
  );
  const [editedData, setEditedData] = useState<PegawaiData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [userLevel, setUserLevel] = useState<number | null>(null);
  const [userSkpdid, setUserSkpdid] = useState<number | null>(null);

  // ✅ Destructure dengan nama yang jelas
  const {
    csrfToken,
    isLoading: isTokenLoading,
    isReady: isTokenReady,
    error: tokenError,
    refetch: refetchToken,
  } = useCsrfToken();

  // Fetch data pegawai
  useEffect(() => {
    //fetchPegawaiList();
    const initialize = async () => {
      const session = await fetchSessionInfo();

      if (!session) {
        setIsFetching(false);
        return;
      }

      await fetchPegawaiList(session);
    };

    initialize();
  }, []);

  // Filter berdasarkan search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredList(pegawaiList);
    } else {
      const filtered = pegawaiList.filter(
        (pegawai) =>
          pegawai.pegawai_nama
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          pegawai.pegawai_nip
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          pegawai.jabatan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pegawai.skpd?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredList(filtered);
      setCurrentPage(1);
    }
  }, [searchQuery, pegawaiList]);

  const fetchSessionInfo = async (): Promise<{
    level: number | null;
    skpdid: number | null;
  } | null> => {
    try {
      const response = await fetch("/api/login", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.result !== 1) {
        const message =
          result?.response ||
          result?.message ||
          "Gagal mengambil informasi sesi pengguna";
        setError(message);
        return null;
      }

      const parsedLevel = Number(result.level);
      const normalizedLevel = Number.isNaN(parsedLevel) ? null : parsedLevel;

      const parsedSkpdidRaw =
        result.skpdid === null || result.skpdid === undefined
          ? null
          : Number(result.skpdid);
      let normalizedSkpdid: number | null = null;
      if (parsedSkpdidRaw !== null && !Number.isNaN(parsedSkpdidRaw)) {
        normalizedSkpdid = parsedSkpdidRaw;
      }

      setUserLevel(normalizedLevel);
      setUserSkpdid(normalizedSkpdid);
      setError(null);

      return { level: normalizedLevel, skpdid: normalizedSkpdid };
    } catch (err: any) {
      console.error("Error fetching session info:", err);
      setError(
        err?.message || "Terjadi kesalahan saat memuat informasi sesi pengguna"
      );
      return null;
    }
  };

  const fetchPegawaiList = async (sessionInfo?: {
    level: number | null;
    skpdid: number | null;
  }) => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await fetch("/api/pegawai", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memuat data pegawai");
      }

      //setPegawaiList(result.data);
      //setFilteredList(result.data);

      const rawData = Array.isArray(result.data) ? result.data : [];

      const normalizedData: PegawaiData[] = rawData.map((pegawai: any) => ({
        ...pegawai,
        skpdid:
          pegawai?.skpdid === null || pegawai?.skpdid === undefined
            ? null
            : Number(pegawai.skpdid),
      }));

      const effectiveLevel = sessionInfo?.level ?? userLevel ?? null;
      const effectiveSkpdid = sessionInfo?.skpdid ?? userSkpdid ?? null;

      const finalData =
        effectiveLevel === 2 && typeof effectiveSkpdid === "number"
          ? normalizedData.filter(
              (pegawai) => pegawai.skpdid === effectiveSkpdid
            )
          : normalizedData;

      setPegawaiList(finalData);
      setFilteredList(finalData);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Error fetching pegawai:", err);
      setError(err?.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setIsFetching(false);
    }
  };

  const handleEdit = (pegawai: PegawaiData) => {
    setSelectedPegawai(pegawai);
    setEditedData({ ...pegawai });
    setIsEditModalOpen(true);
  };

  const handleDelete = (pegawai: PegawaiData) => {
    setSelectedPegawai(pegawai);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editedData) return;

    // ✅ Validasi CSRF token lebih baik
    if (!isTokenReady) {
      showError(
        "Error!",
        "Token keamanan belum siap. Silakan tunggu sebentar."
      );
      return;
    }

    if (!csrfToken) {
      showError(
        "Error!",
        "Token keamanan tidak tersedia. Silakan refresh halaman."
      );
      return;
    }

    setIsSaving(true);

    try {
      showLoading("Menyimpan...", "Mohon tunggu sebentar");

      const response = await fetch("/api/pegawai", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(editedData),
      });

      const result = await response.json();

      closeLoading();

      if (response.ok && result.success) {
        showToast("success", "Data pegawai berhasil diperbarui!");
        setIsEditModalOpen(false);
        fetchPegawaiList();
      } else {
        // ✅ Handle 403 CSRF error
        if (response.status === 403) {
          showError(
            "Token Tidak Valid!",
            "Token keamanan tidak valid. Silakan refresh halaman."
          );
          await refetchToken();
        } else {
          throw new Error(result.message || "Gagal memperbarui data");
        }
      }
    } catch (error: any) {
      console.error("Error updating pegawai:", error);
      showError(
        "Gagal!",
        error.message || "Terjadi kesalahan saat menyimpan data"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPegawai) return;

    // ✅ Validasi CSRF token
    if (!isTokenReady) {
      showError(
        "Error!",
        "Token keamanan belum siap. Silakan tunggu sebentar."
      );
      return;
    }

    if (!csrfToken) {
      showError(
        "Error!",
        "Token keamanan tidak tersedia. Silakan refresh halaman."
      );
      return;
    }

    setIsSaving(true);

    try {
      showLoading("Menghapus...", "Mohon tunggu sebentar");

      const response = await fetch(
        `/api/pegawai?id=${selectedPegawai.pegawai_id}`,
        {
          method: "DELETE",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          credentials: "include",
        }
      );

      const result = await response.json();
      closeLoading();

      if (response.ok && result.success) {
        showToast("success", "Data pegawai berhasil dihapus!");
        setIsDeleteModalOpen(false);
        fetchPegawaiList();
      } else {
        // ✅ Handle 403 CSRF error
        if (response.status === 403) {
          showError(
            "Token Tidak Valid!",
            "Token keamanan tidak valid. Silakan refresh halaman."
          );
          await refetchToken();
        } else {
          showError(
            "Gagal!",
            result.error || result.message || "Gagal menghapus data"
          );
        }
        setIsDeleteModalOpen(false);
      }
    } catch (error: any) {
      console.error("Error deleting pegawai:", error);
      closeLoading();
      showError(
        "Error!",
        error.message || "Terjadi kesalahan saat menghapus data"
      );
      setIsDeleteModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof PegawaiData, value: any) => {
    if (!editedData) return;
    setEditedData({ ...editedData, [field]: value });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const getPrivilegeName = (privilege: string) => {
    const privileges: { [key: string]: string } = {
      "-1": "Invalid",
      "0": "User",
      "1": "Operator",
      "2": "Sub Admin",
      "3": "Admin",
    };
    return privileges[privilege] || "Unknown";
  };

  const getPrivilegeColor = (privilege: string) => {
    const colors: { [key: string]: string } = {
      "-1": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "0": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      "1": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "2": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "3": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return colors[privilege] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Aktif
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        Non-aktif
      </span>
    );
  };

  const isAdminUser = userLevel !== null && userLevel >= 3;

  // ✅ Loading state - hanya check fetching, bukan token loading
  if (isFetching && pegawaiList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Memuat data pegawai...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Error state - show token error
  if ((error || tokenError) && pegawaiList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            {error || tokenError}
          </p>
          <div className="flex gap-3 justify-center mt-4">
            {/* <button
              onClick={fetchPegawaiList}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Coba Lagi
            </button> */}
            {tokenError && (
              <button
                onClick={refetchToken}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                Refresh Token
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Daftar Pegawai
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola data pegawai di sistem
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Pegawai
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {pegawaiList.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pegawai Aktif
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {pegawaiList.filter((p) => p.pegawai_status === 1).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hasil Pencarian
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {filteredList.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari pegawai (nama, NIP, jabatan, SKPD)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Foto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Pegawai
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    NIP/PIN
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    SKPD
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
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
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold">
                        Tidak ada data pegawai
                      </p>
                      <p className="text-sm mt-1">
                        {searchQuery
                          ? "Coba ubah kata kunci pencarian"
                          : "Belum ada pegawai terdaftar"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((pegawai) => (
                    <tr
                      key={pegawai.pegawai_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4">
                        <img
                          src={
                            pegawai.photo_path
                              ? `https://entago.merauke.go.id/${pegawai.photo_path}`
                              : `https://api.dicebear.com/7.x/avataaars/svg?seed=${pegawai.pegawai_nama}`
                          }
                          alt={pegawai.pegawai_nama}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${pegawai.pegawai_nama}`;
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/pegawai/${pegawai.pegawai_id}`}
                            className="font-semibold text-gray-600 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer">
                            {pegawai.pegawai_nama}
                          </Link>
                          {pegawai.pegawai_telp && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" />
                              {pegawai.pegawai_telp}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {pegawai.pegawai_nip}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            PIN: {pegawai.pegawai_pin}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {pegawai.jabatan}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                            {pegawai.skpd}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getPrivilegeColor(
                            pegawai.pegawai_privilege
                          )}`}>
                          {getPrivilegeName(pegawai.pegawai_privilege)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(pegawai.pegawai_status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/laporan-kegiatan/pegawai/${pegawai.pegawai_id}`}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900 rounded-lg transition"
                            title="Lihat laporan">
                            <FileText className="w-4 h-4" />
                          </Link>
                          {isAdminUser && (
                            <>
                              <button
                                onClick={() => handleEdit(pegawai)}
                                disabled={!isTokenReady}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title={
                                  isTokenReady ? "Edit" : "Token belum siap"
                                }>
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(pegawai)}
                                disabled={!isTokenReady}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title={
                                  isTokenReady ? "Hapus" : "Token belum siap"
                                }>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Menampilkan {indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, filteredList.length)} dari{" "}
                {filteredList.length} data
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
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
                    )
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && editedData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Edit Data Pegawai
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={editedData.pegawai_nama ?? ""}
                      onChange={(e) =>
                        handleInputChange("pegawai_nama", e.target.value)
                      }
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      NIP
                    </label>
                    <input
                      type="text"
                      value={editedData.pegawai_nip ?? ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      PIN
                    </label>
                    <input
                      type="text"
                      value={editedData.pegawai_pin ?? ""}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={editedData.pegawai_telp ?? ""}
                      onChange={(e) =>
                        handleInputChange("pegawai_telp", e.target.value)
                      }
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      value={editedData.tempat_lahir ?? ""}
                      onChange={(e) =>
                        handleInputChange("tempat_lahir", e.target.value)
                      }
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Lahir
                    </label>
                    <input
                      type="text"
                      value={editedData.tgl_lahir ?? ""}
                      onChange={(e) =>
                        handleInputChange("tgl_lahir", e.target.value)
                      }
                      placeholder="DD/MM/YYYY"
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jenis Kelamin
                    </label>
                    <select
                      value={editedData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", parseInt(e.target.value))
                      }
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <option value={1}>Laki-laki</option>
                      <option value={2}>Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={editedData.pegawai_status}
                      onChange={(e) =>
                        handleInputChange(
                          "pegawai_status",
                          parseInt(e.target.value)
                        )
                      }
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <option value={1}>Aktif</option>
                      <option value={0}>Non-aktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={editedData.jabatan ?? ""}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKPD
                  </label>
                  <input
                    type="text"
                    value={editedData.skpd ?? ""}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !isTokenReady}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
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
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && selectedPegawai && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                  Hapus Data Pegawai?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  Apakah Anda yakin ingin menghapus data{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPegawai.pegawai_nama}
                  </span>
                  ? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isSaving}
                    className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isSaving || !isTokenReady}
                    className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
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
                        <span>Menghapus...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

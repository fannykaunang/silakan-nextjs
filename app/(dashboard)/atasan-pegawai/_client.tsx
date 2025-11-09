// app/(dashboard)/atasan-pegawai/_client.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
  showToast,
} from "@/lib/utils/sweetalert";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";

interface PegawaiData {
  pegawai_id: number;
  nama_lengkap?: string;
  pegawai_nama?: string;
  nama?: string;
  nip?: string;
}

interface AtasanPegawaiData {
  id: number;
  pegawai_id: number;
  pegawai_nama?: string;
  atasan_id: number;
  atasan_nama?: string;
  jenis_atasan: "Langsung" | "Tidak Langsung" | "PLT" | "PLH";
  is_active: number;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
}

export default function AtasanPegawaiClient() {
  const [atasanPegawai, setAtasanPegawai] = useState<AtasanPegawaiData[]>([]);
  const [filteredData, setFilteredData] = useState<AtasanPegawaiData[]>([]);
  const [pegawaiList, setPegawaiList] = useState<PegawaiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenisAtasan, setFilterJenisAtasan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<AtasanPegawaiData>>({});

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<AtasanPegawaiData>>({
    pegawai_id: 0,
    atasan_id: 0,
    jenis_atasan: "Langsung",
    is_active: 1,
    tanggal_mulai: "",
    tanggal_selesai: null,
    keterangan: "",
  });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AtasanPegawaiData | null>(
    null
  );

  useEffect(() => {
    fetchPegawai();
    fetchAtasanPegawai();
  }, []);

  useEffect(() => {
    let filtered = [...atasanPegawai];

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.pegawai_nama
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.atasan_nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.keterangan?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by jenis atasan
    if (filterJenisAtasan !== "all") {
      filtered = filtered.filter(
        (item) => item.jenis_atasan === filterJenisAtasan
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      const status = filterStatus === "active" ? 1 : 0;
      filtered = filtered.filter((item) => item.is_active === status);
    }

    setFilteredData(filtered);
  }, [searchQuery, filterJenisAtasan, filterStatus, atasanPegawai]);

  const fetchPegawai = async () => {
    try {
      const response = await fetch("/api/pegawai");
      const result = await response.json();

      if (response.ok && result.success) {
        setPegawaiList(result.data);
        console.log("Pegawai data sample:", result.data[0]); // Debug: lihat struktur data
      }
    } catch (err) {
      console.error("Error fetching pegawai:", err);
    }
  };

  // Helper function untuk mendapatkan nama pegawai dari berbagai kemungkinan field
  const getPegawaiNama = (pegawai: PegawaiData): string => {
    return (
      pegawai.nama_lengkap ||
      pegawai.pegawai_nama ||
      pegawai.nama ||
      `Pegawai #${pegawai.pegawai_id}`
    );
  };

  const fetchAtasanPegawai = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/atasan-pegawai");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memuat data atasan pegawai");
      }

      setAtasanPegawai(result.data);
      setFilteredData(result.data);
    } catch (err: any) {
      console.error("Error fetching atasan pegawai:", err);
      setError(err?.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.pegawai_id ||
      !formData.atasan_id ||
      !formData.jenis_atasan ||
      !formData.tanggal_mulai
    ) {
      showError(
        "Validasi Gagal",
        "Pegawai, atasan, jenis atasan, dan tanggal mulai harus diisi"
      );
      return;
    }

    if (formData.pegawai_id === formData.atasan_id) {
      showError("Validasi Gagal", "Pegawai dan atasan tidak boleh sama");
      return;
    }

    const alreadyHasSupervisor = atasanPegawai.some(
      (item) =>
        item.pegawai_id === formData.pegawai_id && Number(item.is_active) === 1
    );

    if (alreadyHasSupervisor) {
      showError(
        "Validasi Gagal",
        "Pegawai yang bersangkutan sudah memiliki atasan"
      );
      return;
    }

    try {
      showLoading("Menyimpan...", "Mohon tunggu sebentar");

      const response = await fetch("/api/atasan-pegawai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      closeLoading();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menambah atasan pegawai");
      }

      await showSuccess("Berhasil!", "Atasan pegawai berhasil ditambahkan");

      setShowModal(false);
      setFormData({
        pegawai_id: 0,
        atasan_id: 0,
        jenis_atasan: "Langsung",
        is_active: 1,
        tanggal_mulai: "",
        tanggal_selesai: null,
        keterangan: "",
      });
      fetchAtasanPegawai();
    } catch (err: any) {
      closeLoading();
      showError("Gagal!", err?.message || "Gagal menambah atasan pegawai");
    }
  };

  const handleEdit = (item: AtasanPegawaiData) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (id: number) => {
    try {
      showLoading("Menyimpan perubahan...");

      const response = await fetch(`/api/atasan-pegawai/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      closeLoading();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengubah atasan pegawai");
      }

      showToast("success", "Atasan pegawai berhasil diperbarui");

      setEditingId(null);
      setEditData({});
      fetchAtasanPegawai();
    } catch (err: any) {
      closeLoading();
      showError("Gagal!", err?.message || "Gagal mengubah atasan pegawai");
    }
  };

  const handleDelete = (item: AtasanPegawaiData) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    try {
      showLoading("Menghapus...");

      const response = await fetch(`/api/atasan-pegawai/${selectedItem.id}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      closeLoading();

      if (!response.ok || !responseData.success) {
        throw new Error(
          responseData.message || "Gagal menghapus atasan pegawai"
        );
      }

      showToast("success", "Atasan pegawai berhasil dihapus");

      setIsDeleteModalOpen(false);
      setSelectedItem(null);

      fetchAtasanPegawai();
    } catch (err: any) {
      closeLoading();
      showError("Gagal!", err?.message || "Gagal menghapus atasan pegawai");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getJenisAtasanBadge = (jenis: string) => {
    const colors: Record<string, string> = {
      Langsung: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Tidak Langsung":
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      PLT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      PLH: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return (
      colors[jenis] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    );
  };

  if (loading && atasanPegawai.length === 0) {
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Atasan Pegawai
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola hubungan atasan dan pegawai
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Data
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {atasanPegawai.length}
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
                  Aktif
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {atasanPegawai.filter((item) => item.is_active === 1).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Non-Aktif
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {atasanPegawai.filter((item) => item.is_active === 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Atasan Langsung
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {
                    atasanPegawai.filter(
                      (item) => item.jenis_atasan === "Langsung"
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari pegawai atau atasan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Filter Jenis Atasan */}
                <select
                  value={filterJenisAtasan}
                  onChange={(e) => setFilterJenisAtasan(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="all">Semua Jenis</option>
                  <option value="Langsung">Langsung</option>
                  <option value="Tidak Langsung">Tidak Langsung</option>
                  <option value="PLT">PLT</option>
                  <option value="PLH">PLH</option>
                </select>

                {/* Filter Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Non-Aktif</option>
                </select>
              </div>

              {/* Add Button */}
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-5 h-5" />
                Tambah Data
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 m-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {filteredData.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold">Tidak ada data</p>
              <p className="text-sm mt-1">
                {searchQuery ||
                filterJenisAtasan !== "all" ||
                filterStatus !== "all"
                  ? "Coba ubah filter pencarian"
                  : "Tambahkan data baru untuk memulai"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Pegawai
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Atasan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Jenis Atasan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Tanggal Mulai
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Tanggal Selesai
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
                  {filteredData.map((item, index) => {
                    const isEditing = editingId === item.id;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {isEditing ? (
                            <select
                              value={editData.pegawai_id || 0}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  pegawai_id: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500">
                              <option value={0}>Pilih Pegawai</option>
                              {pegawaiList.map((pegawai) => (
                                <option
                                  key={pegawai.pegawai_id}
                                  value={pegawai.pegawai_id}>
                                  {getPegawaiNama(pegawai)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item.pegawai_nama}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {isEditing ? (
                            <select
                              value={editData.atasan_id || 0}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  atasan_id: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500">
                              <option value={0}>Pilih Atasan</option>
                              {pegawaiList.map((pegawai) => (
                                <option
                                  key={pegawai.pegawai_id}
                                  value={pegawai.pegawai_id}>
                                  {getPegawaiNama(pegawai)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item.atasan_nama}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editData.jenis_atasan || "Langsung"}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  jenis_atasan: e.target.value as any,
                                })
                              }
                              className="px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500">
                              <option value="Langsung">Langsung</option>
                              <option value="Tidak Langsung">
                                Tidak Langsung
                              </option>
                              <option value="PLT">PLT</option>
                              <option value="PLH">PLH</option>
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${getJenisAtasanBadge(
                                item.jenis_atasan
                              )}`}>
                              {item.jenis_atasan}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editData.tanggal_mulai || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  tanggal_mulai: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{formatDate(item.tanggal_mulai)}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editData.tanggal_selesai || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  tanggal_selesai: e.target.value || null,
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{formatDate(item.tanggal_selesai)}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editData.is_active || 1}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  is_active: parseInt(e.target.value),
                                })
                              }
                              className="px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500">
                              <option value={1}>Aktif</option>
                              <option value={0}>Non-Aktif</option>
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                item.is_active === 1
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}>
                              {item.is_active === 1 ? "Aktif" : "Non-Aktif"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                title="Simpan">
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                                title="Batal">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                title="Hapus">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah Data */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Tambah Atasan Pegawai
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pegawai <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.pegawai_id || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pegawai_id: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value={0}>Pilih Pegawai</option>
                    {pegawaiList.map((pegawai) => (
                      <option
                        key={pegawai.pegawai_id}
                        value={pegawai.pegawai_id}>
                        {getPegawaiNama(pegawai)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Atasan <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.atasan_id || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        atasan_id: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value={0}>Pilih Atasan</option>
                    {pegawaiList.map((pegawai) => (
                      <option
                        key={pegawai.pegawai_id}
                        value={pegawai.pegawai_id}>
                        {getPegawaiNama(pegawai)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jenis Atasan <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.jenis_atasan || "Langsung"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jenis_atasan: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="Langsung">Langsung</option>
                    <option value="Tidak Langsung">Tidak Langsung</option>
                    <option value="PLT">PLT</option>
                    <option value="PLH">PLH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_mulai || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggal_mulai: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal_selesai || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggal_selesai: e.target.value || null,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keterangan
                </label>
                <textarea
                  value={formData.keterangan || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      keterangan: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Keterangan tambahan (opsional)..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.is_active || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value={1}>Aktif</option>
                  <option value={0}>Non-Aktif</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              {/* Icon */}
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                Hapus Data?
              </h3>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Data atasan pegawai{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedItem.pegawai_nama}
                </span>{" "}
                dengan atasan{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedItem.atasan_nama}
                </span>{" "}
                akan dihapus permanen.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedItem(null);
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

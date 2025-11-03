// app/(dashboard)/dashboard/kategori-kegiatan/_client.tsx
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
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  AlertCircle,
  Tag,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface KategoriData {
  kategori_id: number;
  kode_kategori: string;
  nama_kategori: string;
  deskripsi: string | null;
  warna: string;
  icon: string | null;
  is_active: number;
  urutan: number;
  created_at: string;
  updated_at: string;
}

export default function KategoriKegiatanClient() {
  const [kategori, setKategori] = useState<KategoriData[]>([]);
  const [filteredKategori, setFilteredKategori] = useState<KategoriData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<KategoriData>>({});

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<KategoriData>>({
    kode_kategori: "",
    nama_kategori: "",
    deskripsi: "",
    warna: "#3B82F6",
    icon: "",
    is_active: 1,
    urutan: 0,
  });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<KategoriData | null>(
    null
  );

  useEffect(() => {
    fetchKategori();
  }, []);

  useEffect(() => {
    let filtered = [...kategori];

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (kat) =>
          kat.kode_kategori
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          kat.nama_kategori
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          kat.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      const status = filterStatus === "active" ? 1 : 0;
      filtered = filtered.filter((kat) => kat.is_active === status);
    }

    setFilteredKategori(filtered);
  }, [searchQuery, filterStatus, kategori]);

  const fetchKategori = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/kategori");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memuat kategori");
      }

      setKategori(result.data);
      setFilteredKategori(result.data);
    } catch (err: any) {
      console.error("Error fetching kategori:", err);
      setError(err?.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      showLoading("Menyimpan...", "Mohon tunggu sebentar");

      const response = await fetch("/api/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      closeLoading();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menambah kategori");
      }

      // Success dengan SweetAlert2
      await showSuccess("Berhasil!", "Kategori berhasil ditambahkan");

      setShowModal(false);
      setFormData({
        kode_kategori: "",
        nama_kategori: "",
        deskripsi: "",
        warna: "#3B82F6",
        icon: "",
        is_active: 1,
        urutan: 0,
      });
      fetchKategori();
    } catch (err: any) {
      closeLoading();
      // Error dengan SweetAlert2
      showError("Gagal!", err?.message || "Gagal menambah kategori");
    }
  };

  const handleEdit = (kategori: KategoriData) => {
    setEditingId(kategori.kategori_id);
    setEditData({ ...kategori });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (kategoriId: number) => {
    try {
      showLoading("Menyimpan perubahan...");

      const response = await fetch(`/api/kategori/${kategoriId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      closeLoading();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengubah kategori");
      }

      // Success dengan auto-close toast
      showToast("success", "Kategori berhasil diperbarui");

      setEditingId(null);
      setEditData({});
      fetchKategori();
    } catch (err: any) {
      closeLoading();
      showError("Gagal!", err?.message || "Gagal mengubah kategori");
    }
  };

  const handleDelete = (kategori: KategoriData) => {
    setSelectedKategori(kategori);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedKategori) return;

    try {
      showLoading("Menonaktifkan...");

      const response = await fetch(
        `/api/kategori/${selectedKategori.kategori_id}`,
        {
          method: "DELETE",
        }
      );

      const responseData = await response.json();

      closeLoading();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Gagal menonaktifkan kategori");
      }

      // Success dengan auto-close toast
      showToast("success", "Kategori berhasil dinonaktifkan");

      // Close modal and reset
      setIsDeleteModalOpen(false);
      setSelectedKategori(null);

      fetchKategori();
    } catch (err: any) {
      closeLoading();
      showError("Gagal!", err?.message || "Gagal menghapus kategori");
    }
  };

  if (loading && kategori.length === 0) {
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
            Kategori Kegiatan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola kategori kegiatan untuk sistem pelaporan
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Kategori
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {kategori.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600 dark:text-blue-300" />
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
                  {kategori.filter((k) => k.is_active === 1).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
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
                  {kategori.filter((k) => k.is_active === 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 flex gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

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
              Tambah Kategori
            </button>
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

          {filteredKategori.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold">Tidak ada kategori</p>
              <p className="text-sm mt-1">
                {searchQuery || filterStatus !== "all"
                  ? "Coba ubah filter pencarian"
                  : "Tambahkan kategori baru untuk memulai"}
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
                      Kode
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Nama Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Warna
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Urutan
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
                  {filteredKategori.map((kat, index) => {
                    const isEditing = editingId === kat.kategori_id;
                    return (
                      <tr
                        key={kat.kategori_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.kode_kategori || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  kode_kategori: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                            />
                          ) : (
                            <span className="font-mono font-semibold">
                              {kat.kode_kategori}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.nama_kategori || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  nama_kategori: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                            />
                          ) : (
                            kat.nama_kategori
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.deskripsi || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  deskripsi: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                            />
                          ) : (
                            <span className="line-clamp-2">
                              {kat.deskripsi || "-"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="color"
                              value={editData.warna || "#3B82F6"}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  warna: e.target.value,
                                })
                              }
                              className="w-12 h-8 border rounded cursor-pointer"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded border"
                                style={{ backgroundColor: kat.warna }}></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                {kat.warna}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editData.urutan || 0}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  urutan: parseInt(e.target.value),
                                })
                              }
                              className="w-20 px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                            />
                          ) : (
                            kat.urutan
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
                                kat.is_active === 1
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}>
                              {kat.is_active === 1 ? "Aktif" : "Non-Aktif"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(kat.kategori_id)}
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
                                onClick={() => handleEdit(kat)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(kat)}
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

      {/* Modal Tambah Kategori */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Tambah Kategori Baru
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
                    Kode Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kode_kategori || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kode_kategori: e.target.value,
                      })
                    }
                    placeholder="contoh: RAPAT"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_kategori || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama_kategori: e.target.value,
                      })
                    }
                    placeholder="contoh: Rapat Koordinasi"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  rows={3}
                  placeholder="Deskripsi kategori..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Warna
                  </label>
                  <input
                    type="color"
                    value={formData.warna || "#3B82F6"}
                    onChange={(e) =>
                      setFormData({ ...formData, warna: e.target.value })
                    }
                    className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={formData.urutan || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        urutan: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
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
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedKategori && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              {/* Icon */}
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                Nonaktifkan Kategori?
              </h3>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Kategori{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedKategori.nama_kategori}
                </span>{" "}
                (
                <span className="font-mono text-sm">
                  {selectedKategori.kode_kategori}
                </span>
                ) akan dinonaktifkan.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedKategori(null);
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
                  Nonaktifkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

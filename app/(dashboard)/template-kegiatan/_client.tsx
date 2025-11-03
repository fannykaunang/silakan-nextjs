// app/(dashboard)/dashboard/template-kegiatan/_client.tsx
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
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Target,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";

interface KategoriData {
  kategori_id: number;
  kode_kategori: string;
  nama_kategori: string;
  warna: string;
  is_active: number;
}

interface TemplateData {
  template_id: number;
  pegawai_id: number;
  pegawai_nama?: string;
  nama_template: string;
  kategori_id: number;
  kategori_nama?: string;
  kategori_warna?: string;
  deskripsi_template: string | null;
  target_output_default: string | null;
  lokasi_default: string | null;
  durasi_estimasi_menit: number;
  is_public: number;
  unit_kerja_akses: string | null;
  jumlah_penggunaan: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export default function TemplateKegiatanClient() {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateData[]>(
    []
  );
  const [kategoris, setKategoris] = useState<KategoriData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("all");
  const [filterPublic, setFilterPublic] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<TemplateData>>({});

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<TemplateData>>({
    nama_template: "",
    kategori_id: 0,
    deskripsi_template: "",
    target_output_default: "",
    lokasi_default: "",
    durasi_estimasi_menit: 60,
    is_public: 0,
    unit_kerja_akses: "",
    is_active: 1,
  });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(
    null
  );

  useEffect(() => {
    fetchKategoris();
    fetchTemplates();
  }, []);

  useEffect(() => {
    let filtered = [...templates];

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (tmpl) =>
          tmpl.nama_template
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          tmpl.deskripsi_template
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          tmpl.kategori_nama
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          tmpl.target_output_default
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Filter by kategori
    if (filterKategori !== "all") {
      filtered = filtered.filter(
        (tmpl) => tmpl.kategori_id === parseInt(filterKategori)
      );
    }

    // Filter by is_public
    if (filterPublic !== "all") {
      const isPublic = filterPublic === "public" ? 1 : 0;
      filtered = filtered.filter((tmpl) => tmpl.is_public === isPublic);
    }

    // Filter by status
    if (filterStatus !== "all") {
      const status = filterStatus === "active" ? 1 : 0;
      filtered = filtered.filter((tmpl) => tmpl.is_active === status);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, filterKategori, filterPublic, filterStatus, templates]);

  const fetchKategoris = async () => {
    try {
      const response = await fetch("/api/kategori");
      const result = await response.json();

      if (response.ok && result.success) {
        // Filter only active categories
        const activeKategoris = result.data.filter(
          (k: KategoriData) => k.is_active === 1
        );
        setKategoris(activeKategoris);
      }
    } catch (err) {
      console.error("Error fetching kategoris:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/template-kegiatan");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memuat template kegiatan");
      }

      setTemplates(result.data);
      setFilteredTemplates(result.data);
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      setError(err?.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nama_template || !formData.kategori_id) {
      showError("Validasi Gagal", "Nama template dan kategori harus diisi");
      return;
    }

    try {
      showLoading("Menyimpan...", "Mohon tunggu sebentar");

      const response = await fetch("/api/template-kegiatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      closeLoading();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menambah template");
      }

      await showSuccess("Berhasil!", "Template kegiatan berhasil ditambahkan");

      setShowModal(false);
      setFormData({
        nama_template: "",
        kategori_id: 0,
        deskripsi_template: "",
        target_output_default: "",
        lokasi_default: "",
        durasi_estimasi_menit: 60,
        is_public: 0,
        unit_kerja_akses: "",
        is_active: 1,
      });
      fetchTemplates();
    } catch (err: any) {
      closeLoading();
      showError("Gagal!", err?.message || "Gagal menambah template");
    }
  };

  const handleEdit = (template: TemplateData) => {
    setEditingId(template.template_id);
    setEditData({ ...template });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (templateId: number) => {
    try {
      showLoading("Menyimpan perubahan...");

      const response = await fetch(`/api/template-kegiatan/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      closeLoading();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengubah template");
      }

      showToast("success", "Template berhasil diperbarui");

      setEditingId(null);
      setEditData({});
      fetchTemplates();
    } catch (err: any) {
      closeLoading();
      showError("Gagal!", err?.message || "Gagal mengubah template");
    }
  };

  const handleDelete = (template: TemplateData) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplate) return;

    try {
      showLoading("Menghapus...");

      const response = await fetch(
        `/api/template-kegiatan/${selectedTemplate.template_id}`,
        {
          method: "DELETE",
        }
      );

      const responseData = await response.json();

      closeLoading();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Gagal menghapus template");
      }

      showToast("success", "Template berhasil dihapus");

      setIsDeleteModalOpen(false);
      setSelectedTemplate(null);

      fetchTemplates();
    } catch (err: any) {
      closeLoading();
      showError("Gagal!", err?.message || "Gagal menghapus template");
    }
  };

  const formatDurasi = (menit: number) => {
    const jam = Math.floor(menit / 60);
    const sisaMenit = menit % 60;
    if (jam > 0 && sisaMenit > 0) {
      return `${jam}j ${sisaMenit}m`;
    } else if (jam > 0) {
      return `${jam} jam`;
    } else {
      return `${sisaMenit} menit`;
    }
  };

  if (loading && templates.length === 0) {
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
            Template Kegiatan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola template kegiatan untuk mempercepat pelaporan
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Template
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {templates.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Template Publik
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {templates.filter((t) => t.is_public === 1).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Template Privat
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {templates.filter((t) => t.is_public === 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Penggunaan
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {templates.reduce((sum, t) => sum + t.jumlah_penggunaan, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-300" />
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
                    placeholder="Cari template..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Filter Kategori */}
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="all">Semua Kategori</option>
                  {kategoris.map((kat) => (
                    <option key={kat.kategori_id} value={kat.kategori_id}>
                      {kat.nama_kategori}
                    </option>
                  ))}
                </select>

                {/* Filter Public */}
                <select
                  value={filterPublic}
                  onChange={(e) => setFilterPublic(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="all">Semua Akses</option>
                  <option value="public">Publik</option>
                  <option value="private">Privat</option>
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
                Tambah Template
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

          {filteredTemplates.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold">Tidak ada template</p>
              <p className="text-sm mt-1">
                {searchQuery ||
                filterKategori !== "all" ||
                filterPublic !== "all" ||
                filterStatus !== "all"
                  ? "Coba ubah filter pencarian"
                  : "Tambahkan template baru untuk memulai"}
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
                      Nama Template
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Target Output
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Durasi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Akses
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Penggunaan
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
                  {filteredTemplates.map((tmpl, index) => {
                    const isEditing = editingId === tmpl.template_id;
                    return (
                      <tr
                        key={tmpl.template_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.nama_template || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  nama_template: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                            />
                          ) : (
                            <div className="font-medium">
                              {tmpl.nama_template}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editData.kategori_id || 0}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  kategori_id: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500">
                              <option value={0}>Pilih Kategori</option>
                              {kategoris.map((kat) => (
                                <option
                                  key={kat.kategori_id}
                                  value={kat.kategori_id}>
                                  {kat.nama_kategori}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className="px-3 py-1 text-xs font-semibold rounded-full"
                              style={{
                                backgroundColor: tmpl.kategori_warna + "20",
                                color: tmpl.kategori_warna,
                              }}>
                              {tmpl.kategori_nama}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.target_output_default || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  target_output_default: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-gray-400" />
                              <span className="line-clamp-1">
                                {tmpl.target_output_default || "-"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.lokasi_default || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  lokasi_default: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="line-clamp-1">
                                {tmpl.lokasi_default || "-"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editData.durasi_estimasi_menit || 60}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  durasi_estimasi_menit: parseInt(
                                    e.target.value
                                  ),
                                })
                              }
                              className="w-20 px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>
                                {formatDurasi(tmpl.durasi_estimasi_menit)}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editData.is_public || 0}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  is_public: parseInt(e.target.value),
                                })
                              }
                              className="px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500">
                              <option value={1}>Publik</option>
                              <option value={0}>Privat</option>
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                tmpl.is_public === 1
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              }`}>
                              {tmpl.is_public === 1 ? "Publik" : "Privat"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold">
                              {tmpl.jumlah_penggunaan}x
                            </span>
                          </div>
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
                                tmpl.is_active === 1
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}>
                              {tmpl.is_active === 1 ? "Aktif" : "Non-Aktif"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(tmpl.template_id)}
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
                                onClick={() => handleEdit(tmpl)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(tmpl)}
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

      {/* Modal Tambah Template */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Tambah Template Baru
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Template <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_template || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama_template: e.target.value,
                      })
                    }
                    placeholder="contoh: Rapat Koordinasi Bulanan"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.kategori_id || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kategori_id: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value={0}>Pilih Kategori</option>
                    {kategoris.map((kat) => (
                      <option key={kat.kategori_id} value={kat.kategori_id}>
                        {kat.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durasi Estimasi (menit)
                  </label>
                  <input
                    type="number"
                    value={formData.durasi_estimasi_menit || 60}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durasi_estimasi_menit: parseInt(e.target.value) || 60,
                      })
                    }
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi Template
                </label>
                <textarea
                  value={formData.deskripsi_template || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deskripsi_template: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Deskripsi singkat tentang template ini..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Output Default
                  </label>
                  <input
                    type="text"
                    value={formData.target_output_default || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_output_default: e.target.value,
                      })
                    }
                    placeholder="contoh: Notulen rapat dan daftar hadir"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lokasi Default
                  </label>
                  <input
                    type="text"
                    value={formData.lokasi_default || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lokasi_default: e.target.value,
                      })
                    }
                    placeholder="contoh: Ruang Rapat Lantai 2"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Akses Template
                  </label>
                  <select
                    value={formData.is_public || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_public: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value={0}>Privat</option>
                    <option value={1}>Publik</option>
                  </select>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit Kerja Akses
                  </label>
                  <input
                    type="text"
                    value={formData.unit_kerja_akses || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unit_kerja_akses: e.target.value,
                      })
                    }
                    placeholder='["SKPD001","SKPD002"]'
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
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
                  Simpan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              {/* Icon */}
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                Hapus Template?
              </h3>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Template{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedTemplate.nama_template}
                </span>{" "}
                akan dihapus permanen. Template ini telah digunakan{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedTemplate.jumlah_penggunaan} kali
                </span>
                .
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedTemplate(null);
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

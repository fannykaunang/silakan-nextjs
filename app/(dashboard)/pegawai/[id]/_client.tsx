// app/(dashboard)/pegawai/[id]/_client.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  Save,
  ArrowLeft,
  Edit2,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  IdCard,
  Shield,
} from "lucide-react";
import Swal from "sweetalert2";

interface PegawaiData {
  pegawai_id: number;
  pegawai_pin: string;
  pegawai_nip: string;
  pegawai_nama: string;
  tempat_lahir: string | null;
  tgl_lahir: string | null;
  gender: number;
  pegawai_telp: string | null;
  pegawai_privilege: string;
  pegawai_status: number;
  jabatan: string | null;
  skpd: string | null;
  sotk: string | null;
  tgl_mulai_kerja: string | null;
  photo_path: string | null;
  last_sync: string | null;
}

export default function PegawaiDetailClient() {
  const params = useParams();
  const router = useRouter();
  const pegawaiId = params.id as string;

  const [pegawai, setPegawai] = useState<PegawaiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState<PegawaiData | null>(null);

  useEffect(() => {
    fetchPegawaiDetail();
  }, [pegawaiId]);

  const fetchPegawaiDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pegawai/${pegawaiId}`);

      if (!response.ok) {
        throw new Error("Gagal mengambil data pegawai");
      }

      const data = await response.json();
      setPegawai(data);
      setEditedData(data);
    } catch (error) {
      console.error("Error fetching pegawai:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengambil data pegawai",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
      router.push("/pegawai");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData(pegawai);
    setIsEditing(false);
  };

  const handleChange = (field: keyof PegawaiData, value: any) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!editedData) return;

    // Validasi
    if (!editedData.pegawai_nama?.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Nama pegawai tidak boleh kosong",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`/api/pegawai/${pegawaiId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan data");
      }

      setPegawai(editedData);
      setIsEditing(false);

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data pegawai berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
    } catch (error: any) {
      console.error("Error saving pegawai:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Gagal menyimpan data pegawai",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getPrivilegeLabel = (privilege: string) => {
    const labels: { [key: string]: string } = {
      "0": "User",
      "1": "Operator",
      "2": "Operator",
      "3": "Admin",
    };
    return labels[privilege] || "User";
  };

  const getStatusLabel = (status: number) => {
    return status === 1 ? "Aktif" : "Non-aktif";
  };

  const getGenderLabel = (gender: number) => {
    return gender === 1 ? "Laki-laki" : "Perempuan";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pegawai || !editedData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Data pegawai tidak ditemukan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/pegawai")}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Detail Pegawai
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Informasi lengkap data pegawai
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Edit2 className="w-4 h-4" />
              Edit Data
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50">
                <X className="w-4 h-4" />
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Simpan
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo & Basic Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {/* Photo */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {pegawai.photo_path ? (
                    <img
                      src={`https://entago.merauke.go.id/${pegawai.photo_path}`}
                      alt={pegawai.pegawai_nama}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          pegawai.pegawai_nama
                        )}&size=128&background=3b82f6&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-600">
                      {pegawai.pegawai_nama.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${
                      pegawai.pegawai_status === 1
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    title={getStatusLabel(pegawai.pegawai_status)}></div>
                </div>
              </div>

              {/* Name */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {pegawai.pegawai_nama}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pegawai.jabatan || "-"}
                </p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <IdCard className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      NIP
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.pegawai_nip || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <IdCard className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      PIN
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.pegawai_pin}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Level
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getPrivilegeLabel(pegawai.pegawai_privilege)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <CheckCircle
                    className={`w-5 h-5 ${
                      pegawai.pegawai_status === 1
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Status
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        pegawai.pegawai_status === 1
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>
                      {getStatusLabel(pegawai.pegawai_status)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informasi Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lengkap
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.pegawai_nama}
                      onChange={(e) =>
                        handleChange("pegawai_nama", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {pegawai.pegawai_nama}
                    </p>
                  )}
                </div>

                {/* Tempat Lahir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tempat Lahir
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.tempat_lahir || ""}
                      onChange={(e) =>
                        handleChange("tempat_lahir", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {pegawai.tempat_lahir || "-"}
                    </p>
                  )}
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Lahir
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={
                        editedData.tgl_lahir
                          ? editedData.tgl_lahir.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleChange("tgl_lahir", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {formatDate(pegawai.tgl_lahir)}
                    </p>
                  )}
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jenis Kelamin
                  </label>
                  {isEditing ? (
                    <select
                      value={editedData.gender}
                      onChange={(e) =>
                        handleChange("gender", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      <option value={1}>Laki-laki</option>
                      <option value={2}>Perempuan</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {getGenderLabel(pegawai.gender)}
                    </p>
                  )}
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nomor Telepon
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.pegawai_telp || ""}
                      onChange={(e) =>
                        handleChange("pegawai_telp", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {pegawai.pegawai_telp || "-"}
                    </p>
                  )}
                </div>

                {/* Tanggal Mulai Kerja */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Mulai Kerja
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={
                        editedData.tgl_mulai_kerja
                          ? editedData.tgl_mulai_kerja.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleChange("tgl_mulai_kerja", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {formatDate(pegawai.tgl_mulai_kerja)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Informasi Kepegawaian
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Jabatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jabatan
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.jabatan || ""}
                      onChange={(e) => handleChange("jabatan", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {pegawai.jabatan || "-"}
                    </p>
                  )}
                </div>

                {/* SKPD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKPD
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.skpd || ""}
                      onChange={(e) => handleChange("skpd", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      {pegawai.skpd || "-"}
                    </p>
                  )}
                </div>

                {/* SOTK */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit Organisasi (SOTK)
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.sotk || ""}
                      onChange={(e) => handleChange("sotk", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {pegawai.sotk || "-"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Informasi Sistem
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Last Sync */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Terakhir Sinkronisasi
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {pegawai.last_sync
                      ? new Date(pegawai.last_sync).toLocaleString("id-ID")
                      : "-"}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status Pegawai
                  </label>
                  {isEditing ? (
                    <select
                      value={editedData.pegawai_status}
                      onChange={(e) =>
                        handleChange("pegawai_status", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      <option value={1}>Aktif</option>
                      <option value={0}>Non-aktif</option>
                    </select>
                  ) : (
                    <p
                      className={`px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg font-medium ${
                        pegawai.pegawai_status === 1
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>
                      {getStatusLabel(pegawai.pegawai_status)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// app/(dashboard)/profile/_client.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Camera,
  Save,
  X,
  Edit2,
  AlertCircle,
  MapPin,
  Phone,
  Calendar,
  Briefcase,
  Shield,
  Home,
} from "lucide-react";
import { showWarning } from "@/lib/utils/sweetalert";

interface PegawaiData {
  pegawai_id: number;
  pegawai_pin: string;
  pegawai_nip: string;
  pegawai_nama: string;
  tempat_lahir: string;
  pegawai_privilege: string;
  pegawai_telp: string;
  pegawai_status: number;
  tgl_lahir: string;
  jabatan: string;
  skpd: string;
  sotk: string;
  tgl_mulai_kerja: string;
  gender: number;
  photo_path: string;
}

type Props = {
  userPin?: string;
};

export default function ProfileClient({ userPin }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<PegawaiData | null>(null);
  const [editedData, setEditedData] = useState<PegawaiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fungsi helper
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
      "-1": "bg-red-100 text-red-800",
      "0": "bg-gray-100 text-gray-800",
      "1": "bg-blue-100 text-blue-800",
      "2": "bg-purple-100 text-purple-800",
      "3": "bg-green-100 text-green-800",
    };
    return colors[privilege] || "bg-gray-100 text-gray-800";
  };

  const getGenderText = (gender: number) => {
    return gender === 1 ? "Laki-laki" : "Perempuan";
  };

  const getStatusText = (status: number) => {
    return status === 1 ? "Aktif" : "Non-aktif";
  };

  // Fetch data profil
  // di dalam component _client.tsx kamu
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("🔄 Fetching profile..."); // Debug log
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/profile${userPin ? `?pin=${userPin}` : ""}`
        );

        console.log("📡 Response status:", res.status); // Debug log

        const json = await res.json();
        console.log("📦 Response data:", json); // Debug log

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Gagal memuat data profil");
        }

        setUserData(json.data);
        setEditedData(json.data);
        console.log("✅ Profile loaded successfully"); // Debug log
      } catch (err: any) {
        console.error("❌ Error fetching profile:", err);
        setError(err?.message || "Terjadi kesalahan saat memuat profil");
      } finally {
        console.log("🏁 Setting loading to false"); // Debug log
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userPin]);

  // update title ketika nama sudah tersedia
  useEffect(() => {
    if (userData?.pegawai_nama) {
      document.title = `Profil ${userData.pegawai_nama} | SILAKAN`;
    } else {
      document.title = "Profil | SILAKAN";
    }
  }, [userData?.pegawai_nama]);

  // Save profil
  const handleSave = async () => {
    if (!editedData) return;

    showWarning(
      "Informasi!",
      "Silahkan ubah Informasi Pegawai di Web E-NTAGO!"
    );
    // try {
    //   setLoading(true);
    //   const response = await fetch("/api/profile", {
    //     method: "PUT",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(editedData),
    //   });

    //   const result = await response.json();

    //   if (response.ok && result.success) {
    //     setUserData(result.data);
    //     setEditedData(result.data);
    //     setIsEditing(false);
    //     alert("Profil berhasil diperbarui!");
    //   } else {
    //     alert(result.message || "Gagal memperbarui profil");
    //   }
    // } catch (error) {
    //   console.error("Error updating profile:", error);
    //   alert("Terjadi kesalahan saat menyimpan profil");
    // } finally {
    //   setLoading(false);
    // }
  };

  // Upload foto
  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const profileResponse = await fetch(
          `/api/profile${userPin ? `?pin=${userPin}` : ""}`
        );
        const profileResult = await profileResponse.json();

        if (profileResult.success) {
          setUserData(profileResult.data);
          setEditedData(profileResult.data);
        }

        alert("Foto berhasil diupload!");
      } else {
        alert(result.message || "Gagal mengupload foto");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Terjadi kesalahan saat mengupload foto");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof PegawaiData, value: any) => {
    if (!editedData) return;
    setEditedData({ ...editedData, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Memuat profil...
          </p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            {error || "Gagal memuat data profil"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Profil Pengguna
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola informasi profil Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Photo & Quick Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  <img
                    src={
                      userData.photo_path
                        ? `https://entago.merauke.go.id/${userData.photo_path}`
                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.pegawai_nama}`
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full bg-white dark:bg-gray-800 object-cover"
                  />
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer">
                      <Camera className="w-4 h-4" />
                    </label>
                  </>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-300 mt-4 text-center">
                {userData.pegawai_nama}
              </h2>
              <p className="dark:text-gray-300 text-sm mt-1 dark:text-gray-300">
                {userData.jabatan}
              </p>

              <div
                className={`mt-3 px-4 py-1.5 rounded-full text-xs font-semibold ${getPrivilegeColor(
                  userData.pegawai_privilege
                )}`}>
                {getPrivilegeName(userData.pegawai_privilege)}
              </div>

              <div className="w-full mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="dark:text-gray-400 text-xs">NIP</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {userData.pegawai_nip}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="dark:text-gray-400 text-xs">PIN</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {userData.pegawai_pin}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      userData.pegawai_status === 1
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        userData.pegawai_status === 1
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}></div>
                  </div>
                  <div>
                    <p className="dark:text-gray-400 text-xs">Status</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {getStatusText(userData.pegawai_status)}
                    </p>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Informasi Pribadi
              </h3>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50">
                    <Save className="w-4 h-4" />
                    Simpan
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2
             bg-gray-200 dark:bg-gray-700
             text-gray-700 dark:text-gray-200
             rounded-lg
             hover:bg-gray-300 dark:hover:bg-gray-600
             transition
             flex items-center gap-2
             disabled:opacity-50
             focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500">
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nama Lengkap
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.pegawai_nama || ""}
                    onChange={(e) =>
                      handleInputChange("pegawai_nama", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="px-4 py-2.5 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 font-medium border border-transparent dark:border-gray-700">
                    {userData.pegawai_nama}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Tempat Lahir
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.tempat_lahir || ""}
                    onChange={(e) =>
                      handleInputChange("tempat_lahir", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="px-4 py-2.5 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 font-medium border border-transparent dark:border-gray-700">
                    {userData.tempat_lahir}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Tanggal Lahir
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData?.tgl_lahir || ""}
                    onChange={(e) =>
                      handleInputChange("tgl_lahir", e.target.value)
                    }
                    placeholder="DD/MM/YYYY"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="px-4 py-2.5 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 font-medium border border-transparent dark:border-gray-700">
                    {userData.tgl_lahir}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Jenis Kelamin
                </label>
                {isEditing ? (
                  <select
                    value={editedData?.gender || 1}
                    onChange={(e) =>
                      handleInputChange("gender", parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option value={1}>Laki-laki</option>
                    <option value={2}>Perempuan</option>
                  </select>
                ) : (
                  <div className="px-4 py-2.5 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 font-medium border border-transparent dark:border-gray-700">
                    {getGenderText(userData.gender)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nomor Telepon
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData?.pegawai_telp || ""}
                    onChange={(e) =>
                      handleInputChange("pegawai_telp", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="px-4 py-2.5 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 font-medium border border-transparent dark:border-gray-700">
                    {userData.pegawai_telp}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
              Informasi Kepegawaian
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Jabatan
                </label>
                <div className="px-4 py-2.5 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 font-medium border border-transparent dark:border-gray-700">
                  {userData.jabatan}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  SKPD
                </label>
                <div className="px-4 py-2.5 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 font-medium border border-transparent dark:border-gray-700">
                  {userData.skpd}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  SOTK
                </label>
                <div className="px-4 py-2.5 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 font-medium border border-transparent dark:border-gray-700">
                  {userData.sotk}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Tanggal Mulai Kerja
                </label>
                <div className="px-4 py-2.5 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 font-medium border border-transparent dark:border-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 dark:text-gray-400" />
                  {userData.tgl_mulai_kerja}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Card */}
          <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Statistik Aktivitas</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm opacity-90 dark:text-gray-400">
                  Kehadiran
                </p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  95%
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm opacity-90 dark:text-gray-400">Tugas</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  48
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm opacity-90 dark:text-gray-400">Proyek</p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                  12
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

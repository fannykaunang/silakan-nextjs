// components/ProfileLayout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { User, Camera, Save, X, Edit2, AlertCircle } from "lucide-react";
import Header from "./HeaderClient";

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

export default function ProfileClient() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<PegawaiData | null>(null);
  const [editedData, setEditedData] = useState<PegawaiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data profil
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/profile");
        const result = await response.json();

        if (response.ok && result.success) {
          setUserData(result.data);
          setEditedData(result.data);
        } else {
          setError(result.message || "Gagal memuat data profil");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Terjadi kesalahan saat memuat profil");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  // Save profil
  const handleSave = async () => {
    if (!editedData) return;

    try {
      setLoading(true);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUserData(result.data);
        setEditedData(result.data);
        setIsEditing(false);
        alert("Profil berhasil diperbarui!");
      } else {
        alert(result.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Terjadi kesalahan saat menyimpan profil");
    } finally {
      setLoading(false);
    }
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
        // Refresh data profil untuk mendapatkan photo_path terbaru
        const profileResponse = await fetch("/api/profile");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 dark:text-gray-300">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">
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
}

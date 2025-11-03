// app/(dashboard)/dashboard/laporan/tambah/_client.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  Users,
  Link as LinkIcon,
  Upload,
  X,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  Target,
  Flag,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import Swal from "sweetalert2";

interface Kategori {
  kategori_id: number;
  nama_kategori: string;
  kode_kategori: string;
  warna?: string;
  icon?: string;
}

interface FormData {
  tanggal_kegiatan: string;
  kategori_id: string;
  nama_kegiatan: string;
  deskripsi_kegiatan: string;
  target_output: string;
  hasil_output: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi_kegiatan: string;
  latitude: string;
  longitude: string;
  peserta_kegiatan: string;
  jumlah_peserta: string;
  link_referensi: string;
  kendala: string;
  solusi: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

export default function TambahLaporanClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    tanggal_kegiatan: new Date().toISOString().split("T")[0], // Today
    kategori_id: "",
    nama_kegiatan: "",
    deskripsi_kegiatan: "",
    target_output: "",
    hasil_output: "",
    waktu_mulai: "",
    waktu_selesai: "",
    lokasi_kegiatan: "",
    latitude: "",
    longitude: "",
    peserta_kegiatan: "",
    jumlah_peserta: "0",
    link_referensi: "",
    kendala: "",
    solusi: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchKategoris();
  }, []);

  const fetchKategoris = async () => {
    try {
      const response = await fetch("/api/kategori?is_active=1");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setKategoris(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching kategoris:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    Array.from(files).forEach((file) => {
      // Check file size (max 5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File Terlalu Besar",
          text: `File ${file.name} melebihi 5MB`,
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        });
        return;
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newFiles.push({
            file,
            preview: reader.result as string,
          });

          if (newFiles.length === files.length) {
            setUploadedFiles((prev) => [...prev, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push({ file });
        if (newFiles.length === files.length) {
          setUploadedFiles((prev) => [...prev, ...newFiles]);
        }
      }
    });

    // Reset input
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "Tidak Didukung",
        text: "Browser Anda tidak mendukung geolocation",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        setGettingLocation(false);

        Swal.fire({
          icon: "success",
          title: "Lokasi Didapatkan",
          text: "Koordinat lokasi berhasil diambil",
          timer: 1500,
          showConfirmButton: false,
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        });
      },
      (error) => {
        setGettingLocation(false);
        Swal.fire({
          icon: "error",
          title: "Gagal Mengambil Lokasi",
          text: "Pastikan izin lokasi diaktifkan",
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        });
      }
    );
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.tanggal_kegiatan) {
      newErrors.tanggal_kegiatan = "Tanggal kegiatan wajib diisi";
    }

    if (!formData.kategori_id) {
      newErrors.kategori_id = "Kategori kegiatan wajib dipilih";
    }

    if (!formData.nama_kegiatan.trim()) {
      newErrors.nama_kegiatan = "Nama kegiatan wajib diisi";
    }

    if (!formData.deskripsi_kegiatan.trim()) {
      newErrors.deskripsi_kegiatan = "Deskripsi kegiatan wajib diisi";
    }

    if (!formData.waktu_mulai) {
      newErrors.waktu_mulai = "Waktu mulai wajib diisi";
    }

    if (!formData.waktu_selesai) {
      newErrors.waktu_selesai = "Waktu selesai wajib diisi";
    }

    if (formData.waktu_mulai && formData.waktu_selesai) {
      if (formData.waktu_mulai >= formData.waktu_selesai) {
        newErrors.waktu_selesai =
          "Waktu selesai harus lebih besar dari waktu mulai";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: "Draft" | "Diajukan") => {
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Mohon lengkapi semua field yang wajib diisi",
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
      setLoading(true);

      // Prepare data
      const submitData = {
        ...formData,
        kategori_id: parseInt(formData.kategori_id),
        jumlah_peserta: parseInt(formData.jumlah_peserta) || 0,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        status_laporan: status,
      };

      // Submit laporan
      const response = await fetch("/api/laporan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle attendance check error
        if (result.requiresAttendance) {
          await Swal.fire({
            icon: "warning",
            title: "Belum Absen",
            text:
              result.error ||
              "Anda belum absen hari ini. Silakan absen terlebih dahulu.",
            background: document.documentElement.classList.contains("dark")
              ? "#1f2937"
              : "#fff",
            color: document.documentElement.classList.contains("dark")
              ? "#fff"
              : "#000",
          });
          setLoading(false);
          return;
        }

        throw new Error(result.error || "Gagal menyimpan laporan");
      }

      // TODO: Upload files if any
      // const laporanId = result.laporan_id;
      // if (uploadedFiles.length > 0) {
      //   await uploadFiles(laporanId);
      // }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Laporan berhasil disimpan sebagai ${status}`,
        timer: 1500,
        showConfirmButton: false,
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });

      // Redirect to list page
      router.push("/dashboard/laporan");
    } catch (error: any) {
      console.error("Error submitting laporan:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Gagal menyimpan laporan",
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
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tambah Laporan Kegiatan
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Buat laporan kegiatan harian baru
          </p>
        </div>

        {/* Info Alert */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Informasi Penting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Untuk laporan hari ini, pastikan Anda sudah melakukan absensi
              </li>
              <li>
                Field bertanda <span className="text-red-500">*</span> wajib
                diisi
              </li>
              <li>
                Anda dapat menyimpan sebagai Draft atau langsung Mengajukan
              </li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Informasi Dasar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tanggal Kegiatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_kegiatan"
                  value={formData.tanggal_kegiatan}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.tanggal_kegiatan
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.tanggal_kegiatan && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tanggal_kegiatan}
                  </p>
                )}
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori Kegiatan <span className="text-red-500">*</span>
                </label>
                <select
                  name="kategori_id"
                  value={formData.kategori_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.kategori_id
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}>
                  <option value="">Pilih Kategori</option>
                  {kategoris.map((kat) => (
                    <option key={kat.kategori_id} value={kat.kategori_id}>
                      {kat.nama_kategori}
                    </option>
                  ))}
                </select>
                {errors.kategori_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.kategori_id}
                  </p>
                )}
              </div>

              {/* Nama Kegiatan */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_kegiatan"
                  value={formData.nama_kegiatan}
                  onChange={handleChange}
                  placeholder="Contoh: Rapat Koordinasi Tim"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.nama_kegiatan
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.nama_kegiatan && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nama_kegiatan}
                  </p>
                )}
              </div>

              {/* Deskripsi Kegiatan */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi Kegiatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="deskripsi_kegiatan"
                  value={formData.deskripsi_kegiatan}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Jelaskan detail kegiatan yang dilakukan..."
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.deskripsi_kegiatan
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.deskripsi_kegiatan && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.deskripsi_kegiatan}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Target & Output */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Target & Hasil
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Output */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Output
                </label>
                <textarea
                  name="target_output"
                  value={formData.target_output}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Target yang ingin dicapai..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Hasil Output */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hasil Output
                </label>
                <textarea
                  name="hasil_output"
                  value={formData.hasil_output}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Hasil yang telah dicapai..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Waktu */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Waktu Pelaksanaan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Waktu Mulai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waktu Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="waktu_mulai"
                  value={formData.waktu_mulai}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.waktu_mulai
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.waktu_mulai && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.waktu_mulai}
                  </p>
                )}
              </div>

              {/* Waktu Selesai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waktu Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="waktu_selesai"
                  value={formData.waktu_selesai}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.waktu_selesai
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.waktu_selesai && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.waktu_selesai}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lokasi & Peserta */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Lokasi & Peserta
            </h2>

            <div className="space-y-4">
              {/* Lokasi Kegiatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lokasi Kegiatan
                </label>
                <input
                  type="text"
                  name="lokasi_kegiatan"
                  value={formData.lokasi_kegiatan}
                  onChange={handleChange}
                  placeholder="Contoh: Ruang Rapat Lantai 2"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Koordinat */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="-8.4875"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="140.4075"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {gettingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mengambil...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        Lokasi Saya
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Peserta */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Peserta Kegiatan
                  </label>
                  <input
                    type="text"
                    name="peserta_kegiatan"
                    value={formData.peserta_kegiatan}
                    onChange={handleChange}
                    placeholder="Contoh: John Doe, Jane Smith, Bob Johnson"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    name="jumlah_peserta"
                    value={formData.jumlah_peserta}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kendala & Solusi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              Kendala & Solusi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kendala */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kendala
                </label>
                <textarea
                  name="kendala"
                  value={formData.kendala}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Kendala yang dihadapi (jika ada)..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Solusi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Solusi
                </label>
                <textarea
                  name="solusi"
                  value={formData.solusi}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Solusi yang dilakukan (jika ada)..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Link Referensi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-600" />
              Link Referensi
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link Terkait
              </label>
              <input
                type="url"
                name="link_referensi"
                value={formData.link_referensi}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Link dokumen, drive, atau referensi lain yang terkait
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              File Lampiran
            </h2>

            <div>
              <label className="block">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Klik untuk upload file atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, PDF, DOC, XLS (Max 5MB per file)
                  </p>
                </div>
              </label>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    File Terupload ({uploadedFiles.length})
                  </p>
                  {uploadedFiles.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {item.preview ? (
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(item.file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Catatan:</strong> File akan diupload setelah laporan
                    berhasil disimpan
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("Draft")}
                disabled={loading}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Simpan Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("Diajukan")}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Ajukan Laporan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

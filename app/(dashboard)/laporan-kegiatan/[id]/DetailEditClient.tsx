// app/laporan-kegiatan/[id]/DetailEditClient.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  FileText,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Edit3,
  Save,
  X,
  Upload,
  Trash2,
  Download,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { formatTanggal } from "@/lib/utils/formattanggal";

// ============================================================================
// INTERFACES
// ============================================================================

interface FileUpload {
  file_id: number;
  laporan_id: number;
  nama_file_asli: string;
  nama_file_sistem: string;
  path_file: string;
  tipe_file: string;
  ukuran_file: number;
  uploaded_by: number;
  uploader_nama: string;
  deskripsi_file: string | null;
  created_at: string;
}

interface LaporanDetail {
  laporan_id: number;
  pegawai_id: number;
  pegawai_nama: string;
  pegawai_nip: string;
  skpd: string;
  tanggal_kegiatan: string;
  kategori_id: number;
  nama_kategori: string;
  kode_kategori: string;
  nama_kegiatan: string;
  deskripsi_kegiatan: string;
  target_output: string | null;
  hasil_output: string | null;
  waktu_mulai: string;
  waktu_selesai: string;
  durasi_menit: number;
  lokasi_kegiatan: string | null;
  latitude: number | null;
  longitude: number | null;
  peserta_kegiatan: string | null;
  jumlah_peserta: number;
  file_bukti: string | null;
  link_referensi: string | null;
  kendala: string | null;
  solusi: string | null;
  status_laporan: string;
  tanggal_submit: string | null;
  verifikasi_oleh: number | null;
  verifikator_nama: string | null;
  tanggal_verifikasi: string | null;
  catatan_verifikasi: string | null;
  rating_kualitas: number | null;
  is_edited: number;
  edit_count: number;
  created_at: string;
  updated_at: string;
  files?: FileUpload[];
}

interface Kategori {
  kategori_id: number;
  nama_kategori: string;
  kode_kategori: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DetailEditClient() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // States
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canVerify, setCanVerify] = useState(false);
  const [laporan, setLaporan] = useState<LaporanDetail | null>(null);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    kategori_id: 0,
    nama_kegiatan: "",
    deskripsi_kegiatan: "",
    target_output: "",
    hasil_output: "",
    waktu_mulai: "",
    waktu_selesai: "",
    lokasi_kegiatan: "",
    latitude: null as number | null,
    longitude: null as number | null,
    peserta_kegiatan: "",
    jumlah_peserta: 0,
    link_referensi: "",
    kendala: "",
    solusi: "",
    status_laporan: "Draft",
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchData();
    fetchKategoris();
  }, [id]);

  // ============================================================================
  // FETCH FUNCTIONS
  // ============================================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const url = `/api/laporan-kegiatan/${id}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setLaporan(result.data);
        setCanEdit(result.canEdit);
        setCanVerify(result.canVerify || false);

        console.log("data: ", result.data);
        console.log("canVerify: ", result.canVerify); // Debug log

        // Set form data
        setFormData({
          kategori_id: result.data.kategori_id,
          nama_kegiatan: result.data.nama_kegiatan,
          deskripsi_kegiatan: result.data.deskripsi_kegiatan,
          target_output: result.data.target_output || "",
          hasil_output: result.data.hasil_output || "",
          waktu_mulai: result.data.waktu_mulai,
          waktu_selesai: result.data.waktu_selesai,
          lokasi_kegiatan: result.data.lokasi_kegiatan || "",
          latitude: result.data.latitude,
          longitude: result.data.longitude,
          peserta_kegiatan: result.data.peserta_kegiatan || "",
          jumlah_peserta: result.data.jumlah_peserta,
          link_referensi: result.data.link_referensi || "",
          kendala: result.data.kendala || "",
          solusi: result.data.solusi || "",
          status_laporan: result.data.status_laporan,
        });
      } else {
        console.log("FAILED - result.success is false");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message,
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        });
        //router.push("/laporan-kegiatan");
      }
    } catch (error) {
      console.error("CATCH ERROR:", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
    } finally {
      console.log("FINALLY - Setting loading to FALSE");
      setLoading(false);
      console.log("=== END FETCH ===");
    }
  };

  const fetchKategoris = async () => {
    try {
      const response = await fetch("/api/kategori");
      const result = await response.json();

      if (result.success) {
        setKategoris(result.data);
      }
    } catch (error) {
      console.error("Error fetching kategoris:", error);
    }
  };

  // ============================================================================
  // HANDLER FUNCTIONS
  // ============================================================================

  const handleNavigateToVerifikasi = () => {
    router.push(`/laporan-kegiatan/verifikasi/${id}`);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const markFileForDeletion = (fileId: number) => {
    Swal.fire({
      title: "Hapus File?",
      text: "File akan dihapus saat Anda menyimpan perubahan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#fff",
      color: document.documentElement.classList.contains("dark")
        ? "#fff"
        : "#000",
    }).then((result) => {
      if (result.isConfirmed) {
        setFilesToDelete((prev) => [...prev, fileId]);
      }
    });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      Swal.fire({
        title: "Mengambil Lokasi...",
        text: "Mohon tunggu",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          Swal.close();
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Lokasi berhasil diambil",
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
          Swal.close();
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Gagal mengambil lokasi: " + error.message,
            background: document.documentElement.classList.contains("dark")
              ? "#1f2937"
              : "#fff",
            color: document.documentElement.classList.contains("dark")
              ? "#fff"
              : "#000",
          });
        }
      );
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Geolocation tidak didukung oleh browser Anda",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nama_kegiatan.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Nama kegiatan harus diisi",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
      return;
    }

    if (!formData.deskripsi_kegiatan.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Deskripsi kegiatan harus diisi",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
      return;
    }

    if (!formData.waktu_mulai || !formData.waktu_selesai) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Waktu mulai dan selesai harus diisi",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
      return;
    }

    Swal.fire({
      title: "Menyimpan...",
      text: "Mohon tunggu",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#fff",
      color: document.documentElement.classList.contains("dark")
        ? "#fff"
        : "#000",
    });

    try {
      // Upload new files first if any
      if (newFiles.length > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append("laporan_id", id);
        newFiles.forEach((file) => {
          uploadFormData.append("files", file);
        });

        const uploadResponse = await fetch("/api/file-upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Gagal mengupload file");
        }
      }

      // Delete marked files if any
      if (filesToDelete.length > 0) {
        for (const fileId of filesToDelete) {
          await fetch(`/api/file-upload/${fileId}`, {
            method: "DELETE",
          });
        }
      }

      const normalizedFormData = {
        ...formData,
        waktu_mulai: normalizeTimeFormat(formData.waktu_mulai),
        waktu_selesai: normalizeTimeFormat(formData.waktu_selesai),
      };

      // Update laporan
      const response = await fetch(`/api/laporan-kegiatan/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedFormData),
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Laporan berhasil diperbarui",
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000",
        }).then(() => {
          setIsEditMode(false);
          setNewFiles([]);
          setFilesToDelete([]);
          fetchData();
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error saving:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Terjadi kesalahan saat menyimpan data",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
    }
  };

  const handlePromoteDraft = async () => {
    if (!laporan) return;

    const confirmation = await Swal.fire({
      title: "Ajukan Laporan?",
      text: "Laporan akan dinaikkan statusnya menjadi Diajukan.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Ajukan",
      cancelButtonText: "Batal",
      background: document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#fff",
      color: document.documentElement.classList.contains("dark")
        ? "#fff"
        : "#000",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    Swal.fire({
      title: "Mengajukan...",
      text: "Mohon tunggu",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#fff",
      color: document.documentElement.classList.contains("dark")
        ? "#fff"
        : "#000",
    });

    try {
      const response = await fetch(`/api/laporan-kegiatan/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          waktu_mulai: normalizeTimeFormat(formData.waktu_mulai),
          waktu_selesai: normalizeTimeFormat(formData.waktu_selesai),
          status_laporan: "Diajukan",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || result.error || "Gagal mengajukan laporan"
        );
      }

      Swal.close();

      setFormData((prev) => ({
        ...prev,
        status_laporan: "Diajukan",
      }));
      setLaporan((prev) =>
        prev
          ? {
              ...prev,
              status_laporan: "Diajukan",
            }
          : prev
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Laporan berhasil diajukan",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
    } catch (error: any) {
      console.error("Error promoting draft:", error);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Terjadi kesalahan saat mengajukan laporan",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#fff",
        color: document.documentElement.classList.contains("dark")
          ? "#fff"
          : "#000",
      });
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string; icon: any }> = {
      Draft: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        text: "Draft",
        icon: FileText,
      },
      Diajukan: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        text: "Diajukan",
        icon: Clock,
      },
      Diverifikasi: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        text: "Diverifikasi",
        icon: CheckCircle,
      },
      Ditolak: {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        text: "Ditolak",
        icon: X,
      },
      Revisi: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        text: "Revisi",
        icon: AlertCircle,
      },
    };

    const badge = badges[status] || badges["Draft"];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} jam ${mins} menit`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const normalizeTimeFormat = (time: string): string => {
    if (!time) return time;
    const parts = time.split(":");
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`; // Ambil hanya HH:MM
    }
    return time;
  };

  // ============================================================================
  // RENDER - PROPER ORDER (CHECK LOADING FIRST!)
  // ============================================================================

  // 1. CHECK LOADING FIRST - Most important!
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Memuat data...
          </p>
        </div>
      </div>
    );
  }

  // 2. CHECK DATA ONLY AFTER LOADING COMPLETE
  if (!laporan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Laporan tidak ditemukan
          </p>
        </div>
      </div>
    );
  }

  // 3. RENDER MAIN CONTENT (data is guaranteed to exist here)

  // ============================================================================
  // MAIN RENDER - CONTINUED IN NEXT COMMENT
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Detail Laporan Kegiatan
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                ID: #{laporan.laporan_id}
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditMode &&
                canVerify &&
                laporan.status_laporan === "Diajukan" && (
                  <button
                    type="button"
                    onClick={handleNavigateToVerifikasi}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Verifikasi
                  </button>
                )}
              {!isEditMode && canEdit && laporan.status_laporan === "Draft" && (
                <button
                  type="button"
                  onClick={handlePromoteDraft}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  Ajukan
                </button>
              )}
              {!isEditMode && canEdit && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
              {isEditMode && (
                <>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setNewFiles([]);
                      setFilesToDelete([]);
                      fetchData();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Save className="w-4 h-4" />
                    Simpan
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => router.push("/laporan-kegiatan")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Kembali
              </button>
            </div>
          </div>

          {/* Status and Info */}
          <div className="flex flex-wrap gap-4 items-center">
            {getStatusBadge(laporan.status_laporan)}
            {laporan.is_edited === 1 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Telah diedit {laporan.edit_count}x
              </span>
            )}
            {laporan.rating_kualitas && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < laporan.rating_kualitas!
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }>
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FORM CONTINUED - SEE NEXT FILE PART */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Pegawai */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informasi Pegawai
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Pegawai
                </label>
                <p className="text-gray-900 dark:text-white">
                  {laporan.pegawai_nama}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  NIP
                </label>
                <p className="text-gray-900 dark:text-white">
                  {laporan.pegawai_nip}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Satuan Kerja
                </label>
                <p className="text-gray-900 dark:text-white">{laporan.skpd}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detail Kegiatan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tanggal Kegiatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Tanggal Kegiatan
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(laporan.tanggal_kegiatan).toLocaleDateString(
                    "id-ID",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori
                </label>
                {isEditMode ? (
                  <select
                    name="kategori_id"
                    value={formData.kategori_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required>
                    <option value="">Pilih Kategori</option>
                    {kategoris.map((kat) => (
                      <option key={kat.kategori_id} value={kat.kategori_id}>
                        {kat.kode_kategori} - {kat.nama_kategori}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {laporan.kode_kategori} - {laporan.nama_kategori}
                  </p>
                )}
              </div>

              {/* Nama Kegiatan */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Kegiatan
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="nama_kegiatan"
                    value={formData.nama_kegiatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {laporan.nama_kegiatan}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi Kegiatan
                </label>
                {isEditMode ? (
                  <textarea
                    name="deskripsi_kegiatan"
                    value={formData.deskripsi_kegiatan}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {laporan.deskripsi_kegiatan}
                  </p>
                )}
              </div>

              {/* Target Output */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Output
                </label>
                {isEditMode ? (
                  <textarea
                    name="target_output"
                    value={formData.target_output}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {laporan.target_output || "-"}
                  </p>
                )}
              </div>

              {/* Hasil Output */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hasil Output
                </label>
                {isEditMode ? (
                  <textarea
                    name="hasil_output"
                    value={formData.hasil_output}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {laporan.hasil_output || "-"}
                  </p>
                )}
              </div>

              {/* Waktu Mulai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Waktu Mulai
                </label>
                {isEditMode ? (
                  <input
                    type="time"
                    name="waktu_mulai"
                    value={formData.waktu_mulai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {laporan.waktu_mulai}
                  </p>
                )}
              </div>

              {/* Waktu Selesai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Waktu Selesai
                </label>
                {isEditMode ? (
                  <input
                    type="time"
                    name="waktu_selesai"
                    value={formData.waktu_selesai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {laporan.waktu_selesai}
                  </p>
                )}
              </div>

              {/* Durasi */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durasi
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDuration(laporan.durasi_menit)}
                </p>
              </div>

              {/* Lokasi */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Lokasi Kegiatan
                </label>
                {isEditMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="lokasi_kegiatan"
                      value={formData.lokasi_kegiatan}
                      onChange={handleInputChange}
                      placeholder="Nama lokasi"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude || ""}
                        onChange={handleInputChange}
                        placeholder="Latitude"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude || ""}
                        onChange={handleInputChange}
                        placeholder="Longitude"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-900 dark:text-white">
                      {laporan.lokasi_kegiatan || "-"}
                    </p>
                    {laporan.latitude && laporan.longitude && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Koordinat: {laporan.latitude}, {laporan.longitude}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Jumlah Peserta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Jumlah Peserta
                </label>
                {isEditMode ? (
                  <input
                    type="number"
                    name="jumlah_peserta"
                    value={formData.jumlah_peserta}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {laporan.jumlah_peserta}
                  </p>
                )}
              </div>

              {/* Daftar Peserta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Daftar Peserta
                </label>
                {isEditMode ? (
                  <textarea
                    name="peserta_kegiatan"
                    value={formData.peserta_kegiatan}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Pisahkan dengan koma"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {laporan.peserta_kegiatan || "-"}
                  </p>
                )}
              </div>

              {/* Link Referensi */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Link Referensi
                </label>
                {isEditMode ? (
                  <input
                    type="url"
                    name="link_referensi"
                    value={formData.link_referensi}
                    onChange={handleInputChange}
                    placeholder="https://"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : laporan.link_referensi ? (
                  <a
                    href={laporan.link_referensi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline">
                    {laporan.link_referensi}
                  </a>
                ) : (
                  <p className="text-gray-900 dark:text-white">-</p>
                )}
              </div>

              {/* Kendala */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Kendala
                </label>
                {isEditMode ? (
                  <textarea
                    name="kendala"
                    value={formData.kendala}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {laporan.kendala || "-"}
                  </p>
                )}
              </div>

              {/* Solusi */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Solusi
                </label>
                {isEditMode ? (
                  <textarea
                    name="solusi"
                    value={formData.solusi}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {laporan.solusi || "-"}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              File Bukti
            </h2>

            {/* Existing Files */}
            {laporan.files && laporan.files.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File yang sudah ada
                </h3>
                <div className="space-y-2">
                  {laporan.files
                    .filter((file) => !filesToDelete.includes(file.file_id))
                    .map((file) => (
                      <div
                        key={file.file_id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.nama_file_asli}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatFileSize(file.ukuran_file)} • Diupload oleh{" "}
                            {file.uploader_nama}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={file.path_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </a>
                          <a
                            href={file.path_file}
                            download
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                          </a>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={() => markFileForDeletion(file.file_id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* New Files Upload */}
            {isEditMode && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tambah file baru
                </h3>
                <div className="mb-4">
                  <label className="block">
                    <span className="sr-only">Choose files</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-200
                        hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                    />
                  </label>
                </div>

                {newFiles.length > 0 && (
                  <div className="space-y-2">
                    {newFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewFile(index)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verifikasi Info - if Diverifikasi */}
          {laporan.status_laporan === "Diverifikasi" && (
            <div className="bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700 p-6">
              <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                Informasi Verifikasi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                    Diverifikasi oleh
                  </label>
                  <p className="text-green-900 dark:text-green-100">
                    {laporan.verifikator_nama}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                    Tanggal Verifikasi
                  </label>
                  <p className="text-green-900 dark:text-green-100">
                    {laporan.tanggal_verifikasi
                      ? new Date(laporan.tanggal_verifikasi).toLocaleString(
                          "id-ID"
                        )
                      : "-"}
                  </p>
                </div>
                {laporan.catatan_verifikasi && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                      Catatan Verifikasi
                    </label>
                    <p className="text-green-900 dark:text-green-100 whitespace-pre-wrap">
                      {laporan.catatan_verifikasi}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Penolakan Info - if Ditolak */}
          {laporan.status_laporan === "Ditolak" &&
            laporan.catatan_verifikasi && (
              <div className="bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700 p-6">
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
                  Alasan Penolakan
                </h2>
                <p className="text-red-900 dark:text-red-100 whitespace-pre-wrap">
                  {laporan.catatan_verifikasi}
                </p>
              </div>
            )}

          {/* Timestamp Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Dibuat:{" "}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatTanggal(laporan.created_at)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Terakhir diupdate:{" "}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatTanggal(laporan.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

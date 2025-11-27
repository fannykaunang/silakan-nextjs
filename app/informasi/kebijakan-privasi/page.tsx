// app/(public)/kebijakan-privasi/page.tsx
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  FileText,
  ArrowLeft,
  Server,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Bell,
  MapPin,
  Camera,
  Phone,
} from "lucide-react";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import { getAppSettings } from "@/lib/models/app-settings-model";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Kebijakan Privasi",
    description:
      "Kebijakan privasi dan perlindungan data pribadi pengguna aplikasi",
    path: "/kebijakan-privasi",
  });
}

export default async function PrivacyPolicyPage() {
  // Fetch app settings from database
  const settings = await getAppSettings();

  // Fallback values jika settings tidak ada
  const appName = settings?.nama_aplikasi || "IZAKOD-ASN";
  const appAlias = settings?.alias_aplikasi || "IZAKOD-ASN";
  const appDescription =
    settings?.nama_aplikasi || "Integrasi Laporan Kegiatan Online Digital ASN";
  const copyright = settings?.copyright || "Pemerintah Kabupaten Merauke";
  const year = settings?.tahun || new Date().getFullYear();

  // Contact info
  const email = settings?.email || "admin@izakod-asn.merauke.go.id";
  const whatsapp =
    settings?.whatsapp || settings?.no_telepon || "+62 XXX-XXXX-XXXX";
  const address =
    settings?.alamat || "Jl. Raya Mandala, Maro, Merauke, Papua Selatan";
  const instansiNama =
    settings?.instansi_nama ||
    "Dinas Komunikasi dan Informatika Kabupaten Merauke";

  // Technical settings
  const timezone = settings?.timezone || "Asia/Jayapura";
  const sessionTimeout = settings?.session_timeout || 120;
  const maxUploadSize = settings?.max_upload_size || 5;
  const logRetentionDays = settings?.log_retention_days || 90;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Kembali</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {appAlias}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {copyright}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <Shield className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Komitmen kami dalam melindungi data pribadi Anda pada aplikasi{" "}
            {appAlias}
            <br />
            <span className="text-sm">({appDescription})</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Terakhir diperbarui: 21 November 2025
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 md:p-12 space-y-10">
            {/* Section 1: Pendahuluan */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    1. Pendahuluan
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      <strong>{copyright}</strong> berkomitmen untuk melindungi
                      privasi dan keamanan data pribadi Anda. Kebijakan Privasi
                      ini menjelaskan bagaimana kami mengumpulkan, menggunakan,
                      menyimpan, dan melindungi informasi pribadi Anda saat
                      menggunakan aplikasi
                      <strong> {appAlias}</strong> ({appName}).
                    </p>
                    <p>
                      Dengan menggunakan {appAlias}, Anda menyetujui pengumpulan
                      dan penggunaan informasi sesuai dengan kebijakan ini. Jika
                      Anda tidak setuju, mohon untuk tidak menggunakan aplikasi.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Data yang Dikumpulkan */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    2. Data yang Kami Kumpulkan
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        2.1 Data Pribadi
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Kami mengumpulkan informasi pribadi yang diperlukan
                        untuk identifikasi dan pengelolaan akun ASN:
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 space-y-2">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>Data Identitas:</strong> Nama lengkap, NIP
                            (Nomor Induk Pegawai), NIK (Nomor Induk
                            Kependudukan)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>Data Kontak:</strong> Email, nomor
                            telepon/WhatsApp
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>Data Kepegawaian:</strong> SKPD, jabatan,
                            pangkat/golongan, status kepegawaian
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>Kredensial Akun:</strong> PIN/password
                            (tersimpan dalam bentuk terenkripsi)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        2.2 Data Kegiatan
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Data yang terkait dengan laporan kegiatan harian Anda:
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 space-y-2">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            Nama kegiatan, deskripsi detail, kategori kegiatan
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            Tanggal, waktu mulai dan selesai, durasi kegiatan
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            Lokasi kegiatan (koordinat GPS jika diaktifkan)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            Bukti kegiatan (foto atau dokumen PDF yang diunggah,
                            maksimal {maxUploadSize}MB)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            Status verifikasi, rating, dan feedback dari atasan
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Server className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        2.3 Data Teknis
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Data teknis yang dikumpulkan secara otomatis untuk
                        keamanan dan audit:
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 space-y-2">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>IP Address:</strong> Alamat IP perangkat
                            yang digunakan untuk akses
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>User Agent:</strong> Informasi browser dan
                            sistem operasi
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>Activity Log:</strong> Waktu login, logout,
                            dan aktivitas dalam aplikasi (disimpan selama{" "}
                            {logRetentionDays} hari)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>Session Data:</strong> Token sesi
                            terenkripsi untuk autentikasi
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                        2.4 Data Kehadiran (Integrasi E-NTAGO)
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Data kehadiran yang disinkronisasi dari sistem E-NTAGO:
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 space-y-2">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            Status kehadiran harian (Hadir, Izin, Sakit, Alpa,
                            Cuti, Dinas Luar)
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            Waktu check-in dan check-out
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            Rekap kehadiran bulanan
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Cara Kami Menggunakan Data */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    3. Cara Kami Menggunakan Data Anda
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Data pribadi yang kami kumpulkan digunakan untuk tujuan
                      berikut:
                    </p>

                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border-l-4 border-blue-600 dark:border-blue-400">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Manajemen Akun & Autentikasi
                        </h4>
                        <p>
                          Memverifikasi identitas Anda, mengelola akun pengguna,
                          dan memberikan akses ke aplikasi
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border-l-4 border-green-600 dark:border-green-400">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                          Pelaporan Kegiatan
                        </h4>
                        <p>
                          Mencatat, menyimpan, dan menampilkan laporan kegiatan
                          harian yang Anda buat. Data ini digunakan untuk
                          monitoring kinerja dan evaluasi produktivitas ASN.
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5 border-l-4 border-purple-600 dark:border-purple-400">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          Notifikasi WhatsApp
                        </h4>
                        <p>
                          Mengirimkan reminder otomatis untuk pengisian laporan,
                          notifikasi verifikasi, dan informasi penting terkait
                          aplikasi ke nomor WhatsApp Anda yang terdaftar.
                        </p>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5 border-l-4 border-orange-600 dark:border-orange-400">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          Keamanan & Audit Trail
                        </h4>
                        <p>
                          Memantau aktivitas mencurigakan, mencegah
                          penyalahgunaan, dan melakukan investigasi jika terjadi
                          pelanggaran. Semua aktivitas dicatat untuk
                          transparansi.
                        </p>
                      </div>

                      <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-5 border-l-4 border-pink-600 dark:border-pink-400">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Database className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                          Statistik & Analisis
                        </h4>
                        <p>
                          Menghasilkan dashboard statistik, rekap kinerja
                          bulanan, dan analisis produktivitas untuk keperluan
                          manajemen dan pengambilan keputusan.
                        </p>
                      </div>

                      <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-5 border-l-4 border-teal-600 dark:border-teal-400">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          Sinkronisasi E-NTAGO
                        </h4>
                        <p>
                          Mengintegrasikan data kehadiran dari sistem E-NTAGO
                          untuk menampilkan informasi kehadiran yang lengkap di
                          dashboard Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Penyimpanan dan Keamanan Data */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    4. Penyimpanan dan Keamanan Data
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                        4.1 Lokasi Penyimpanan
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Data Anda disimpan di server yang dikelola oleh
                        {copyright} dengan infrastruktur sebagai berikut:
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 space-y-2">
                        <div className="flex items-start gap-3">
                          <Server className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>Database MySQL</strong> dengan backup
                            otomatis harian
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Server className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>File Storage</strong> untuk bukti kegiatan
                            (foto/PDF) dengan enkripsi
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Server className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <p className="text-gray-700 dark:text-gray-300">
                            <strong>Server Lokal</strong> di Data Center Pemkab
                            Merauke (bukan cloud publik)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                        4.2 Keamanan Data
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Kami menerapkan berbagai langkah keamanan untuk
                        melindungi data Anda:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Enkripsi
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                Komunikasi HTTPS/TLS, password terenkripsi
                                dengan bcrypt/iron-session
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Autentikasi
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                Session-based authentication dengan token
                                terenkripsi, rate limiting anti brute-force
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-start gap-3">
                            <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Akses Terbatas
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                Role-based access control (RBAC), setiap
                                pengguna hanya bisa akses data sesuai level
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                          <div className="flex items-start gap-3">
                            <Server className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Monitoring
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                Audit trail lengkap, logging semua aktivitas,
                                deteksi anomali otomatis
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                        4.3 Retensi Data
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Data laporan kegiatan dan kehadiran Anda akan disimpan{" "}
                        <strong>selama masa kepegawaian aktif</strong>
                        ditambah <strong>5 tahun</strong> setelah
                        pensiun/berhenti untuk keperluan arsip dan audit.
                        Setelah periode tersebut, data akan dihapus secara
                        permanen kecuali diwajibkan oleh hukum untuk disimpan
                        lebih lama.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Pembagian Data */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    5. Pembagian Data dengan Pihak Ketiga
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Kami <strong>tidak menjual atau menyewakan</strong> data
                      pribadi Anda kepada pihak ketiga untuk tujuan komersial.
                      Namun, kami dapat membagikan data dalam kondisi berikut:
                    </p>

                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 border-l-4 border-blue-600 dark:border-blue-400">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Dengan Instansi Pemerintah
                        </h4>
                        <p>
                          Data dapat dibagikan dengan instansi pemerintah lain
                          (BKD, Inspektorat, dll) untuk keperluan pengawasan,
                          audit, atau evaluasi kinerja ASN sesuai ketentuan
                          perundang-undangan.
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 border-l-4 border-green-600 dark:border-green-400">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                          Dengan Penyedia Layanan WhatsApp
                        </h4>
                        <p>
                          Nomor WhatsApp dan konten notifikasi dibagikan dengan
                          layanan WhatsApp API untuk mengirimkan reminder dan
                          notifikasi. Kami menggunakan gateway WhatsApp resmi
                          yang terpercaya dan aman.
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 border-l-4 border-purple-600 dark:border-purple-400">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          Integrasi dengan E-NTAGO
                        </h4>
                        <p>
                          Data kehadiran disinkronisasi dari sistem E-NTAGO
                          milik Pemkab Merauke. Tidak ada pembagian data ke
                          pihak eksternal lainnya.
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 border-l-4 border-red-600 dark:border-red-400">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          Kewajiban Hukum
                        </h4>
                        <p>
                          Jika diwajibkan oleh hukum atau perintah pengadilan,
                          kami akan membagikan data yang relevan kepada penegak
                          hukum atau instansi berwenang.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Hak Pengguna */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    6. Hak Anda Terkait Data Pribadi
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Sebagai pengguna {appAlias}, Anda memiliki hak-hak
                      berikut:
                    </p>

                    <div className="grid gap-4">
                      <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0">
                          <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Hak Akses
                          </h4>
                          <p className="text-sm">
                            Anda berhak mengakses dan melihat data pribadi yang
                            kami simpan tentang Anda melalui menu Profil di
                            aplikasi.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Hak Pembaruan
                          </h4>
                          <p className="text-sm">
                            Anda dapat memperbarui informasi kontak (email,
                            nomor WhatsApp) melalui menu Profil. Untuk data
                            kepegawaian, hubungi Administrator.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center shrink-0">
                          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Hak Keberatan
                          </h4>
                          <p className="text-sm">
                            Anda dapat mengajukan keberatan terkait penggunaan
                            data Anda dengan menghubungi Administrator melalui
                            kontak yang tersedia.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center shrink-0">
                          <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Hak Portabilitas
                          </h4>
                          <p className="text-sm">
                            Anda dapat meminta salinan data laporan kegiatan
                            Anda dalam format yang dapat dibaca mesin (Excel,
                            PDF) melalui fitur export di aplikasi.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center shrink-0">
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Catatan Penting
                          </h4>
                          <p className="text-sm">
                            Karena {appAlias} adalah sistem resmi pemerintah,{" "}
                            <strong>
                              penghapusan data tidak dapat dilakukan
                            </strong>
                            tanpa prosedur administratif yang sesuai. Data hanya
                            akan dihapus jika masa retensi telah habis atau ada
                            perintah resmi dari pejabat berwenang.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Cookies & Tracking */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    7. Cookies dan Teknologi Pelacakan
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      {appAlias} menggunakan cookies dan teknologi serupa untuk:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Session Cookies:</strong> Menyimpan token
                        autentikasi terenkripsi untuk menjaga sesi login Anda
                        tetap aktif
                      </li>
                      <li>
                        <strong>Preference Cookies:</strong> Menyimpan
                        preferensi Anda seperti dark mode
                      </li>
                      <li>
                        <strong>Security Cookies:</strong> Melindungi dari
                        serangan CSRF dan XSS
                      </li>
                    </ul>
                    <p className="mt-4">
                      Kami <strong>tidak menggunakan</strong> cookies untuk
                      iklan atau tracking pihak ketiga. Semua cookies yang kami
                      gunakan hanya untuk keperluan fungsionalitas dan keamanan
                      aplikasi.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Perubahan Kebijakan */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    8. Perubahan Kebijakan Privasi
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke
                      waktu untuk mencerminkan perubahan dalam praktik kami atau
                      untuk alasan operasional, hukum, atau regulasi lainnya.
                    </p>
                    <p>
                      Jika terjadi perubahan material, kami akan memberitahu
                      Anda melalui:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Notifikasi di aplikasi</li>
                      <li>Notifikasi WhatsApp ke nomor terdaftar</li>
                      <li>Email ke alamat email terdaftar</li>
                    </ul>
                    <p className="mt-4">
                      Tanggal "Terakhir diperbarui" di bagian atas halaman ini
                      menunjukkan kapan kebijakan terakhir kali direvisi.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Kontak */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    9. Hubungi Kami
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Jika Anda memiliki pertanyaan, kekhawatiran, atau
                      permintaan terkait privasi dan perlindungan data pribadi
                      Anda, silakan hubungi:
                    </p>
                    <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 space-y-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-lg mb-3">
                          Data Protection Officer (DPO) {appAlias}
                        </p>
                        <div className="space-y-2">
                          <p className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Alamat:</strong>
                              <br />
                              {instansiNama}
                              <br />
                              {address}
                              <br />
                              Papua Selatan 99611
                            </span>
                          </p>
                          <p className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span>
                              <strong>Email:</strong> {email}
                            </span>
                          </p>
                          <p className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span>
                              <strong>WhatsApp:</strong> {whatsapp}{" "}
                              (Senin-Jumat, 08:00-16:00 {timezone})
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Kami akan merespons pertanyaan Anda dalam waktu{" "}
                          <strong>7 hari kerja</strong>
                          setelah menerima permintaan yang lengkap dan valid.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Closing Statement */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8 text-center">
                <Shield className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Komitmen Kami terhadap Privasi Anda
                </h3>
                <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                  Perlindungan data pribadi Anda adalah prioritas kami. Kami
                  berkomitmen untuk mengelola data Anda dengan penuh tanggung
                  jawab, transparansi, dan sesuai dengan peraturan
                  perundang-undangan yang berlaku di Indonesia.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    href="/ketentuan-penggunaan"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 rounded-lg hover:shadow-lg transition-all font-semibold border border-green-200 dark:border-green-800">
                    <FileText className="w-5 h-5" />
                    Baca Ketentuan Penggunaan
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
                    <Users className="w-5 h-5" />
                    Masuk ke {appAlias}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-500">
          <p>
            © {year} {copyright}. All rights reserved.
          </p>
          <p className="mt-2">
            {appAlias} - {appName}
          </p>
          <p className="mt-2">
            Dilindungi oleh UU No. 27 Tahun 2022 tentang Perlindungan Data
            Pribadi
          </p>
        </div>
      </main>
    </div>
  );
}

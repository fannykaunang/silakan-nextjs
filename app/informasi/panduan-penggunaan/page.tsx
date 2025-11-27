// app/(public)/panduan-penggunaan/page.tsx
import Link from "next/link";
import {
  BookOpen,
  KeyRound,
  Edit,
  Printer,
  Bell,
  CheckCircle,
  ArrowLeft,
  Users,
  UserCog,
  ChevronRight,
  Info,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  Calendar,
  Plus,
  Save,
  Download,
  Eye,
  Trash2,
  MessageSquare,
  Star,
  Building2,
  ShieldCheck,
  CircleDot,
  FilePlus,
  FileEdit,
  BellRing,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  ListChecks,
  Settings,
  Workflow,
  LayoutTemplate,
  Copy,
  CheckSquare,
  XCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { getAppSettings } from "@/lib/models/app-settings-model";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Panduan Penggunaan",
    description: "Panduan lengkap cara menggunakan aplikasi",
    path: "/panduan-penggunaan",
  });
}

export default async function PanduanPenggunaanPage() {
  // Fetch app settings from database
  const settings = await getAppSettings();
  const appName = settings?.nama_aplikasi || "IZAKOD-ASN";
  const currentYear = settings?.tahun || new Date().getFullYear();
  const appAlias = settings?.alias_aplikasi || "IZAKOD-ASN";
  const appDescription =
    settings?.nama_aplikasi || "Integrasi Laporan Kegiatan Online Digital ASN";
  const copyright = settings?.copyright || "Pemerintah Kabupaten Merauke";

  // Contact info
  const email = settings?.email || "support@izakod-asn.merauke.go.id";
  const whatsapp =
    settings?.whatsapp || settings?.no_telepon || "+62 XXX-XXXX-XXXX";
  const address =
    settings?.alamat || "Jl. TMP Trikora nO. 78, Maro, Merauke, Papua Selatan";
  const instansiNama =
    settings?.instansi_nama ||
    "Dinas Komunikasi dan Informatika Kabupaten Merauke";

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Kembali</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
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

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-amber-600 to-orange-600 opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-5xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Panduan Penggunaan Aplikasi
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Petunjuk lengkap cara menggunakan aplikasi {appAlias}
              <br />
              <span className="text-sm">({appDescription})</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4 mb-8">
              Terakhir diperbarui: 21 November 2025
            </p>
            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/uploads/panduan-penggunaan-izakod-asn.pdf"
                download
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 group">
                <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Unduh Panduan
                </span>
              </Link>
              <a
                href="#user-pegawai"
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 group">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Panduan Pegawai
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#user-atasan"
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 group">
                <UserCog className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Panduan Atasan
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-8 bg-white/50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-amber-600" />
              Daftar Isi
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* User Pegawai */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Panduan Pegawai
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#mendapatkan-akun"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      <ChevronRight className="w-3 h-3" />
                      Cara Mendapatkan Akun
                    </a>
                  </li>
                  <li>
                    <a
                      href="#membuat-laporan"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      <ChevronRight className="w-3 h-3" />
                      Cara Membuat Laporan Kegiatan
                    </a>
                  </li>
                  <li>
                    <a
                      href="#mengedit-laporan"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      <ChevronRight className="w-3 h-3" />
                      Cara Mengedit Laporan Kegiatan
                    </a>
                  </li>
                  <li>
                    <a
                      href="#mencetak-laporan"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      <ChevronRight className="w-3 h-3" />
                      Cara Mencetak Laporan Kegiatan
                    </a>
                  </li>
                  <li>
                    <a
                      href="#template-kegiatan"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      <ChevronRight className="w-3 h-3" />
                      Cara Membuat Template Kegiatan
                    </a>
                  </li>
                  <li>
                    <a
                      href="#reminder"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      <ChevronRight className="w-3 h-3" />
                      Cara Mengatur Reminder
                    </a>
                  </li>
                </ul>
              </div>

              {/* User Atasan */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                  <UserCog className="w-4 h-4" />
                  Panduan Atasan
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#verifikasi-laporan"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                      <ChevronRight className="w-3 h-3" />
                      Cara Memverifikasi Laporan Bawahan
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* ============================================= */}
          {/* SECTION: PANDUAN USER PEGAWAI */}
          {/* ============================================= */}
          <section id="user-pegawai" className="mb-16">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-blue-200 dark:border-blue-800">
              <div className="shrink-0 w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Panduan untuk Pegawai
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Petunjuk lengkap penggunaan aplikasi untuk ASN
                </p>
              </div>
            </div>

            {/* ------------------------------------------- */}
            {/* 1. Cara Mendapatkan Akun */}
            {/* ------------------------------------------- */}
            <div
              id="mendapatkan-akun"
              className="mb-12 scroll-mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      1. Cara Mendapatkan Akun (Username & Password)
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Langkah awal untuk mengakses aplikasi {appName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-semibold mb-1">Informasi Penting</p>
                      <p>
                        Akun {appName} terintegrasi dengan sistem{" "}
                        <strong>E-NTAGO</strong>. Untuk mendapatkan akses, Anda
                        perlu menghubungi Operator Web E-NTAGO di SKPD
                        masing-masing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-blue-600" />
                    Langkah-langkah:
                  </h4>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Hubungi Operator Web E-NTAGO di SKPD Anda
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Setiap SKPD memiliki operator yang bertanggung jawab
                          mengelola akun pegawai. Anda dapat menghubungi
                          operator melalui:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-center gap-2">
                            <CircleDot className="w-3 h-3 text-blue-500" />
                            Datang langsung ke ruangan operator
                          </li>
                          <li className="flex items-center gap-2">
                            <CircleDot className="w-3 h-3 text-blue-500" />
                            Menghubungi via WhatsApp atau telepon internal
                          </li>
                          <li className="flex items-center gap-2">
                            <CircleDot className="w-3 h-3 text-blue-500" />
                            Mengirim email resmi ke operator
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Siapkan Data yang Diperlukan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Pastikan Anda menyiapkan informasi berikut:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            NIP (Nomor Induk Pegawai)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Nama lengkap sesuai data kepegawaian
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Nomor WhatsApp aktif (untuk notifikasi)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Email aktif (opsional)
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Terima Kredensial Login
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Setelah operator membuatkan akun, Anda akan menerima:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-blue-500" />
                            <strong>Username/Email</strong>: Biasanya NIP atau
                            email resmi
                          </li>
                          <li className="flex items-center gap-2">
                            <KeyRound className="w-3 h-3 text-blue-500" />
                            <strong>Password</strong>: Password sementara yang
                            harus segera diganti
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Login dan Ganti Password
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Akses halaman login {appName}, masukkan kredensial,
                          dan segera ganti password default untuk keamanan akun
                          Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Box */}
                <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-semibold mb-1">Perhatian!</p>
                      <ul className="space-y-1">
                        <li>• Jangan bagikan password Anda kepada siapapun</li>
                        <li>
                          • Segera ganti password default setelah login pertama
                        </li>
                        <li>
                          • Jika lupa password, hubungi kembali operator E-NTAGO
                          SKPD
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------- */}
            {/* 2. Cara Membuat Laporan Kegiatan */}
            {/* ------------------------------------------- */}
            <div
              id="membuat-laporan"
              className="mb-12 scroll-mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FilePlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      2. Cara Membuat Laporan Kegiatan
                    </h3>
                    <p className="text-green-100 text-sm">
                      Halaman: Laporan Kegiatan → Tambah Laporan
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Prerequisite Box */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <p className="font-semibold mb-1">Syarat Penting!</p>
                      <p>
                        Tanggal kegiatan yang diajukan{" "}
                        <strong>harus sudah tercatat absen</strong> di sistem
                        E-NTAGO. Jika Anda belum absen pada tanggal tersebut,
                        laporan tidak dapat dibuat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-green-600" />
                    Langkah-langkah Membuat Laporan:
                  </h4>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Akses Menu Laporan Kegiatan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Dari sidebar, klik menu{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Laporan Kegiatan
                          </code>{" "}
                          →{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Tambah Laporan
                          </code>
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Pilih Tanggal Kegiatan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Pilih tanggal kegiatan dari kalender. Sistem akan
                          otomatis memvalidasi apakah Anda sudah absen pada
                          tanggal tersebut.
                        </p>
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Tanggal dengan tanda ✓ hijau = sudah absen (bisa
                            digunakan)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Isi Detail Kegiatan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Lengkapi form dengan informasi berikut:
                        </p>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>
                              <strong>Judul/Nama Kegiatan</strong>: Deskripsi
                              singkat kegiatan yang dilakukan
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>
                              <strong>Uraian Kegiatan</strong>: Penjelasan
                              detail aktivitas yang dikerjakan
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>
                              <strong>Jam Mulai & Selesai</strong>: Waktu
                              pelaksanaan kegiatan
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>
                              <strong>Output/Hasil</strong>: Hasil yang dicapai
                              dari kegiatan
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>
                              <strong>Bukti Kegiatan</strong> (opsional): Upload
                              foto atau dokumen pendukung
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Gunakan Template (Opsional)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Jika Anda memiliki template kegiatan yang sudah
                          disimpan, klik tombol{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Gunakan Template
                          </code>{" "}
                          untuk mengisi form secara otomatis.
                        </p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                        5
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Simpan dan Ajukan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Klik tombol{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm">
                            <Save className="w-3 h-3" /> Simpan & Ajukan
                          </span>{" "}
                          untuk mengirim laporan ke atasan untuk diverifikasi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips Box */}
                <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <p className="font-semibold mb-1">Tips:</p>
                      <ul className="space-y-1">
                        <li>
                          • Buat template untuk kegiatan rutin agar lebih
                          efisien
                        </li>
                        <li>
                          • Upload bukti kegiatan untuk mempercepat verifikasi
                        </li>
                        <li>
                          • Isi laporan setiap hari untuk menghindari penumpukan
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------- */}
            {/* 3. Cara Mengedit Laporan Kegiatan */}
            {/* ------------------------------------------- */}
            <div
              id="mengedit-laporan"
              className="mb-12 scroll-mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-linear-to-r from-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileEdit className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      3. Cara Mengedit Laporan Kegiatan
                    </h3>
                    <p className="text-amber-100 text-sm">
                      Halaman: Laporan Kegiatan → Detail Laporan
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Important Notice */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-semibold mb-2">
                        Ketentuan Edit Laporan:
                      </p>
                      <p>
                        Laporan <strong>hanya dapat diedit</strong> jika
                        statusnya masih{" "}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded font-medium">
                          <Clock className="w-3 h-3" /> Diajukan
                        </span>
                      </p>
                      <div className="mt-3 space-y-1">
                        <p className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Status{" "}
                          <span className="font-medium text-green-600">
                            Disetujui
                          </span>{" "}
                          - Tidak dapat diedit
                        </p>
                        <p className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Status{" "}
                          <span className="font-medium text-red-600">
                            Ditolak
                          </span>{" "}
                          - Tidak dapat diedit
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-amber-600" />
                    Langkah-langkah Mengedit Laporan:
                  </h4>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Buka Daftar Laporan Kegiatan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Dari sidebar, klik menu{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Laporan Kegiatan
                          </code>{" "}
                          →{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Daftar Laporan
                          </code>
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Cari Laporan yang Ingin Diedit
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Gunakan fitur pencarian atau filter untuk menemukan
                          laporan. Pastikan status laporan adalah{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-sm">
                            Diajukan
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Klik Tombol Detail/Edit
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Klik tombol{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm">
                            <Eye className="w-3 h-3" /> Detail
                          </span>{" "}
                          atau langsung klik pada baris laporan untuk membuka
                          halaman detail.
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Aktifkan Mode Edit
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Di halaman detail, klik tombol{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-sm">
                            <Edit className="w-3 h-3" /> Edit
                          </span>{" "}
                          untuk mengaktifkan mode edit.
                        </p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
                        5
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Ubah Data yang Diperlukan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Edit bagian yang perlu diperbaiki seperti judul,
                          uraian, waktu, atau bukti kegiatan.
                        </p>
                      </div>
                    </div>

                    {/* Step 6 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
                        6
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Simpan Perubahan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Klik tombol{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm">
                            <Save className="w-3 h-3" /> Simpan Perubahan
                          </span>{" "}
                          untuk menyimpan hasil edit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Legend */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-500" />
                    Keterangan Status Laporan:
                  </h5>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <span className="text-gray-600 dark:text-gray-400">
                        <strong>Diajukan</strong> - Bisa diedit
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-gray-600 dark:text-gray-400">
                        <strong>Disetujui</strong> - Terkunci
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span className="text-gray-600 dark:text-gray-400">
                        <strong>Ditolak</strong> - Terkunci
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------- */}
            {/* 4. Cara Mencetak Laporan Kegiatan */}
            {/* ------------------------------------------- */}
            <div
              id="mencetak-laporan"
              className="mb-12 scroll-mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-linear-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Printer className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      4. Cara Mencetak Laporan Kegiatan
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      Halaman: Laporan Kegiatan → Cetak Laporan
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-indigo-600" />
                    Langkah-langkah Mencetak Laporan:
                  </h4>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Akses Menu Cetak Laporan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Dari sidebar, klik menu{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Laporan Kegiatan
                          </code>{" "}
                          →{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Cetak Laporan
                          </code>
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Pilih Periode Laporan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Tentukan rentang waktu laporan yang ingin dicetak:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            <strong>Harian</strong>: Pilih tanggal spesifik
                          </li>
                          <li className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            <strong>Mingguan</strong>: Pilih minggu tertentu
                          </li>
                          <li className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            <strong>Bulanan</strong>: Pilih bulan dan tahun
                          </li>
                          <li className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            <strong>Rentang Kustom</strong>: Pilih tanggal mulai
                            dan selesai
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Filter Status (Opsional)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Anda dapat memfilter laporan berdasarkan status:
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            Semua Status
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs">
                            Diajukan
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                            Disetujui
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                            Ditolak
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Preview Laporan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Klik tombol{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm">
                            <Eye className="w-3 h-3" /> Preview
                          </span>{" "}
                          untuk melihat tampilan laporan sebelum dicetak.
                        </p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        5
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Cetak atau Download
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Pilih opsi yang diinginkan:
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm">
                            <Printer className="w-4 h-4" />
                            Cetak Langsung
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                            <Download className="w-4 h-4" />
                            Download PDF
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
                            <Download className="w-4 h-4" />
                            Download Excel
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips Box */}
                <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-indigo-700 dark:text-indigo-300">
                      <p className="font-semibold mb-1">Tips:</p>
                      <ul className="space-y-1">
                        <li>
                          • Cetak laporan bulanan di akhir bulan untuk
                          dokumentasi
                        </li>
                        <li>
                          • Pastikan semua laporan sudah diverifikasi sebelum
                          mencetak laporan resmi
                        </li>
                        <li>
                          • Download format Excel untuk analisis data lebih
                          lanjut
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------- */}
            {/* 5. Cara Membuat Template Kegiatan */}
            {/* ------------------------------------------- */}
            <div
              id="template-kegiatan"
              className="mb-12 scroll-mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-linear-to-r from-teal-500 to-cyan-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <LayoutTemplate className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      5. Cara Membuat Template Kegiatan
                    </h3>
                    <p className="text-teal-100 text-sm">
                      Halaman: Dashboard → Template Kegiatan
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Info Box */}
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-teal-700 dark:text-teal-300">
                      <p className="font-semibold mb-1">
                        Apa itu Template Kegiatan?
                      </p>
                      <p>
                        Template kegiatan adalah kegiatan yang tersimpan dan
                        dapat digunakan berulang kali. Sangat berguna untuk
                        kegiatan rutin seperti rapat mingguan, absensi, atau
                        tugas harian yang sama.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-teal-600" />
                    Langkah-langkah Membuat Template:
                  </h4>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Akses Menu Template Kegiatan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Dari sidebar, klik menu{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Dashboard
                          </code>{" "}
                          →{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Template Kegiatan
                          </code>
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Klik Tombol Tambah Template
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Klik tombol{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded text-sm">
                            <Plus className="w-3 h-3" /> Tambah Template
                          </span>{" "}
                          di pojok kanan atas.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Isi Detail Template
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Lengkapi informasi template:
                        </p>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-teal-500 mt-0.5" />
                            <span>
                              <strong>Nama Template</strong>: Nama yang mudah
                              diingat (contoh: "Rapat Mingguan Bidang")
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-teal-500 mt-0.5" />
                            <span>
                              <strong>Judul Kegiatan Default</strong>: Judul
                              yang akan otomatis terisi
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-teal-500 mt-0.5" />
                            <span>
                              <strong>Uraian Kegiatan Default</strong>:
                              Deskripsi standar kegiatan
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-teal-500 mt-0.5" />
                            <span>
                              <strong>Output Default</strong>: Hasil yang
                              diharapkan dari kegiatan
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-teal-500 mt-0.5" />
                            <span>
                              <strong>Durasi Default</strong> (opsional):
                              Estimasi waktu kegiatan
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Simpan Template
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Klik tombol{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded text-sm">
                            <Save className="w-3 h-3" /> Simpan Template
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Use Template */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Copy className="w-4 h-4 text-teal-600" />
                    Cara Menggunakan Template:
                  </h5>
                  <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      1. Saat membuat laporan baru, klik tombol{" "}
                      <strong>"Gunakan Template"</strong>
                    </li>
                    <li>2. Pilih template dari daftar yang tersedia</li>
                    <li>
                      3. Data akan otomatis terisi, tinggal sesuaikan jika perlu
                    </li>
                    <li>4. Simpan laporan seperti biasa</li>
                  </ol>
                </div>

                {/* Management Options */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-500" />
                    Kelola Template:
                  </h5>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      <Eye className="w-3 h-3" /> Lihat Detail
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                      <Edit className="w-3 h-3" /> Edit Template
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                      <Trash2 className="w-3 h-3" /> Hapus Template
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------- */}
            {/* 6. Cara Membuat Reminder */}
            {/* ------------------------------------------- */}
            <div
              id="reminder"
              className="mb-12 scroll-mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-linear-to-r from-rose-500 to-pink-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <BellRing className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      6. Cara Mengatur Reminder/Pengingat
                    </h3>
                    <p className="text-rose-100 text-sm">Halaman: Reminder</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Info Box */}
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-rose-700 dark:text-rose-300">
                      <p className="font-semibold mb-1">Apa itu Reminder?</p>
                      <p>
                        Reminder adalah fitur pengingat otomatis yang akan
                        mengirimkan notifikasi ke WhatsApp Anda untuk
                        mengingatkan pembuatan laporan kegiatan harian.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-rose-600" />
                    Langkah-langkah Mengatur Reminder:
                  </h4>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Akses Menu Reminder
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Dari sidebar, klik menu{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Reminder
                          </code>
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Aktifkan Reminder
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Toggle switch untuk mengaktifkan atau menonaktifkan
                          reminder.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Pilih Frekuensi Reminder
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Pilih seberapa sering Anda ingin diingatkan:
                        </p>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <CalendarCheck className="w-4 h-4 text-rose-500" />
                            <span>
                              <strong>Harian</strong>: Pengingat setiap hari
                              kerja
                            </span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <CalendarClock className="w-4 h-4 text-rose-500" />
                            <span>
                              <strong>Mingguan</strong>: Pengingat di hari
                              tertentu setiap minggu
                            </span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 text-rose-500" />
                            <span>
                              <strong>Bulanan</strong>: Pengingat di tanggal
                              tertentu setiap bulan
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Atur Waktu Pengingat
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Pilih jam berapa Anda ingin menerima notifikasi
                          (contoh: 16:00 WIT untuk pengingat sore hari).
                        </p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-sm">
                        5
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Simpan Pengaturan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Klik tombol{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded text-sm">
                            <Save className="w-3 h-3" /> Simpan Pengaturan
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Info */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <h5 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    Notifikasi yang Akan Diterima:
                  </h5>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      "Halo [Nama], ini adalah pengingat untuk mengisi laporan
                      kegiatan Anda hari ini. Silakan akses {appName} untuk
                      membuat laporan. Terima kasih! 📝"
                    </p>
                  </div>
                </div>

                {/* Tips Box */}
                <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-semibold mb-1">Tips:</p>
                      <ul className="space-y-1">
                        <li>
                          • Atur reminder di sore hari (15:00-17:00) agar tidak
                          lupa mengisi laporan
                        </li>
                        <li>
                          • Pastikan nomor WhatsApp Anda sudah terdaftar dengan
                          benar
                        </li>
                        <li>
                          • Reminder hanya dikirim pada hari kerja (Senin-Jumat)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================= */}
          {/* SECTION: PANDUAN USER ATASAN */}
          {/* ============================================= */}
          <section id="user-atasan" className="mb-16">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-purple-200 dark:border-purple-800">
              <div className="shrink-0 w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <UserCog className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Panduan untuk Atasan
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Petunjuk verifikasi laporan kegiatan bawahan
                </p>
              </div>
            </div>

            {/* ------------------------------------------- */}
            {/* Cara Memverifikasi Laporan */}
            {/* ------------------------------------------- */}
            <div
              id="verifikasi-laporan"
              className="mb-12 scroll-mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-linear-to-r from-purple-500 to-violet-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Cara Memverifikasi Laporan Kegiatan Bawahan
                    </h3>
                    <p className="text-purple-100 text-sm">
                      Halaman: Laporan Kegiatan → Verifikasi
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Role Info */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      <p className="font-semibold mb-1">
                        Peran Atasan dalam Verifikasi
                      </p>
                      <p>
                        Sebagai atasan, Anda bertanggung jawab untuk memeriksa
                        dan memverifikasi laporan kegiatan yang diajukan oleh
                        bawahan. Anda dapat menyetujui, menolak, atau memberikan
                        feedback pada setiap laporan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-purple-600" />
                    Langkah-langkah Verifikasi:
                  </h4>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Akses Menu Verifikasi
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Dari sidebar, klik menu{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Laporan Kegiatan
                          </code>{" "}
                          →{" "}
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            Verifikasi
                          </code>
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                          * Menu ini hanya tersedia untuk user dengan role
                          Atasan
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Lihat Daftar Laporan Pending
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Anda akan melihat daftar semua laporan dari bawahan
                          yang memerlukan verifikasi. Laporan ditandai dengan
                          status{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-sm">
                            Diajukan
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Pilih Laporan untuk Direview
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Klik pada laporan atau tombol{" "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm">
                            <Eye className="w-3 h-3" /> Review
                          </span>{" "}
                          untuk melihat detail laporan.
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Periksa Detail Laporan
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Di halaman detail verifikasi, periksa:
                        </p>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-purple-500 mt-0.5" />
                            <span>
                              <strong>Informasi Pegawai</strong>: Nama, NIP,
                              jabatan
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-purple-500 mt-0.5" />
                            <span>
                              <strong>Tanggal & Waktu</strong>: Kapan kegiatan
                              dilakukan
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-purple-500 mt-0.5" />
                            <span>
                              <strong>Judul & Uraian</strong>: Deskripsi
                              kegiatan
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-purple-500 mt-0.5" />
                            <span>
                              <strong>Output/Hasil</strong>: Apa yang dicapai
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <CheckSquare className="w-4 h-4 text-purple-500 mt-0.5" />
                            <span>
                              <strong>Bukti Kegiatan</strong>: Foto atau dokumen
                              pendukung
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                        5
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Berikan Rating (Opsional)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Anda dapat memberikan penilaian kualitas laporan:
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= 4
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">
                            (4/5)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 6 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                        6
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Tambahkan Catatan/Feedback (Opsional)
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Tulis komentar atau saran untuk bawahan terkait
                          laporan yang diajukan.
                        </p>
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            Contoh: "Laporan sudah baik, ke depannya mohon
                            sertakan foto dokumentasi kegiatan."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 7 */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                        7
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Pilih Aksi Verifikasi
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Pilih salah satu aksi:
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                            <ThumbsUp className="w-5 h-5" />
                            <div>
                              <p className="font-medium">Setujui</p>
                              <p className="text-xs opacity-80">
                                Laporan valid & sesuai
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                            <ThumbsDown className="w-5 h-5" />
                            <div>
                              <p className="font-medium">Tolak</p>
                              <p className="text-xs opacity-80">
                                Perlu perbaikan
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Info */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    Notifikasi Otomatis:
                  </h5>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                      <span>
                        Anda akan menerima notifikasi WhatsApp ketika ada
                        laporan baru yang perlu diverifikasi
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                      <span>
                        Bawahan akan menerima notifikasi hasil verifikasi Anda
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Tips Box */}
                <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      <p className="font-semibold mb-1">Tips untuk Atasan:</p>
                      <ul className="space-y-1">
                        <li>
                          • Verifikasi laporan secara rutin untuk menghindari
                          penumpukan
                        </li>
                        <li>
                          • Berikan feedback konstruktif untuk membantu bawahan
                          memperbaiki kualitas laporan
                        </li>
                        <li>• Gunakan rating untuk memotivasi bawahan</li>
                        <li>
                          • Laporan yang tidak diverifikasi dalam 7 hari akan
                          otomatis disetujui oleh sistem
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================= */}
          {/* CONTACT & SUPPORT */}
          {/* ============================================= */}
          <section className="bg-linear-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
            <div className="text-center mb-8">
              <HelpCircle className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Butuh Bantuan?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Jika Anda mengalami kendala atau memiliki pertanyaan, silakan
                hubungi tim support kami
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Operator SKPD
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Untuk masalah akun, password, dan data kepegawaian
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  WhatsApp Support
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Untuk bantuan teknis aplikasi
                </p>
                <p className="text-green-600 dark:text-green-400 font-medium">
                  {whatsapp}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Email
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Untuk pertanyaan umum
                </p>
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  {email}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

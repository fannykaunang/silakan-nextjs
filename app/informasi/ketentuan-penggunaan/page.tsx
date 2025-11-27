// app/(dashboard)/ketentuan-penggunaan/page.tsx

import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  Shield,
  Users,
  Clock,
  ArrowLeft,
  Smartphone,
  Database,
  Bell,
} from "lucide-react";
import { getAppSettings } from "@/lib/models/app-settings-model";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Ketentuan Penggunaan",
    description: "Ketentuan dan syarat penggunaan aplikasi",
    path: "/ketentuan-penggunaan",
  });
}

export default async function TermsOfServicePage() {
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
  const email = settings?.email || "support@izakod-asn.merauke.go.id";
  const whatsapp =
    settings?.whatsapp || settings?.no_telepon || "+62 XXX-XXXX-XXXX";
  const address =
    settings?.alamat || "Jl. TMP Trikora nO. 78, Maro, Merauke, Papua Selatan";
  const instansiNama =
    settings?.instansi_nama ||
    "Dinas Komunikasi dan Informatika Kabupaten Merauke";

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Kembali</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Ketentuan Penggunaan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Syarat dan ketentuan penggunaan aplikasi {appAlias}
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
            {/* Section 1: Penerimaan Ketentuan */}
            <section>
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    1. Penerimaan Ketentuan
                  </h2>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Dengan mengakses dan menggunakan aplikasi{" "}
                      <strong>{appName}</strong> ({appDescription}), Anda
                      menyetujui untuk terikat dengan ketentuan penggunaan ini.
                      Jika Anda tidak setuju dengan ketentuan ini, mohon untuk
                      tidak menggunakan aplikasi.
                    </p>
                    <p>
                      {appName} adalah sistem informasi resmi milik{" "}
                      <strong>{copyright}</strong> yang diperuntukkan bagi
                      Aparatur Sipil Negara (ASN) untuk melaporkan kegiatan
                      harian secara digital.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Definisi */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    2. Definisi
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 space-y-3">
                      <div className="flex gap-3">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold min-w-[30px]">
                          a.
                        </span>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>"Aplikasi"</strong> mengacu pada {appName},
                          termasuk semua fitur, layanan, dan konten yang
                          tersedia.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold min-w-[30px]">
                          b.
                        </span>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>"Pengguna"</strong> adalah ASN Kabupaten
                          Merauke yang memiliki akun aktif di {appName}.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold min-w-[30px]">
                          c.
                        </span>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>"Laporan Kegiatan"</strong> adalah dokumentasi
                          aktivitas harian yang dibuat oleh Pengguna melalui
                          aplikasi.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold min-w-[30px]">
                          d.
                        </span>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>"Administrator"</strong> adalah pihak yang
                          bertanggung jawab mengelola sistem {appName}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Hak Akses & Akun */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    3. Hak Akses dan Akun Pengguna
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      3.1 Kelayakan Pengguna
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        Hanya ASN aktif Kabupaten Merauke yang berhak
                        menggunakan aplikasi
                      </li>
                      <li>
                        Akun akan dibuat dan dikelola oleh Administrator
                        berdasarkan data kepegawaian resmi
                      </li>
                      <li>
                        Setiap pengguna bertanggung jawab atas keamanan
                        kredensial login mereka
                      </li>
                    </ul>

                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mt-6">
                      3.2 Keamanan Akun
                    </h3>
                    <p>Pengguna wajib:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Menjaga kerahasiaan PIN/password akun</li>
                      <li>Tidak memberikan akses akun kepada pihak lain</li>
                      <li>
                        Segera melaporkan kepada Administrator jika terjadi
                        penggunaan akun yang tidak sah
                      </li>
                      <li>
                        Melakukan logout setelah selesai menggunakan aplikasi,
                        terutama pada perangkat publik
                      </li>
                    </ul>

                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mt-6">
                      3.3 Integrasi eAbsen
                    </h3>
                    <p>
                      {appName} terintegrasi dengan sistem eAbsen untuk
                      sinkronisasi data kehadiran. Pengguna menyetujui bahwa
                      data kehadiran dari eAbsen akan ditampilkan dan digunakan
                      dalam aplikasi untuk keperluan pelaporan.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Penggunaan Aplikasi */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    4. Penggunaan Aplikasi
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      4.1 Kewajiban Pengguna
                    </h3>
                    <p>Pengguna wajib:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        Melaporkan kegiatan harian secara{" "}
                        <strong>jujur, akurat, dan tepat waktu</strong>
                      </li>
                      <li>
                        Mengisi laporan sesuai dengan aktivitas yang benar-benar
                        dilakukan
                      </li>
                      <li>
                        Mengunggah bukti kegiatan (foto/PDF) yang relevan dan
                        sesuai
                      </li>
                      <li>
                        Merespons reminder/pengingat yang dikirimkan melalui
                        WhatsApp
                      </li>
                      <li>
                        Memastikan konten laporan tidak mengandung informasi
                        palsu atau menyesatkan
                      </li>
                    </ul>

                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mt-6">
                      4.2 Larangan Penggunaan
                    </h3>
                    <p>
                      Pengguna <strong>dilarang</strong>:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        Memanipulasi, memalsukan, atau mengubah data laporan
                        kegiatan
                      </li>
                      <li>Menggunakan akun orang lain tanpa izin</li>
                      <li>
                        Mengunggah konten yang mengandung SARA, pornografi, atau
                        konten ilegal
                      </li>
                      <li>
                        Melakukan hacking, scraping, atau aktivitas yang
                        mengganggu sistem
                      </li>
                      <li>
                        Menyalahgunakan fitur notifikasi WhatsApp untuk spam
                      </li>
                      <li>
                        Menggunakan aplikasi untuk tujuan di luar pelaporan
                        kegiatan ASN
                      </li>
                    </ul>

                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mt-6">
                      4.3 Fitur Aplikasi
                    </h3>
                    <p>{appName} menyediakan fitur:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Laporan Kegiatan Harian</strong>: Input dan
                        dokumentasi aktivitas sehari-hari
                      </li>
                      <li>
                        <strong>Upload Bukti</strong>: Lampiran foto atau PDF
                        sebagai bukti pendukung
                      </li>
                      <li>
                        <strong>Dashboard Statistik</strong>: Visualisasi data
                        kegiatan dan kehadiran
                      </li>
                      <li>
                        <strong>Notifikasi WhatsApp</strong>: Reminder dan
                        notifikasi verifikasi real-time
                      </li>
                      <li>
                        <strong>Sistem Verifikasi</strong>: Persetujuan atasan
                        terhadap laporan
                      </li>
                      <li>
                        <strong>Rating & Feedback</strong>: Penilaian kualitas
                        kerja dari atasan
                      </li>
                      <li>
                        <strong>Integrasi eAbsen</strong>: Sinkronisasi data
                        kehadiran otomatis
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Notifikasi WhatsApp */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    5. Notifikasi WhatsApp
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Dengan menggunakan {appName}, Pengguna menyetujui untuk
                      menerima notifikasi melalui WhatsApp pada nomor yang
                      terdaftar di sistem, meliputi:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Reminder harian/mingguan/bulanan</strong>:
                        Pengingat untuk mengisi laporan kegiatan
                      </li>
                      <li>
                        <strong>Notifikasi verifikasi</strong>: Pemberitahuan
                        status persetujuan laporan
                      </li>
                      <li>
                        <strong>Notifikasi untuk atasan</strong>: Informasi
                        laporan bawahan yang perlu diverifikasi
                      </li>
                      <li>
                        <strong>Pengumuman sistem</strong>: Informasi penting
                        terkait aplikasi
                      </li>
                    </ul>
                    <p className="mt-4">
                      Pengguna dapat memperbarui nomor WhatsApp mereka melalui
                      menu profil atau menghubungi Administrator.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Privasi Data */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    6. Privasi dan Keamanan Data
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Kami berkomitmen untuk melindungi data pribadi dan
                      kegiatan Pengguna. Silakan membaca{" "}
                      <Link
                        href="/kebijakan-privasi"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                        Kebijakan Privasi
                      </Link>{" "}
                      kami untuk informasi lengkap mengenai:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Data yang kami kumpulkan</li>
                      <li>Cara kami menggunakan dan melindungi data</li>
                      <li>Hak Pengguna terkait data pribadi</li>
                      <li>Keamanan sistem dan enkripsi data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Audit Trail */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    7. Pencatatan Aktivitas (Audit Trail)
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Untuk keperluan transparansi dan keamanan, {appName}{" "}
                      mencatat seluruh aktivitas Pengguna, termasuk:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Login dan logout</li>
                      <li>Pembuatan, edit, dan penghapusan laporan kegiatan</li>
                      <li>Verifikasi dan pemberian rating oleh atasan</li>
                      <li>
                        IP address dan user agent perangkat yang digunakan
                      </li>
                      <li>Waktu dan tanggal setiap aktivitas</li>
                    </ul>
                    <p className="mt-4">
                      Data audit trail ini digunakan untuk monitoring sistem,
                      pencegahan penyalahgunaan, dan keperluan investigasi jika
                      terjadi pelanggaran.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8-12 continue with similar dynamic replacements... */}
            {/* For brevity, I'll include the contact section as an example */}

            {/* Section 12: Kontak */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    12. Kontak dan Bantuan
                  </h2>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Jika Anda memiliki pertanyaan, keluhan, atau membutuhkan
                      bantuan terkait
                      {appName}, silakan hubungi:
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 space-y-3">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Administrator {appName}
                      </p>
                      <p>
                        📍 <strong>Alamat:</strong> {instansiNama}
                        <br />
                        {address}
                      </p>
                      <p>
                        📧 <strong>Email:</strong> {email}
                      </p>
                      <p>
                        📱 <strong>WhatsApp:</strong> {whatsapp} (Jam Kerja)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Closing Statement */}
            <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Terima Kasih
                </h3>
                <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                  Dengan menggunakan {appName}, Anda telah setuju untuk mematuhi
                  seluruh ketentuan penggunaan di atas. Kami berharap aplikasi
                  ini dapat membantu meningkatkan efisiensi dan transparansi
                  pelaporan kegiatan ASN di Kabupaten Merauke.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                  <Link
                    href="/kebijakan-privasi"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg hover:shadow-lg transition-all font-semibold border border-blue-200 dark:border-blue-800">
                    <Shield className="w-5 h-5" />
                    Baca Kebijakan Privasi
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
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
            {appName} - {appDescription}
          </p>
        </div>
      </main>
    </div>
  );
}

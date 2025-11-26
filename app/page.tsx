// KODE LAMA
// import { redirect } from "next/navigation";

// export default function HomePage() {
//   redirect("/login");
// }

// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  LogIn,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "IZAKOD-ASN – Laporan Kegiatan ASN Kabupaten Merauke",
  description:
    "Aplikasi laporan kegiatan ASN Kabupaten Merauke untuk pencatatan, monitoring, dan pelaporan kinerja ASN secara terintegrasi.",
};

// ====== TYPES ======

type SkpdItem = {
  id: number;
  nama: string;
  singkatan?: string;
  totalPegawai: number;
};

type PublicOverview = {
  totalSkpd: number;
  totalPegawai: number;
  skpd: SkpdItem[];
};

// ====== DUMMY DATA (TODO: ganti dengan data dari DB / API) ======

async function getPublicOverview(): Promise<PublicOverview> {
  // TODO:
  // - Ganti fungsi ini dengan query ke database langsung
  //   atau fetch ke API internal: `/api/public/overview`
  //   dengan next: { revalidate: 300 } untuk revalidate setiap 5 menit.

  return {
    totalSkpd: 12,
    totalPegawai: 875,
    skpd: [
      {
        id: 1,
        nama: "Sekretariat Daerah",
        singkatan: "SETDA",
        totalPegawai: 120,
      },
      {
        id: 2,
        nama: "Badan Kepegawaian & Pengembangan SDM",
        singkatan: "BKPSDM",
        totalPegawai: 95,
      },
      {
        id: 3,
        nama: "Badan Perencanaan Pembangunan Daerah",
        singkatan: "Bappeda",
        totalPegawai: 80,
      },
      {
        id: 4,
        nama: "Inspektorat Daerah",
        singkatan: "Inspektorat",
        totalPegawai: 60,
      },
      {
        id: 5,
        nama: "Dinas Komunikasi dan Informatika",
        singkatan: "Kominfo",
        totalPegawai: 45,
      },
      {
        id: 6,
        nama: "Dinas Kesehatan",
        singkatan: "Dinkes",
        totalPegawai: 150,
      },
      {
        id: 7,
        nama: "Dinas Pendidikan",
        singkatan: "Disdik",
        totalPegawai: 180,
      },
      { id: 8, nama: "Dinas Sosial", singkatan: "Dinsos", totalPegawai: 40 },
      { id: 9, nama: "Dinas PUPR", singkatan: "PUPR", totalPegawai: 55 },
      {
        id: 10,
        nama: "Dinas Perhubungan",
        singkatan: "Dishub",
        totalPegawai: 30,
      },
      {
        id: 11,
        nama: "Satuan Polisi Pamong Praja",
        singkatan: "Satpol PP",
        totalPegawai: 20,
      },
      { id: 12, nama: "BPKAD", singkatan: "BPKAD", totalPegawai: 50 },
    ],
  };
}

// ====== FEATURE CONFIG ======

type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const FEATURES: FeatureItem[] = [
  {
    title: "Pencatatan Kegiatan ASN",
    description:
      "ASN mencatat kegiatan harian, mingguan, dan bulanan secara terstruktur sesuai tugas dan fungsi.",
    icon: CheckCircle2,
  },
  {
    title: "Monitoring & Persetujuan Pimpinan",
    description:
      "Atasan dapat memantau, memverifikasi, dan memberikan catatan terhadap laporan bawahan.",
    icon: BarChart3,
  },
  {
    title: "Rekap Otomatis",
    description:
      "Rekap laporan per pegawai, per SKPD, dan per periode untuk kebutuhan evaluasi kinerja.",
    icon: Clock,
  },
  {
    title: "Terintegrasi Antar-SKPD",
    description:
      "Seluruh SKPD berada dalam satu sistem terpadu sehingga memudahkan pelaporan lintas unit.",
    icon: Building2,
  },
];

// ====== PAGE COMPONENT ======

export default async function HomePage() {
  const overview = await getPublicOverview();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 text-slate-950 shadow-lg shadow-emerald-500/30">
              <span className="text-xs font-black tracking-tight">IZ</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight lg:text-base">
                IZAKOD-ASN
              </span>
              <span className="text-[11px] text-slate-400 lg:text-xs">
                Laporan Kegiatan ASN Kab. Merauke
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex lg:text-sm">
            <a href="#beranda" className="hover:text-emerald-400">
              Beranda
            </a>
            <a href="#fitur" className="hover:text-emerald-400">
              Fitur
            </a>
            <a href="#skpd" className="hover:text-emerald-400">
              Integrasi SKPD
            </a>
            <a href="#keamanan" className="hover:text-emerald-400">
              Keamanan
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden border-slate-600/60 text-xs md:inline-flex lg:text-sm">
              <Link href="#panduan">Panduan</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 text-xs lg:text-sm">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                <span>Masuk Aplikasi</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        id="beranda"
        className="mx-auto max-w-6xl px-4 pb-16 pt-10 lg:px-0 lg:pb-20 lg:pt-14">
        {/* HERO + STATS */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          {/* LEFT: HERO TEXT */}
          <div className="space-y-6">
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-[11px] font-medium uppercase tracking-wide text-emerald-300">
              Aplikasi resmi • Dinas Kominfo Kabupaten Merauke
            </Badge>

            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Digitalisasi laporan kegiatan ASN untuk{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                kinerja yang transparan
              </span>
              .
            </h1>

            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              IZAKOD-ASN membantu ASN Kabupaten Merauke mencatat kegiatan,
              memudahkan pimpinan memantau kinerja, dan menyajikan rekap laporan
              yang siap digunakan untuk evaluasi dan pelaporan resmi.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/login">
                  <span>Masuk sebagai ASN</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-600/70 bg-slate-900/60 text-slate-100">
                <Link href="#fitur">Lihat fitur utama</Link>
              </Button>
            </div>

            {/* SMALL HINT / NOTE */}
            <p className="text-xs text-slate-400">
              Akses aplikasi terbatas untuk ASN dan pejabat berwenang di
              lingkungan Pemerintah Kabupaten Merauke.
            </p>

            {/* STATS */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Card className="border-slate-700/70 bg-slate-900/70">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      SKPD Terintegrasi
                    </p>
                    <p className="text-lg font-semibold text-slate-50">
                      {overview.totalSkpd.toLocaleString("id-ID")}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        unit
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-700/70 bg-slate-900/70">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
                    <Users className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      ASN Pengguna
                    </p>
                    <p className="text-lg font-semibold text-slate-50">
                      {overview.totalPegawai.toLocaleString("id-ID")}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        pegawai
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT: VISUAL CARD / PREVIEW */}
          <div className="relative">
            {/* Glow background */}
            <div className="pointer-events-none absolute -left-10 top-0 -z-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-52 w-52 rounded-full bg-sky-500/20 blur-3xl" />

            <Card className="border-slate-700/70 bg-slate-900/80 shadow-2xl shadow-emerald-500/15">
              <CardHeader className="border-b border-slate-700/60 pb-3">
                <CardTitle className="flex items-center justify-between text-sm font-semibold text-slate-100">
                  Aktivitas Terkini ASN
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                    Contoh tampilan
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {/* Fakey list */}
                <div className="space-y-3 text-xs">
                  <ActivityItem
                    namaPegawai="Andi Wijaya"
                    skpd="BKPSDM"
                    kegiatan="Input laporan kegiatan: Penyusunan bahan sosialisasi disiplin ASN"
                    waktu="10.20 WIT"
                  />
                  <ActivityItem
                    namaPegawai="Maria Yuliana"
                    skpd="Dinas Kesehatan"
                    kegiatan="Verifikasi laporan kegiatan puskesmas distrik"
                    waktu="09.45 WIT"
                  />
                  <ActivityItem
                    namaPegawai="Robertus N."
                    skpd="Dinas PUPR"
                    kegiatan="Input kegiatan: Monitoring proyek jalan akses kampung"
                    waktu="08.15 WIT"
                  />
                </div>

                <Separator className="border-slate-700/70" />

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Alur singkat:</span>
                  <div className="flex items-center gap-2">
                    <StepBadge label="Login" />
                    <StepBadge label="Input Kegiatan" />
                    <StepBadge label="Verifikasi Atasan" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FITUR UTAMA */}
        <section id="fitur" className="mt-16 space-y-6 lg:mt-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
                Fitur utama IZAKOD-ASN
              </h2>
              <p className="max-w-xl text-sm text-slate-300">
                Dirancang untuk mendukung siklus pelaporan kinerja ASN secara
                end-to-end, dari input kegiatan sampai monitoring di level SKPD.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="group border-slate-700/60 bg-slate-900/70 transition-colors hover:border-emerald-500/70 hover:bg-slate-900">
                <CardContent className="space-y-3 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/80 group-hover:bg-emerald-500/15">
                    <feature.icon className="h-4 w-4 text-emerald-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SKPD TERINTEGRASI */}
        <section id="skpd" className="mt-16 space-y-6 lg:mt-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
                SKPD yang sudah terintegrasi
              </h2>
              <p className="max-w-xl text-sm text-slate-300">
                Berikut beberapa SKPD yang telah menggunakan IZAKOD-ASN sebagai
                media pelaporan kegiatan ASN. Daftar ini akan terus bertambah
                seiring dengan perluasan implementasi.
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Total SKPD:{" "}
              <span className="font-semibold text-emerald-300">
                {overview.totalSkpd.toLocaleString("id-ID")} unit
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overview.skpd.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-100">
                      {item.singkatan ?? item.nama}
                    </span>
                    {item.singkatan && (
                      <span className="text-[11px] text-slate-400">
                        {item.nama}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <span className="block text-xs font-semibold text-emerald-300">
                      {item.totalPegawai.toLocaleString("id-ID")}
                    </span>
                    <span>ASN terdaftar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ALUR PENGGUNAAN + KEAMANAN */}
        <section
          id="keamanan"
          className="mt-16 grid gap-8 lg:mt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* Alur penggunaan */}
          <div className="space-y-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
              Alur singkat penggunaan untuk ASN
            </h2>
            <div className="space-y-3 text-sm text-slate-300">
              <FlowStep
                step="01"
                title="Login menggunakan akun ASN"
                description="ASN masuk ke aplikasi menggunakan akun yang sudah terdaftar sesuai unit kerja masing-masing."
              />
              <FlowStep
                step="02"
                title="Input laporan kegiatan"
                description="Pegawai mengisi kegiatan sesuai tanggal, kategori, dan uraian aktivitas yang dilakukan."
              />
              <FlowStep
                step="03"
                title="Verifikasi & monitoring pimpinan"
                description="Atasan memeriksa, memberikan koreksi bila perlu, dan menyetujui laporan sebagai bahan rekap SKPD."
              />
            </div>
          </div>

          {/* Keamanan */}
          <div className="space-y-5">
            <h2 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
              Keamanan & pengelolaan data
            </h2>
            <Card className="border-slate-700/70 bg-slate-900/80">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  </div>
                  <p className="text-sm text-slate-100">
                    Akses aplikasi dibatasi untuk ASN dan pejabat yang
                    berwenang, dengan pengaturan hak akses sesuai peran.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-300" />
                    <span>
                      Data laporan disimpan pada infrastruktur server yang
                      dikelola Pemerintah Kabupaten Merauke.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-300" />
                    <span>
                      Mendukung pemisahan akses Admin, Operator SKPD, Pimpinan,
                      dan ASN pelaksana.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-300" />
                    <span>
                      Riwayat aktivitas dapat ditelusuri untuk mendukung audit
                      dan pelaporan kinerja.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* PANDUAN / CTA BAWAH */}
        <section id="panduan" className="mt-16 lg:mt-20">
          <Card className="border-slate-700/70 bg-slate-900/80">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-50">
                  Butuh panduan penggunaan IZAKOD-ASN?
                </p>
                <p className="max-w-xl text-xs text-slate-300">
                  Silakan unduh panduan penggunaan atau hubungi admin SKPD /
                  Dinas Kominfo bila membutuhkan bantuan lebih lanjut. (Link
                  panduan dapat disesuaikan nantinya.)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600/80 text-xs"
                  asChild>
                  {/* TODO: ganti href dengan file panduan asli */}
                  <Link href="#">Unduh Panduan (PDF)</Link>
                </Button>
                <Button size="sm" className="gap-1.5 text-xs" asChild>
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    Masuk Sekarang
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/70 bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-0">
          <span>
            © {new Date().getFullYear()} IZAKOD-ASN – Pemerintah Kabupaten
            Merauke.
          </span>
          <span>
            Dikelola oleh{" "}
            <span className="font-medium">
              Dinas Komunikasi dan Informatika Kabupaten Merauke
            </span>
            .
          </span>
        </div>
      </footer>
    </div>
  );
}

// ====== SMALL PRESENTATIONAL COMPONENTS ======

type ActivityItemProps = {
  namaPegawai: string;
  skpd: string;
  kegiatan: string;
  waktu: string;
};

function ActivityItem({
  namaPegawai,
  skpd,
  kegiatan,
  waktu,
}: ActivityItemProps) {
  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="font-semibold text-slate-100">{namaPegawai}</span>
        <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
          {skpd}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-300">{kegiatan}</p>
      <p className="mt-1 text-[10px] text-slate-500">Hari ini • {waktu}</p>
    </div>
  );
}

function StepBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-700/70 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300">
      {label}
    </span>
  );
}

type FlowStepProps = {
  step: string;
  title: string;
  description: string;
};

function FlowStep({ step, title, description }: FlowStepProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-[11px] font-semibold text-emerald-300">
        {step}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <p className="text-xs text-slate-300">{description}</p>
      </div>
    </div>
  );
}

// app/(dashboard)/laporan-kegiatan/pegawai/[id]/page.tsx

import { Metadata } from "next";
import PegawaiLaporanListClient from "./_client";

export const metadata: Metadata = {
  title: "Laporan Kegiatan Pegawai | SILAKAN",
  description: "Daftar laporan kegiatan berdasarkan pegawai",
};

export default function LaporanPegawaiPage() {
  return <PegawaiLaporanListClient />;
}

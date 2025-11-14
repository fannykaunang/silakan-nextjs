// app/(dashboard)/laporan-kegiatan/cetak/page.tsx
import { Metadata } from "next";
import CetakLaporanBulananClient from "./_client";

export const metadata: Metadata = {
  title: "Cetak Laporan Kegiatan Bulanan | SILAKAN",
  description:
    "Halaman untuk mencetak laporan kegiatan pegawai berdasarkan bulan",
};

export default function CetakLaporanBulananPage() {
  return <CetakLaporanBulananClient />;
}

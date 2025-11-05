// app/(dashboard)/dashboard/laporan/tambah/page.tsx
import { Metadata } from "next";
import TambahLaporanClient from "./_client";

export const metadata: Metadata = {
  title: "Tambah Laporan Kegiatan | SILAKAN",
  description: "Buat laporan kegiatan harian baru",
};

export default function TambahLaporanPage() {
  return <TambahLaporanClient />;
}

// app/(dashboard)/dashboard/laporan/page.tsx
import { Metadata } from "next";
import LaporanListClient from "./_client";

export const metadata: Metadata = {
  title: "Daftar Laporan Kegiatan | SILAKAN",
  description: "Kelola laporan kegiatan harian ASN",
};

export default function LaporanPage() {
  return <LaporanListClient />;
}

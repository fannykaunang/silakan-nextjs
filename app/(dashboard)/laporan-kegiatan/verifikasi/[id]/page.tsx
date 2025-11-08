import { Metadata } from "next";
import LaporanVerifikasiClient from "./_client";

export const metadata: Metadata = {
  title: "Verifikasi Laporan Kegiatan | SILAKAN",
  description: "Halaman verifikasi laporan kegiatan oleh atasan",
};

export default function LaporanVerifikasiPage() {
  return <LaporanVerifikasiClient />;
}

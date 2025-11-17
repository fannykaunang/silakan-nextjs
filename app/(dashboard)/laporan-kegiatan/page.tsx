// app/(dashboard)/dashboard/laporan/page.tsx
import LaporanListClient from "./_client";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Laporan Kegiatan",
    description: "Daftar laporan kegiatan harian Pegawai",
    path: "/laporan-kegiatan",
  });
}

export default function LaporanPage() {
  return <LaporanListClient />;
}

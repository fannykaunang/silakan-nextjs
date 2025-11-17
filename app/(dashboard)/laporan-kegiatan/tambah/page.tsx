// app/(dashboard)/laporan/tambah/page.tsx

import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import TambahLaporanClient from "./_client";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Tambah Laporan Kegiatan",
    description: "Buat laporan kegiatan harian baru",
    path: "/laporan-kegiatan/tambah",
  });
}

export default function TambahLaporanPage() {
  return <TambahLaporanClient />;
}

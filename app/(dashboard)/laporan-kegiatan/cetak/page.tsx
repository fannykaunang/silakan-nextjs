// app/(dashboard)/laporan-kegiatan/cetak/page.tsx
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import CetakLaporanBulananClient from "./_client";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Cetak Laporan Kegiatan Bulanan",
    description:
      "Halaman untuk mencetak laporan kegiatan pegawai berdasarkan bulan",
    path: "/laporan-kegiatan/cetak",
  });
}

export default function CetakLaporanBulananPage() {
  return <CetakLaporanBulananClient />;
}

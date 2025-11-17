// app/(dashboard)/laporan/verifikasi/[id]/page.tsx

import LaporanVerifikasiClient from "./_client";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import { getLaporanById } from "@/lib/models/laporan.model";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const laporanId = Number(id);

  if (!laporanId || Number.isNaN(laporanId)) {
    return generatePageMetadata({
      title: "Laporan Tidak Valid",
      description: "ID laporan tidak valid untuk proses verifikasi.",
      path: "/laporan-kegiatan/verifikasi",
      noIndex: true,
    });
  }

  const laporan = await getLaporanById(laporanId);

  if (!laporan) {
    return generatePageMetadata({
      title: "Laporan Tidak Ditemukan",
      description: "Laporan yang akan diverifikasi tidak tersedia.",
      path: `/laporan-kegiatan/verifikasi/${laporanId}`,
      noIndex: true,
    });
  }

  const pegawaiNama = laporan.pegawai_nama || "pegawai";

  return generatePageMetadata({
    title: `Verifikasi ${laporan.nama_kegiatan}`,
    description: `Verifikasi laporan ${laporan.nama_kegiatan} milik ${pegawaiNama}.`,
    path: `/laporan-kegiatan/verifikasi/${laporanId}`,
  });
}

export default function LaporanVerifikasiPage() {
  return <LaporanVerifikasiClient />;
}

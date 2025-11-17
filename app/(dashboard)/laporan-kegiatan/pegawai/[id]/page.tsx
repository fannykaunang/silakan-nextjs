// app/(dashboard)/laporan-kegiatan/pegawai/[id]/page.tsx

import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import { getPegawaiById } from "@/lib/models/pegawai.model";
import PegawaiLaporanListClient from "./_client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pegawaiId = Number(id);

  if (!pegawaiId || Number.isNaN(pegawaiId)) {
    return generatePageMetadata({
      title: "Pegawai Tidak Valid",
      description: "ID pegawai tidak valid untuk laporan kegiatan.",
      path: "/laporan-kegiatan/pegawai",
      noIndex: true,
    });
  }

  const pegawai = await getPegawaiById(pegawaiId);

  if (!pegawai) {
    return generatePageMetadata({
      title: "Pegawai Tidak Ditemukan",
      description: "Pegawai yang dimaksud tidak tersedia.",
      path: `/laporan-kegiatan/pegawai/${pegawaiId}`,
      noIndex: true,
    });
  }

  const pegawaiNama = pegawai.pegawai_nama || "Pegawai";

  return generatePageMetadata({
    title: `Laporan ${pegawaiNama}`,
    description: `Daftar laporan kegiatan ${pegawaiNama}.`,
    path: `/laporan-kegiatan/pegawai/${pegawaiId}`,
  });
}

export default function LaporanPegawaiPage() {
  return <PegawaiLaporanListClient />;
}

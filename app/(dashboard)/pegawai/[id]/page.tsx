// app/(dashboard)/dashboard/pegawai/[id]/page.tsx

import PegawaiDetailClient from "./_client";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import { getPegawaiById } from "@/lib/models/pegawai.model";

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
      description: "ID pegawai tidak valid untuk detail pegawai.",
      path: "/pegawai",
      noIndex: true,
    });
  }

  const pegawai = await getPegawaiById(pegawaiId);

  if (!pegawai) {
    return generatePageMetadata({
      title: "Pegawai Tidak Ditemukan",
      description: "Pegawai yang dimaksud tidak ditemukan atau tidak aktif.",
      path: `/pegawai/${pegawaiId}`,
      noIndex: true,
    });
  }

  const pegawaiNama = pegawai.pegawai_nama || "Pegawai";

  return generatePageMetadata({
    title: `Detail ${pegawaiNama}`,
    description: `Detail dan pengelolaan data ${pegawaiNama}.`,
    path: `/pegawai/${pegawaiId}`,
  });
}

export default function PegawaiDetailPage() {
  return <PegawaiDetailClient />;
}

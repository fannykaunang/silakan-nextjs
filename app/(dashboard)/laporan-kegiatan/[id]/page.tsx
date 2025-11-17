// app/laporan-kegiatan/[id]/page.tsx

import { Suspense } from "react";
import DetailEditClient from "./DetailEditClient";
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
      noIndex: true,
    });
  }

  const laporan = await getLaporanById(laporanId);

  if (!laporan) {
    return generatePageMetadata({
      title: "Laporan Tidak Ditemukan",
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: laporan.nama_kegiatan,
    description: `Laporan kegiatan: ${laporan.nama_kegiatan}`,
  });
}

export default function LaporanKegiatanDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Memuat data...
            </p>
          </div>
        </div>
      }>
      <DetailEditClient />
    </Suspense>
  );
}

// File: app/laporan-kegiatan/[id]/page.tsx
// Copy file ini ke: app/laporan-kegiatan/[id]/page.tsx

import { Suspense } from "react";
import DetailEditClient from "./DetailEditClient";

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

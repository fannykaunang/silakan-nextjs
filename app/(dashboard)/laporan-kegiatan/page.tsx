// app/(dashboard)/dashboard/laporan/page.tsx
import LaporanListClient from "./_client";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Laporan Kegiatan",
  });
}

export default function LaporanPage() {
  return <LaporanListClient />;
}

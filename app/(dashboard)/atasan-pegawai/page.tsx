// app/(dashboard)/atasan-pegawai/page.tsx

import AtasanPegawaiClient from "./_client";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Atasan Pegawai",
    description: "Kelola hubungan atasan dan pegawai",
    path: "/atasan-pegawai",
  });
}

export default function AtasanPegawaiPage() {
  return <AtasanPegawaiClient />;
}

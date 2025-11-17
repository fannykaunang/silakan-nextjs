// app/(dashboard)/dashboard/pegawai/page.tsx

import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import PegawaiClient from "./_client";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Daftar Pegawai",
    description: "Kelola data pegawai",
    path: "/pegawai",
  });
}

export default function PegawaiPage() {
  return <PegawaiClient />;
}

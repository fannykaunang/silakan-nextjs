// app/(dashboard)/atasan-pegawai/page.tsx

import { Metadata } from "next";
import AtasanPegawaiClient from "./_client";

export const metadata: Metadata = {
  title: "Atasan Pegawai | Dashboard",
  description: "Kelola hubungan atasan dan pegawai",
};

export default function AtasanPegawaiPage() {
  return <AtasanPegawaiClient />;
}

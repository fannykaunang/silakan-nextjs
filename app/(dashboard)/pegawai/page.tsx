// app/(dashboard)/dashboard/pegawai/page.tsx
import { Metadata } from "next";
import PegawaiClient from "./_client";

export const metadata: Metadata = {
  title: "Daftar Pegawai | SILAKAN",
  description: "Kelola data pegawai",
};

export default function PegawaiPage() {
  return <PegawaiClient />;
}

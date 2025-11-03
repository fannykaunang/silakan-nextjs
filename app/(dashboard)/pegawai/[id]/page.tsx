// app/(dashboard)/dashboard/pegawai/[id]/page.tsx
import { Metadata } from "next";
import PegawaiDetailClient from "./_client";

export const metadata: Metadata = {
  title: "Detail Pegawai | SILAKAN",
  description: "Detail dan edit data pegawai",
};

export default function PegawaiDetailPage() {
  return <PegawaiDetailClient />;
}

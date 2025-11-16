// app/(dashboard)/settings/laporan-kegiatan/page.tsx
import { Metadata } from "next";
import SettingsClient from "./_client";

export const metadata: Metadata = {
  title: "Pengaturan Laporan Kegiatan | SILAKAN",
  description: "Kelola template kegiatan untuk mempercepat pelaporan",
};

export default function SettingsPage() {
  return <SettingsClient />;
}

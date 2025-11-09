// app/(dashboard)/settings/page.tsx
import { Metadata } from "next";
import SettingsClient from "./_client";

export const metadata: Metadata = {
  title: "Settings | SILAKAN",
  description: "Kelola template kegiatan untuk mempercepat pelaporan",
};

export default function SettingsPage() {
  return <SettingsClient />;
}

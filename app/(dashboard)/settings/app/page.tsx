import type { Metadata } from "next";
import SettingsPageClient from "./_client";

export const metadata: Metadata = {
  title: "Pengaturan Aplikasi | SILAKAN",
  description:
    "Kelola konfigurasi utama aplikasi SILAKAN termasuk data umum, kontak, integrasi, keamanan, dan sistem.",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}

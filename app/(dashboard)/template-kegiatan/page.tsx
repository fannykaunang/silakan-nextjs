// app/(dashboard)/dashboard/template-kegiatan/page.tsx
import { Metadata } from "next";
import TemplateKegiatanClient from "./_client";

export const metadata: Metadata = {
  title: "Template Kegiatan | Dashboard",
  description: "Kelola template kegiatan untuk mempercepat pelaporan",
};

export default function TemplateKegiatanPage() {
  return <TemplateKegiatanClient />;
}

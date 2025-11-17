// app/(dashboard)/template-kegiatan/page.tsx

import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import TemplateKegiatanClient from "./_client";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Template Laporan Kegiatan",
    description: "Template Laporan Kegiatan yang dapat digunakan",
    path: "/template-kegiatan",
    noIndex: true,
  });
}

export default function TemplateKegiatanPage() {
  return <TemplateKegiatanClient />;
}

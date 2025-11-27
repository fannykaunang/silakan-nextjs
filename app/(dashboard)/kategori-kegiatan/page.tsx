// app/(dashboard)/dashboard/kategori-kegiatan/page.tsx
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import KategoriKegiatanClient from "./_client";
import { requireAdmin } from "@/lib/helpers/auth-helper";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Kategori Kegiatan",
    description: "Kelola Kategori Kegiatan pegawai",
    path: "/kategori-kegiatan",
  });
}

export default async function KategoriKegiatanPage() {
  try {
    // Check if user is admin
    await requireAdmin();
  } catch (error) {
    // Redirect to dashboard if not admin
    redirect("/dashboard");
  }

  return <KategoriKegiatanClient />;
}

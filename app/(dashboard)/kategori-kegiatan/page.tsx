// app/(dashboard)/dashboard/kategori-kegiatan/page.tsx
import { Metadata } from "next";
import KategoriKegiatanClient from "./_client";
import { requireAdmin } from "@/lib/helpers/auth-helper";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Kategori Kegiatan | SILAKAN",
  description: "Manajemen kategori kegiatan",
};

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

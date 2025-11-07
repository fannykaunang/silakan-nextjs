// app/(dashboard)/jabatan/page.tsx

import JabatanClient from "./_client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/helpers/auth-helper";

export const metadata: Metadata = {
  title: "Jabatan | SILAKAN",
  description: "Manajemen kategori kegiatan",
};

export default async function JabatanPage() {
  try {
    // Check if user is admin
    await requireAdmin();
  } catch (error) {
    // Redirect to dashboard if not admin
    redirect("/dashboard");
  }

  return <JabatanClient />;
}

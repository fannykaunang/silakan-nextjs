// app/(dashboard)/jabatan/page.tsx

import JabatanClient from "./_client";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/helpers/auth-helper";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Jabatan",
    description: "Kelola Jabatan pegawai",
    path: "/jabatan",
  });
}

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

// app/(dashboard)/dashboard/logs/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/helpers/auth-helper";
import LogsClient from "./_client";

export const metadata: Metadata = {
  title: "Log Aktivitas | SILAKAN",
  description: "Monitor aktivitas sistem",
};

export default async function LogsPage() {
  try {
    // Hanya admin yang bisa akses halaman ini
    await requireAdmin();
  } catch (error) {
    // Redirect ke dashboard jika bukan admin
    redirect("/dashboard");
  }

  return <LogsClient />;
}

// app/(dashboard)/dashboard/logs/page.tsx
import { redirect } from "next/navigation";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import { requireAdmin } from "@/lib/helpers/auth-helper";
import LogsClient from "./_client";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Log Aktivitas",
    description: "Monitor aktivitas sistem",
    path: "/logs",
  });
}

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

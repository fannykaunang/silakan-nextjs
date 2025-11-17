// app/(dashboard)/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./_client";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";

/**
 * Generate dynamic metadata dengan Open Graph & Twitter Card support
 */

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Dashboard",
    description:
      "Halaman utama sistem informasi laporan kinerja ASN Kabupaten Merauke",
    path: "/dashboard",
  });
}

export default async function DashboardPage() {
  const store = await cookies();
  const raw = store.get("auth")?.value;

  if (!raw) {
    redirect("/login");
  }

  let email: string | undefined;
  try {
    const parsed = JSON.parse(Buffer.from(raw!, "base64").toString());
    email = parsed?.email;
  } catch {
    // jika gagal parse, tetap izinkan tapi tanpa email
  }

  return <DashboardClient userEmail={email} />;
}

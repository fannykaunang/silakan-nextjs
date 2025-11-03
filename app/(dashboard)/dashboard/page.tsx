// app/dashboard/page.tsx (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./_client";

export const metadata = {
  title: "Dashboard | SILAKAN",
  description:
    "Halaman utama sistem informasi laporan kinerja ASN Kabupaten Merauke.",
};

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

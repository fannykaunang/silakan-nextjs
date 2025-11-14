// app/(dashboard)/statistik/bulanan/page.tsx
import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/helpers/auth-helper";
import RekapBulananClient from "./_client";

export const metadata = {
  title: "Statistik Bulanan - SILAKAN",
  description: "Halaman statistik laporan kegiatan bulanan",
};

export default async function RekapBulananPage() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  return <RekapBulananClient userEmail={user.email} />;
}

// app/(dashboard)/statistik/harian/page.tsx
import { getUserFromCookie } from "@/lib/helpers/auth-helper";
import { redirect } from "next/navigation";
import RekapHarianClient from "./_client";

export const metadata = {
  title: "Statistik Harian - SILAKAN",
  description: "Halaman statistik kegiatan harian",
};

export default async function RekapHarianPage() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  return <RekapHarianClient userEmail={user.email} />;
}

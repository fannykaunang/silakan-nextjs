// app/(dashboard)/statistik/harian/page.tsx

import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import { getUserFromCookie } from "@/lib/helpers/auth-helper";
import { redirect } from "next/navigation";
import RekapHarianClient from "./_client";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Statistik Harian",
    path: "/statistik/harian",
    noIndex: true,
  });
}

export default async function RekapHarianPage() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  return <RekapHarianClient />;
}

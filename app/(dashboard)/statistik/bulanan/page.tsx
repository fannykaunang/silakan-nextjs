// app/(dashboard)/statistik/bulanan/page.tsx
import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/helpers/auth-helper";
import RekapBulananClient from "./_client";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Statistik Bulanan",
    path: "/statistik/bulanan",
    noIndex: true,
  });
}

export default async function RekapBulananPage() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  return <RekapBulananClient />;
}

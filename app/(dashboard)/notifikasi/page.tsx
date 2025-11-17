// app/(dashboard)/dashboard/notifikasi/page.tsx

import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import NotifikasiClient from "./_client";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Notifikasi",
    description: "Notifikasi sistem",
    path: "/notifikasi",
  });
}

export default function NotifikasiPage() {
  return <NotifikasiClient />;
}

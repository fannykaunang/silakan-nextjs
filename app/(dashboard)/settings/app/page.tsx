// app/(dashboard)/settings/app/page.tsx
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import SettingsPageClient from "./_client";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Pengaturan",
    path: "/settings/app",
    noIndex: true,
  });
}

export default function SettingsPage() {
  return <SettingsPageClient />;
}

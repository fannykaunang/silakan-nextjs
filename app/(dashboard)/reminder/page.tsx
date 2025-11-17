// app/(dashboard)/reminder/page.tsx

import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import ReminderClient from "./_client";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Reminder/Pengingat Laporan Kegiatan",
    description: "Atur Reminder/Pengingat Laporan Kegiatan Anda",
    path: "/reminder",
  });
}

export default function ReminderPage() {
  return <ReminderClient />;
}

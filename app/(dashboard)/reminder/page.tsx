import { Metadata } from "next";
import ReminderClient from "./_client";

export const metadata: Metadata = {
  title: "Reminder/Pengingat | SILAKAN",
  description: "Atur Reminder/Pengingat Laporan Kegiatan Anda",
};

export default function ReminderPage() {
  return <ReminderClient />;
}

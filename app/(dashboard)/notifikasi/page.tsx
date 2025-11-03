// app/(dashboard)/dashboard/notifikasi/page.tsx
import { Metadata } from "next";
import NotifikasiClient from "./_client";

export const metadata: Metadata = {
  title: "Notifikasi | SILAKAN",
  description: "Notifikasi sistem",
};

export default function NotifikasiPage() {
  return <NotifikasiClient />;
}

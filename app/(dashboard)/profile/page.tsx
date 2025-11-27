// app/(dashboard)/profile/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "./_client";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import { getUserWithPegawaiData } from "@/lib/helpers/auth-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { session, pegawai } = await getUserWithPegawaiData();

  if (!session?.pin) {
    return generatePageMetadata({
      title: "Profil Pengguna",
      description: "Masuk untuk melihat dan mengelola profil Anda.",
      path: "/profile",
      noIndex: true,
    });
  }

  const namaPegawai = pegawai?.pegawai_nama || session.nama || "Pengguna";

  return generatePageMetadata({
    title: `Profil ${namaPegawai}`,
    description: `Lihat dan kelola informasi akun ${namaPegawai}.`,
    path: "/profile",
  });
}

export default async function ProfilePage() {
  const store = await cookies();
  const raw = store.get("auth")?.value;

  if (!raw) {
    redirect("/login");
  }

  let userPin: string | undefined;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64").toString());
    userPin = parsed?.pegawai_pin || parsed?.pin;
  } catch {
    // jika gagal parse, redirect ke login
    redirect("/login");
  }

  return <ProfileClient userPin={userPin} />;
}

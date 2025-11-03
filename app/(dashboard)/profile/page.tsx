// app/profile/page.tsx (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "./_client";

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

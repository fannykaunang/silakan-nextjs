// app/(dashboard)/layout.tsx  (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const raw = (await cookies()).get("auth")?.value;
  if (!raw) redirect("/login");

  let userEmail: string | undefined;
  let userName: string | undefined;
  let userLevel = 0;

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64").toString());
    // pastikan login route kamu memang menyimpan email (& nama jika ada)
    userEmail = parsed?.email;
    userName = parsed?.name || parsed?.full_name; // opsional kalau ada
    if (typeof parsed?.level === "number") userLevel = parsed.level;
  } catch {}

  return (
    <DashboardShell
      userEmail={userEmail}
      userName={userName}
      userLevel={userLevel}>
      {children}
    </DashboardShell>
  );
}

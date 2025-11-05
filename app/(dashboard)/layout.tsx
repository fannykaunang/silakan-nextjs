// app/(dashboard)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import LoadingBar from "@/components/ui/LoadingBar";
import { NavigationProvider } from "@/components/providers/NavigationProvider";

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
    userEmail = parsed?.email;
    userName = parsed?.name || parsed?.full_name;
    if (typeof parsed?.level === "number") userLevel = parsed.level;
  } catch {}

  return (
    <LoadingProvider>
      <NavigationProvider>
        <LoadingBar />
        <DashboardShell
          userEmail={userEmail}
          userName={userName}
          userLevel={userLevel}>
          {children}
        </DashboardShell>
      </NavigationProvider>
    </LoadingProvider>
  );
}

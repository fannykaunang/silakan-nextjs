// app/(auth)/login/page.tsx

import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import LoginPageClient from "./_client";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Masuk",
    description:
      "Masuk ke SILAKAN untuk memantau produktivitas ASN, melakukan verifikasi laporan, dan berkolaborasi lintas unit.",
    path: "/login",
  });
}

export default function LoginPage() {
  return <LoginPageClient />;
}

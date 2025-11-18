// app/(auth)/login/page.tsx

import { generatePageMetadata } from "@/lib/helpers/metadata-helper";
import LoginPageClient from "./_client";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Halaman Login",
    path: "/login",
  });
}

export default function LoginPage() {
  return <LoginPageClient />;
}

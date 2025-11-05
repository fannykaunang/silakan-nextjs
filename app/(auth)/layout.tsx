// app/(auth)/layout.tsx
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import LoadingBar from "@/components/ui/LoadingBar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoadingProvider>
      <LoadingBar />
      {children}
    </LoadingProvider>
  );
}

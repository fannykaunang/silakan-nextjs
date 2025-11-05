// components/providers/NavigationProvider.tsx
"use client";

import { useLoading } from "./LoadingProvider";
import { useNavigationEvents } from "@/hooks/useNavigationEvents";
import { ReactNode } from "react";

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { startLoading, stopLoading } = useLoading();

  useNavigationEvents(startLoading, stopLoading);

  return <>{children}</>;
};

"use client";

import { useState } from "react";
import SidebarClient from "./SidebarClient";
import HeaderClient from "./HeaderClient";
import FooterClient from "./FooterClient";

export default function DashboardShell({
  children,
  userEmail,
  userName,
  userLevel,
}: {
  children: React.ReactNode;
  userEmail?: string;
  userName?: string;
  userLevel?: number; // -1, 0, 1, 2, 3
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SidebarClient
        sidebarOpen={open}
        setSidebarOpen={setOpen}
        userLevel={userLevel ?? 0} // ⬅️ pass ke sidebar
      />

      {/* KOMPENSASI LEBAR SIDEBAR: gunakan padding-left yang SAMA persis */}
      <div
        className={`transition-all duration-300 ${open ? "pl-64" : "pl-20"}`}>
        <HeaderClient
          userEmail={userEmail}
          userName={userName}
          userLevel={userLevel ?? 0}
        />
        <main className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
          {children}
        </main>
        <FooterClient />
      </div>
    </div>
  );
}

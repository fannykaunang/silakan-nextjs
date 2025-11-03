"use client";

import React, { useState, useEffect, ReactNode } from "react";
//import Header from "./HeaderClient";

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail?: string;
  userName?: string;
}

export default function DashboardLayout({
  children,
  userEmail,
  userName,
}: DashboardLayoutProps) {
  // State dengan nilai default dari localStorage atau true
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Cek apakah kita di client side
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarOpen");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true; // Default untuk server side
  });
  const [isMounted, setIsMounted] = useState(false);

  // Simpan state ke localStorage setiap kali berubah
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) {
      setSidebarOpen(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen, isMounted]);

  // Render placeholder sebelum mount untuk mencegah layout shift
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 shadow-md h-screen w-64 border-r border-gray-200 dark:border-gray-700"></div>
        <div>
          {/* <Header userEmail={userEmail} userName={userName} /> */}
          <main className="p-4 md:p-6 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="transition-all duration-300">
        {/* <Header userEmail={userEmail} userName={userName} /> */}
        <main className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

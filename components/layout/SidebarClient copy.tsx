// components/Sidebar.tsx
"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { icon: Home, label: "Beranda", href: "/dashboard" },
    {
      icon: ShoppingCart,
      label: "Pesanan",
      badge: "12",
      href: "/dashboard/orders",
    },
    { icon: Users, label: "Pelanggan", href: "/dashboard/customers" },
    { icon: BarChart3, label: "Analitik", href: "/dashboard/analytics" },
    { icon: Settings, label: "Pengaturan", href: "/dashboard/settings" },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        {sidebarOpen && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg">
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <button
              key={idx}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}>
              <Icon className="w-5 h-5" />
              {sidebarOpen && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

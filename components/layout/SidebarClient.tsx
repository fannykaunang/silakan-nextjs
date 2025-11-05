// components/layout/SidebarClient.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "@/components/providers/LoadingProvider";
import {
  Home,
  User,
  Users,
  Settings,
  Menu,
  X,
  Activity,
  Tag,
  Bell,
  FileText,
  Briefcase,
  ClipboardList,
  FileBarChart,
  Calendar,
  TrendingUp,
} from "lucide-react";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  userLevel: number; // -1..3 (3 = Admin)
};

// Tipe untuk item menu tunggal (link)
type MenuItemLink = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// Tipe untuk bagian menu (grup) yang akan memiliki judul
type MenuSection = {
  title: string;
  items: MenuItemLink[];
};

// Komponen Pembantu untuk Item Menu
function NavItem({
  item,
  pathname,
  sidebarOpen,
}: {
  item: MenuItemLink;
  pathname: string;
  sidebarOpen: boolean;
}) {
  const { startLoading, stopLoading } = useLoading();
  // Pengecekan aktif untuk link saat ini atau sub-path-nya
  const active =
    pathname === item.href || pathname?.startsWith(item.href + "/");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Always trigger loading when a link is clicked
    startLoading();

    // Ensure loading stops after navigation completes
    setTimeout(() => {
      stopLoading();
    }, 1000);
  };
  return (
    <li className="list-none">
      <Link
        key={item.href}
        href={item.href}
        onClick={handleClick}
        // Pastikan styling responsif baik saat sidebar terbuka (w-64) maupun tertutup (w-20)
        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer
          ${
            active
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }
        `}
        aria-current={active ? "page" : undefined}>
        <item.icon className="w-5 h-5 shrink-0" />
        {/* Label hanya ditampilkan saat sidebar terbuka */}
        {sidebarOpen && <span className="truncate text-sm">{item.label}</span>}
      </Link>
    </li>
  );
}

export default function SidebarClient({
  sidebarOpen,
  setSidebarOpen,
  userLevel,
}: SidebarProps) {
  const pathname = usePathname();

  // 1. Definisikan semua item link yang relevan berdasarkan level pengguna

  // --- A. Bagian Dashboard & Profil (Semua Level) ---
  const dashboardItems: MenuItemLink[] = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/profile", label: "Profil Saya", icon: User },
  ];

  // --- B. Bagian Kegiatan (Level >= 0) ---
  const activityItems: MenuItemLink[] = [
    { href: "/kegiatan", label: "Kegiatan Saya", icon: ClipboardList },
    { href: "/jadwal", label: "Jadwal", icon: Calendar },
  ];

  // --- C. Bagian Laporan (Level >= 0) ---
  const reportItems: MenuItemLink[] = [
    {
      href: "/laporan-kegiatan",
      label: "Laporan Kegiatan",
      icon: FileBarChart,
    },
  ];

  // Tambahkan laporan statistik untuk level supervisor ke atas
  if (userLevel >= 2) {
    reportItems.push({
      href: "/laporan/statistik",
      label: "Statistik",
      icon: TrendingUp,
    });
  }

  // --- D. Bagian Manajemen Data (Level >= 1) ---
  const managementItems: MenuItemLink[] = [];

  if (userLevel >= 1) {
    managementItems.push(
      { href: "/pegawai", label: "Data Pegawai", icon: Users },
      {
        href: "/template-kegiatan",
        label: "Template Kegiatan",
        icon: FileText,
      }
    );
  }

  // --- E. Bagian Konfigurasi (Level 2-3) ---
  const configItems: MenuItemLink[] = [];

  if (userLevel >= 2) {
    configItems.push({
      href: "/atasan-pegawai",
      label: "Atasan Pegawai",
      icon: Briefcase,
    });
  }

  if (userLevel === 3) {
    configItems.push({
      href: "/kategori-kegiatan",
      label: "Kategori Kegiatan",
      icon: Tag,
    });
  }

  // --- F. Bagian Notifikasi (Semua Level) ---
  const notificationItems: MenuItemLink[] = [
    { href: "/notifikasi", label: "Notifikasi", icon: Bell },
  ];

  // --- G. Bagian Sistem (Admin Only - Level 3) ---
  const systemItems: MenuItemLink[] = [];
  if (userLevel === 3) {
    systemItems.push(
      { href: "/logs", label: "Log Aktivitas", icon: Activity },
      { href: "/settings", label: "Pengaturan Sistem", icon: Settings }
    );
  }

  // 2. Gabungkan item-item yang sudah difilter ke dalam array seksi
  const menuSections: MenuSection[] = [
    { title: "Dashboard", items: dashboardItems },
    { title: "Kegiatan", items: activityItems },
    { title: "Laporan", items: reportItems },
  ];

  if (managementItems.length > 0) {
    menuSections.push({ title: "Manajemen Data", items: managementItems });
  }

  if (configItems.length > 0) {
    menuSections.push({ title: "Konfigurasi", items: configItems });
  }

  menuSections.push({ title: "Notifikasi", items: notificationItems });

  if (systemItems.length > 0) {
    menuSections.push({ title: "Sistem", items: systemItems });
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-all flex flex-col ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
      aria-label="Sidebar navigasi">
      {/* Header / brand + toggle */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
        {sidebarOpen && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SILAKAN
          </h1>
        )}
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
          aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}>
          {sidebarOpen ? (
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Menu Navigasi dengan Scroll */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {menuSections.map(
          (section) =>
            // Hanya render bagian jika ada item di dalamnya
            section.items.length > 0 && (
              <div key={section.title}>
                {/* Judul Bagian, hanya terlihat saat sidebar terbuka */}
                {sidebarOpen ? (
                  <h3 className="text-xs uppercase font-semibold text-gray-400 dark:text-gray-500 mb-2 px-3">
                    {section.title}
                  </h3>
                ) : (
                  // Untuk sidebar tertutup, tambahkan sedikit pemisah vertikal antar grup
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />
                )}

                {/* List Item Menu dalam bentuk UL/LI */}
                <ul className="space-y-1">
                  {section.items.map((it) => (
                    <NavItem
                      key={it.href}
                      item={it}
                      pathname={pathname || ""}
                      sidebarOpen={sidebarOpen}
                    />
                  ))}
                </ul>
              </div>
            )
        )}
      </nav>

      {/* Footer - User Level Badge */}
      {sidebarOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Level Akses
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {userLevel === 3
                ? "👑 Administrator"
                : userLevel === 2
                ? "⭐ Supervisor"
                : userLevel === 1
                ? "📋 Operator"
                : "👤 User"}
            </p>
          </div>
        </div>
      )}

      {/* Scrollbar Custom Styles */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </aside>
  );
}

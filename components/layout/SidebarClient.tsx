// components/layout/SidebarClient.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ScrollText, // Menambahkan ikon baru untuk Laporan
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
  // Pengecekan aktif untuk link saat ini atau sub-path-nya
  const active =
    pathname === item.href || pathname?.startsWith(item.href + "/");

  return (
    <li className="list-none">
      <Link
        key={item.href}
        href={item.href}
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

  // 1. Definisikan item menu berdasarkan grup fungsional

  // --- A. Bagian Umum (Level >= 0) ---
  const generalItems: MenuItemLink[] = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/profile", label: "Profil", icon: User },
    { href: "/notifikasi", label: "Notifikasi", icon: Bell },
  ];

  // --- B. Bagian Kegiatan (Level >= 1) ---
  const kegiatanItems: MenuItemLink[] = [];
  if (userLevel >= 1) {
    kegiatanItems.push(
      {
        href: "/template-kegiatan",
        label: "Template Kegiatan",
        icon: FileText,
      },
      { href: "/laporan", label: "Laporan Kegiatan", icon: ScrollText } // ITEM BARU
    );
  }

  // --- C. Bagian Master Data (Level >= 1) ---
  const masterDataItems: MenuItemLink[] = [];
  if (userLevel >= 1) {
    masterDataItems.push({ href: "/pegawai", label: "Pegawai", icon: Users });
  }
  // Hanya Admin (Level 3)
  if (userLevel === 3) {
    masterDataItems.push(
      {
        href: "/atasan-pegawai",
        label: "Atasan Pegawai",
        icon: Briefcase,
      },
      {
        href: "/kategori-kegiatan",
        label: "Kategori Kegiatan",
        icon: Tag,
      }
    );
  }

  // --- D. Bagian Administrasi (Level 3) ---
  const adminItems: MenuItemLink[] = [];
  if (userLevel === 3) {
    adminItems.push(
      { href: "/logs", label: "Log Aktivitas", icon: Activity },
      { href: "/settings", label: "Pengaturan", icon: Settings }
    );
  }

  // 2. Gabungkan item-item yang sudah difilter ke dalam array seksi
  const menuSections: MenuSection[] = [{ title: "Umum", items: generalItems }];

  if (kegiatanItems.length > 0) {
    menuSections.push({ title: "Kegiatan", items: kegiatanItems });
  }

  if (masterDataItems.length > 0) {
    menuSections.push({ title: "Master Data", items: masterDataItems });
  }

  if (adminItems.length > 0) {
    menuSections.push({ title: "Administrasi", items: adminItems });
  }

  return (
    <aside
      // PERUBAHAN: Menambahkan flex flex-col untuk layout scrollable
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-all flex flex-col ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
      aria-label="Sidebar navigasi">
      {/* Header / brand + toggle (dibuat 'flex-shrink-0' agar tidak ter-scroll) */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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

      {/* Menu Navigasi Bertingkat (dibuat 'flex-grow' dan 'overflow-y-auto' untuk scrolling) */}
      <nav className="p-4 space-y-4 flex-grow overflow-y-auto">
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
                  // Pemisah ini tidak akan muncul pada grup terakhir
                  <hr className="my-4 border-gray-200 dark:border-gray-700 last:hidden" />
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

      {/* Footer - User Level Badge (dibuat 'flex-shrink-0' dan dihapus 'absolute') */}
      <div className="p-4 flex-shrink-0">
        {sidebarOpen && (
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Level:{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {userLevel === 3
                  ? "Admin"
                  : userLevel === 2
                  ? "Supervisor"
                  : userLevel === 1
                  ? "Operator"
                  : "User"}
              </span>
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

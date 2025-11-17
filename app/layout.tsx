import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // ⬅️ import provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SILAKAN Masuk | Pemerintah Kabupaten Merauke",
  description:
    "Halaman Login Sistem Informasi Laporan Kegiatan Harian ASN Kabupaten Merauke",
  icons: {
    icon: "/favicon.ico", // path relatif ke folder public
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // opsional untuk iOS
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:text-gray-100`}>
        {/* ⬇️ ThemeProvider membungkus seluruh aplikasi */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

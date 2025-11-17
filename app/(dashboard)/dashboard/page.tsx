// app/(dashboard)/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import DashboardClient from "./_client";
import { getAppSettings } from "@/lib/models/app-settings-model";

/**
 * Generate dynamic metadata dengan Open Graph & Twitter Card support
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getAppSettings();

    const title = settings?.nama_aplikasi
      ? `Dashboard | ${settings.nama_aplikasi}`
      : "Dashboard | SILAKAN";

    const description =
      settings?.deskripsi ||
      "Halaman utama sistem informasi laporan kinerja ASN Kabupaten Merauke.";

    const domain = settings?.domain || "silakan.merauke.go.id";
    const ogImage = settings?.og_image || "/images/og-default.png";
    const logoUrl = settings?.logo || "/images/logo-default.png";

    return {
      title,
      description,

      // Keywords untuk SEO
      keywords: settings?.meta_keywords
        ? settings.meta_keywords.split(",").map((k) => k.trim())
        : ["SILAKAN", "ASN", "Laporan Kegiatan", "Merauke"],

      // Authors
      authors: [
        {
          name: settings?.copyright || "Pemerintah Kabupaten Merauke",
        },
      ],

      // Open Graph metadata untuk social media sharing
      openGraph: {
        type: "website",
        locale: "id_ID",
        url: `https://${domain}`,
        title,
        description,
        siteName: settings?.nama_aplikasi || "SILAKAN",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },

      // Twitter Card metadata
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
        creator: settings?.twitter_url
          ? `@${settings.twitter_url.split("/").pop()}`
          : undefined,
      },

      // Icons & Manifest
      icons: {
        icon: settings?.favicon || "/favicon.ico",
        apple: logoUrl,
      },

      // Robots untuk SEO
      robots: {
        index: settings?.mode === "online",
        follow: settings?.mode === "online",
        googleBot: {
          index: settings?.mode === "online",
          follow: settings?.mode === "online",
        },
      },

      // Viewport
      viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
      },

      // Verification untuk Google Search Console
      // verification: {
      //   google: "your-google-verification-code",
      // },
    };
  } catch (error) {
    console.error("Error loading metadata:", error);

    // Fallback metadata
    return {
      title: "Dashboard | SILAKAN",
      description:
        "Halaman utama sistem informasi laporan kinerja ASN Kabupaten Merauke.",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export default async function DashboardPage() {
  const store = await cookies();
  const raw = store.get("auth")?.value;

  if (!raw) {
    redirect("/login");
  }

  let email: string | undefined;
  try {
    const parsed = JSON.parse(Buffer.from(raw!, "base64").toString());
    email = parsed?.email;
  } catch {
    // jika gagal parse, tetap izinkan tapi tanpa email
  }

  return <DashboardClient userEmail={email} />;
}

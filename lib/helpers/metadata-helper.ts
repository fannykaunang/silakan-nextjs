// lib/helpers/metadata-helper.ts

import { Metadata } from "next";
import { getAppSettings } from "@/lib/models/app-settings-model";

interface PageMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}

/**
 * Generate metadata untuk halaman dengan data dari app_settings
 *
 * @param options - Opsi custom untuk metadata halaman
 * @returns Metadata object untuk Next.js
 *
 * @example
 * // Di page.tsx
 * export async function generateMetadata() {
 *   return generatePageMetadata({
 *     title: "Dashboard",
 *     description: "Halaman dashboard IZAKOD-ASN"
 *   });
 * }
 */
export async function generatePageMetadata(
  options: PageMetadataOptions = {}
): Promise<Metadata> {
  try {
    const settings = await getAppSettings();

    // Build title dengan format: [Page Title] | [App Name]
    const appName = settings?.alias_aplikasi || "IZAKOD-ASN";
    const pageTitle = options.title ? `${options.title} | ${appName}` : appName;

    // Description fallback
    const description =
      options.description ||
      settings?.deskripsi ||
      "Integrasi Laporan Kegiatan Online Digital ASN";

    // Domain dan URLs
    const domain = settings?.domain || "izakod-asn.merauke.go.id";
    const baseUrl = `https://${domain}`;
    const pagePath = options.path || "";
    const fullUrl = `${baseUrl}${pagePath}`;

    // Images
    const ogImage =
      options.image || settings?.og_image || "/images/og-default.png";
    const logoUrl = settings?.logo || "/images/logo-default.png";
    const faviconUrl = settings?.favicon || "/favicon.ico";

    // Keywords
    const keywords =
      options.keywords ||
      (settings?.meta_keywords
        ? settings.meta_keywords.split(",").map((k) => k.trim())
        : ["IZAKOD-ASN", "ASN", "Laporan Kegiatan", "Merauke"]);

    // Robots - jika maintenance atau noIndex, jangan index
    const shouldIndex = settings?.mode === "online" && !options.noIndex;

    return {
      title: pageTitle,
      metadataBase: new URL(baseUrl),
      description,
      keywords,

      authors: [
        {
          name: settings?.copyright || "Pemerintah Kabupaten Merauke",
        },
      ],

      // Open Graph
      openGraph: {
        type: "website",
        locale: "id_ID",
        url: fullUrl,
        title: pageTitle,
        description,
        siteName: appName,
        images: [
          {
            url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
            width: 1200,
            height: 630,
            alt: pageTitle,
          },
        ],
      },

      // Twitter Card
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description,
        images: [ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`],
        creator: settings?.twitter_url
          ? `@${settings.twitter_url.split("/").pop()}`
          : undefined,
      },

      // Icons
      icons: {
        icon: faviconUrl,
        apple: logoUrl,
        shortcut: faviconUrl,
      },

      // Robots
      robots: {
        index: shouldIndex,
        follow: shouldIndex,
        googleBot: {
          index: shouldIndex,
          follow: shouldIndex,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      // Alternate languages
      alternates: {
        canonical: fullUrl,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Fallback metadata jika terjadi error
    const title = options.title
      ? `${options.title} | IZAKOD-ASN`
      : "IZAKOD-ASN";
    const description =
      options.description || "Integrasi Laporan Kegiatan Online Digital ASN";

    return {
      metadataBase: new URL("https://izakod-asn.merauke.go.id"),
      title,
      description,
      robots: {
        index: !options.noIndex,
        follow: !options.noIndex,
      },
    };
  }
}

/**
 * Generate metadata untuk halaman error/not-found
 */
export async function generateErrorMetadata(
  errorType: "404" | "500" | "403" = "404"
): Promise<Metadata> {
  const titles = {
    "404": "Halaman Tidak Ditemukan",
    "500": "Terjadi Kesalahan Server",
    "403": "Akses Ditolak",
  };

  const descriptions = {
    "404": "Halaman yang Anda cari tidak ditemukan.",
    "500": "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
    "403": "Anda tidak memiliki akses ke halaman ini.",
  };

  return generatePageMetadata({
    title: titles[errorType],
    description: descriptions[errorType],
    noIndex: true, // Error pages tidak perlu diindex
  });
}

/**
 * Generate metadata untuk API documentation
 */
export async function generateDocsMetadata(
  pageTitle: string,
  pageDescription?: string
): Promise<Metadata> {
  return generatePageMetadata({
    title: pageTitle,
    description: pageDescription || `Dokumentasi ${pageTitle}`,
    keywords: ["dokumentasi", "API", "developer", "IZAKOD-ASN"],
  });
}

/**
 * Get app settings untuk client-side usage
 * (cached version untuk menghindari multiple database calls)
 */
let cachedSettings: Awaited<ReturnType<typeof getAppSettings>> | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedAppSettings() {
  const now = Date.now();

  // Return cached if still valid
  if (cachedSettings && now - cacheTime < CACHE_DURATION) {
    return cachedSettings;
  }

  // Fetch fresh data
  try {
    cachedSettings = await getAppSettings();
    cacheTime = now;
    return cachedSettings;
  } catch (error) {
    console.error("Error fetching cached app settings:", error);
    return null;
  }
}

/**
 * Clear cache (useful untuk testing atau setelah update settings)
 */
export function clearMetadataCache() {
  cachedSettings = null;
  cacheTime = 0;
}

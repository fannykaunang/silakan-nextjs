// components/layout/FooterClient.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import type { AppSettings } from "@/lib/models/app-settings-model";

const quickLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Laporan Kegiatan", href: "/laporan-kegiatan" },
  { label: "Pegawai", href: "/pegawai" },
  { label: "Template", href: "/template-kegiatan" },
];

const resourceLinks = [
  { label: "Pengaturan Aplikasi", href: "/settings/app" },
  { label: "Statistik", href: "/statistik/harian" },
  { label: "Reminder", href: "/reminder" },
  { label: "Log Aktivitas", href: "/logs" },
];

type AppSettingsResponse = {
  success: boolean;
  data?: AppSettings;
};

const DEFAULT_CONTENT = {
  appName: "SILAKAN",
  description:
    "Sistem Informasi Laporan Kegiatan ASN Pemerintah Kabupaten Merauke. Satu tempat untuk memantau produktivitas, melakukan verifikasi, dan memudahkan kolaborasi lintas unit.",
  version: "1.0.0",
  instansi: "Kabupaten Merauke",
  email: "support@silakan.merauke.go.id",
  phone: "(0971) 123456",
  address: "Jl. Raya Mandala No. 12\nKabupaten Merauke, Papua Selatan",
  domain: "https://entago.merauke.go.id",
  copyright: "Pemerintah Kabupaten Merauke. Seluruh hak cipta dilindungi.",
};

export default function FooterClient() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings/app", {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const result: AppSettingsResponse = await response.json();
        if (isMounted && result?.data) {
          setSettings(result.data);
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Failed to load footer settings", error);
      }
    }

    fetchSettings();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const content = useMemo(() => {
    const description = settings?.deskripsi?.trim();
    const version = settings?.versi?.trim();
    const instansi = settings?.instansi_nama?.trim();
    const email = settings?.email?.trim();
    const phone = settings?.no_telepon?.trim();
    const address = settings?.alamat?.trim();
    const domain = settings?.domain?.trim();
    const copyright = settings?.copyright?.trim();
    const appName =
      settings?.alias_aplikasi?.trim() ||
      settings?.nama_aplikasi?.trim() ||
      DEFAULT_CONTENT.appName;

    const normalizedDomain = domain
      ? domain.startsWith("http")
        ? domain
        : `https://${domain}`
      : DEFAULT_CONTENT.domain;

    return {
      appName,
      description: description || DEFAULT_CONTENT.description,
      version: `Versi ${version || DEFAULT_CONTENT.version}`,
      instansi: instansi || DEFAULT_CONTENT.instansi,
      email: email || DEFAULT_CONTENT.email,
      phone: phone || DEFAULT_CONTENT.phone,
      address: address || DEFAULT_CONTENT.address,
      domain: normalizedDomain,
      copyright: (copyright && `${copyright}`) || DEFAULT_CONTENT.copyright,
    };
  }, [settings]);

  const telHref = useMemo(() => {
    const digits = content.phone.replace(/[^+\d]/g, "");
    return digits ? `tel:${digits}` : undefined;
  }, [content.phone]);

  const mailHref = content.email ? `mailto:${content.email}` : undefined;

  return (
    <footer className="border-t border-gray-200 bg-white/95 px-4 py-8 text-sm text-gray-600 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {content.appName}
              <span className="rounded-full text-xs border border-emerald-200 px-3 py-1 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300">
                {content.version}
              </span>
            </p>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <span className="rounded-full border border-blue-200 px-3 py-1 text-blue-600 dark:border-blue-500/40 dark:text-blue-200">
                {content.instansi}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="mb-3 font-semibold text-gray-900 dark:text-white">
                Navigasi
              </p>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-blue-600 focus-visible:text-blue-600 focus-visible:outline-none dark:hover:text-blue-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold text-gray-900 dark:text-white">
                Sumber Daya
              </p>
              <ul className="space-y-2">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-blue-600 focus-visible:text-blue-600 focus-visible:outline-none dark:hover:text-blue-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-900 dark:text-white">
              Hubungi Kami
            </p>
            <div className="space-y-2 text-sm">
              <a
                href={mailHref}
                className="flex items-center gap-2 transition-colors hover:text-blue-600 dark:hover:text-blue-300"
                aria-label={`Email ${content.email}`}>
                <Mail className="h-4 w-4" />
                {content.email}
              </a>
              <a
                href="tel:+62971123456"
                className="flex items-center gap-2 transition-colors hover:text-blue-600 dark:hover:text-blue-300">
                <Phone className="h-4 w-4" />
                {content.phone}
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="whitespace-pre-line">{content.address}</span>
              </p>
            </div>
            <a
              href="https://portal.merauke.go.id"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200">
              Kunjungi Portal Merauke
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 md:flex-row">
          <p>
            &copy; {currentYear} {content.copyright}. Seluruh hak cipta
            dilindungi.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/settings/laporan-kegiatan"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-300">
              Kebijakan Privasi
            </Link>
            <Link
              href="/settings/app"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-300">
              Ketentuan Penggunaan
            </Link>
            <Link
              href="/notifikasi"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-300">
              Status Sistem
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

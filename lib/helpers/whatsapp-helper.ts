// lib/helpers/whatsapp-helper.ts

import { getAppSettings } from "@/lib/models/app-settings-model";

const WHATSAPP_API_URL =
  process.env.WHATSAPP_API_URL || "http://103.177.95.67:7482/send/message";

const WHATSAPP_USERNAME = process.env.WHATSAPP_USERNAME || "your_username";
const WHATSAPP_PASSWORD = process.env.WHATSAPP_PASSWORD || "your_password";

type SendWhatsAppParams = {
  phone: string; // format: 628xxx atau 08xxx
  message: string;
  reply_message_id?: string;
  is_forwarded?: boolean;
  duration?: number;
};

/**
 * Format nomor telepon ke format WhatsApp
 * Contoh: 08123456789 -> 628123456789@s.whatsapp.net
 */
function formatPhoneNumber(phone: string): string {
  // Hapus semua karakter non-digit
  let cleaned = phone.replace(/\D/g, "");

  // Jika dimulai dengan 0, ganti dengan 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }

  // Jika belum dimulai dengan 62, tambahkan 62
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  // Tambahkan @s.whatsapp.net
  return `${cleaned}@s.whatsapp.net`;
}

/**
 * Generate Basic Auth header
 */
function getBasicAuthHeader(): string {
  const credentials = `${WHATSAPP_USERNAME}:${WHATSAPP_PASSWORD}`;
  const base64Credentials = Buffer.from(credentials).toString("base64");
  return `Basic ${base64Credentials}`;
}

/**
 * Mengirim pesan WhatsApp melalui API dengan Basic Auth
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppParams
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const formattedPhone = formatPhoneNumber(params.phone);

    const payload = {
      phone: formattedPhone,
      message: params.message,
      reply_message_id: params.reply_message_id || undefined,
      is_forwarded: params.is_forwarded ?? false,
      duration: params.duration ?? 7200,
    };

    console.log(`📤 Sending WhatsApp to: ${formattedPhone}`);

    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getBasicAuthHeader(), // ← Basic Auth Header
      },
      body: JSON.stringify(payload),
      // Timeout 10 detik
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("WhatsApp API error:", response.status, errorText);

      // Cek jika error 401 (Unauthorized)
      if (response.status === 401) {
        return {
          success: false,
          error: "Authentication failed. Check username and password.",
        };
      }

      return {
        success: false,
        error: `WhatsApp API error: ${response.status}`,
      };
    }

    const result = await response.json().catch(() => ({}));
    console.log(`✅ WhatsApp sent successfully to: ${formattedPhone}`);

    return {
      success: true,
      message: "Pesan WhatsApp berhasil dikirim",
    };
  } catch (error: any) {
    console.error("Failed to send WhatsApp message:", error);

    // Cek jika error timeout
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return {
        success: false,
        error: "Request timeout. WhatsApp API tidak merespon dalam 10 detik.",
      };
    }

    return {
      success: false,
      error: error?.message || "Gagal mengirim pesan WhatsApp",
    };
  }
}

let cachedAppAlias: string | null = null;
let lastAliasFetch = 0;
const ALIAS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getAppAlias(): Promise<string> {
  const now = Date.now();
  if (cachedAppAlias && now - lastAliasFetch < ALIAS_CACHE_DURATION) {
    return cachedAppAlias;
  }

  const settings = await getAppSettings();
  cachedAppAlias = settings?.alias_aplikasi?.trim() || "IZAKOD-ASN";
  lastAliasFetch = now;
  return cachedAppAlias;
}

/**
 * Format pesan reminder untuk WhatsApp
 */
export async function formatReminderMessage(params: {
  title: string;
  message?: string | null;
  tipe: string;
  scheduledAt?: string;
  pegawaiName?: string;
}): Promise<string> {
  const lines: string[] = [];
  const alias = await getAppAlias();

  lines.push("🔔 *PENGINGAT KEGIATAN*");
  lines.push("");
  lines.push(`*${params.title}*`);

  if (params.message) {
    lines.push("");
    lines.push(params.message);
  }

  lines.push("");
  lines.push(`📅 Tipe: ${params.tipe}`);

  if (params.scheduledAt) {
    const scheduled = new Date(params.scheduledAt);
    if (!Number.isNaN(scheduled.getTime())) {
      const formattedTime = scheduled.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDate = scheduled.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      lines.push(`⏰ Waktu: ${formattedTime} WIB`);
      lines.push(`📆 Tanggal: ${formattedDate}`);
    }
  }

  if (params.pegawaiName) {
    lines.push("");
    lines.push(`👤 Untuk: ${params.pegawaiName}`);
  }

  lines.push("");
  lines.push(`_Pesan otomatis dari Sistem ${alias}_`);

  return lines.join("\n");
}

/**
 * Format pesan laporan kegiatan untuk WhatsApp (untuk atasan)
 */
export async function formatLaporanKegiatanMessage(params: {
  pegawaiName: string;
  namaKegiatan: string;
  kategori?: string;
  tanggalKegiatan: string;
  waktuMulai?: string;
  waktuSelesai?: string;
  lokasi?: string;
  deskripsi?: string;
  laporanId?: number;
}): Promise<string> {
  const lines: string[] = [];
  const alias = await getAppAlias();

  lines.push("📋 *LAPORAN KEGIATAN BARU*");
  lines.push("");
  lines.push(
    `Anda memiliki laporan kegiatan baru yang perlu direview dari bawahan Anda.`
  );
  lines.push("");

  lines.push("👤 *Pegawai*");
  lines.push(params.pegawaiName);
  lines.push("");

  lines.push("📝 *Kegiatan*");
  lines.push(params.namaKegiatan);

  if (params.kategori) {
    lines.push(`Kategori: ${params.kategori}`);
  }
  lines.push("");

  // Format tanggal
  const tanggal = new Date(params.tanggalKegiatan);
  if (!Number.isNaN(tanggal.getTime())) {
    const formattedDate = tanggal.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    lines.push("📅 *Tanggal Kegiatan*");
    lines.push(formattedDate);
    lines.push("");
  }

  // Waktu
  if (params.waktuMulai && params.waktuSelesai) {
    lines.push("⏰ *Waktu Pelaksanaan*");
    lines.push(`${params.waktuMulai} - ${params.waktuSelesai} WIB`);
    lines.push("");
  }

  // Lokasi
  if (params.lokasi) {
    lines.push("📍 *Lokasi*");
    lines.push(params.lokasi);
    lines.push("");
  }

  // Deskripsi (dipotong jika terlalu panjang)
  if (params.deskripsi) {
    lines.push("📄 *Deskripsi Singkat*");
    const shortDesc =
      params.deskripsi.length > 150
        ? params.deskripsi.substring(0, 150) + "..."
        : params.deskripsi;
    lines.push(shortDesc);
    lines.push("");
  }

  lines.push("🔔 *Tindakan Diperlukan*");
  lines.push(
    `Silakan login ke sistem ${alias} untuk mereview dan menyetujui laporan ini.`
  );

  if (params.laporanId) {
    lines.push("");
    lines.push(`_ID Laporan: #${params.laporanId}_`);
  }

  lines.push("");
  lines.push(`_Pesan otomatis dari Sistem ${alias}_`);

  return lines.join("\n");
}

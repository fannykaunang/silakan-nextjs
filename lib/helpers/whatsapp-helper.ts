// lib/helpers/whatsapp-helper.ts
// VERSION WITH BASIC AUTH

const WHATSAPP_API_URL = "http://103.177.95.67:7482/send/message";

// ⚠️ PENTING: Ganti dengan username dan password Anda
// REKOMENDASI: Simpan di environment variable untuk keamanan
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
      duration: params.duration ?? 3600,
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

/**
 * Format pesan reminder untuk WhatsApp
 */
export function formatReminderMessage(params: {
  title: string;
  message?: string | null;
  tipe: string;
  scheduledAt?: string;
  pegawaiName?: string;
}): string {
  const lines: string[] = [];

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
  lines.push("_Pesan otomatis dari Sistem SILAKAN_");

  return lines.join("\n");
}

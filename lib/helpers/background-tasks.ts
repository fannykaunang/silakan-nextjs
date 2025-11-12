// lib/helpers/background-tasks.ts
import { sendWhatsAppMessage } from "./whatsapp-helper";
import { executeInsert } from "./db-helpers";
import { createNotifikasi } from "@/lib/models/notifikasi.model";

interface BackgroundWhatsAppTask {
  phone: string;
  message: string;
  pegawaiId: number;
  metadata?: {
    laporanId?: number;
    tipeNotifikasi?: "Verifikasi" | "Penolakan" | "Komentar" | "Info";
    judul?: string;
    linkTujuan?: string;
    actionRequired?: boolean;
  };
}

/**
 * Kirim WhatsApp dan simpan notifikasi di background (non-blocking)
 */
export async function sendWhatsAppWithNotificationInBackground(
  task: BackgroundWhatsAppTask
) {
  // Jalankan di background tanpa await - tidak memblokir response
  setImmediate(async () => {
    try {
      console.log(`📤 Background task started for phone: ${task.phone}`);

      // 1. Kirim WhatsApp
      const result = await sendWhatsAppMessage({
        phone: task.phone,
        message: task.message,
      });

      const status = result.success ? "sent" : "failed";
      const errorMessage = result.error || null;

      // 2. Log ke database (optional - buat tabel jika perlu)
      try {
        await executeInsert(
          `INSERT INTO whatsapp_log (pegawai_id, phone, message, status, error_message, sent_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            task.pegawaiId,
            task.phone,
            task.message.substring(0, 500), // Simpan max 500 char
            status,
            errorMessage,
          ]
        );
      } catch (logError) {
        console.error("⚠️ Failed to log WhatsApp to database:", logError);
        // Don't throw - continue to notification
      }

      // 3. Buat notifikasi jika WhatsApp berhasil dan metadata ada
      if (result.success && task.metadata) {
        try {
          await createNotifikasi({
            pegawai_id: task.pegawaiId,
            judul: task.metadata.judul || "Notifikasi Sistem",
            pesan: task.message,
            tipe_notifikasi: task.metadata.tipeNotifikasi || "Info",
            laporan_id: task.metadata.laporanId || null,
            link_tujuan: task.metadata.linkTujuan || null,
            action_required: task.metadata.actionRequired || false,
          });
          console.log(
            `✅ Background task completed: WhatsApp sent & notification created for pegawai ID ${task.pegawaiId}`
          );
        } catch (notifError: any) {
          console.error(
            "❌ Background task: WhatsApp sent but notification failed:",
            notifError.message
          );
        }
      } else if (result.success) {
        console.log(
          `✅ Background task completed: WhatsApp sent to ${task.phone}`
        );
      } else {
        console.error(
          `❌ Background task failed: WhatsApp not sent - ${errorMessage}`
        );
      }
    } catch (error: any) {
      console.error("❌ Background task error:", error.message);
    }
  });

  // Return immediately without waiting
  console.log(
    `📋 WhatsApp & notification task queued for background processing`
  );
}

/**
 * Kirim WhatsApp saja tanpa notifikasi (untuk kasus khusus)
 */
export async function sendWhatsAppInBackground(
  phone: string,
  message: string,
  pegawaiId?: number
) {
  setImmediate(async () => {
    try {
      const result = await sendWhatsAppMessage({ phone, message });

      if (result.success) {
        console.log(`✅ Background WhatsApp sent to: ${phone}`);
      } else {
        console.error(`❌ Background WhatsApp failed: ${result.error}`);
      }

      // Optional: Log to database
      if (pegawaiId) {
        try {
          await executeInsert(
            `INSERT INTO whatsapp_log (pegawai_id, phone, message, status, error_message, sent_at) 
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              pegawaiId,
              phone,
              message.substring(0, 500),
              result.success ? "sent" : "failed",
              result.error || null,
            ]
          );
        } catch (logError) {
          console.error("⚠️ Failed to log WhatsApp:", logError);
        }
      }
    } catch (error: any) {
      console.error("❌ Background WhatsApp error:", error.message);
    }
  });
}

// app/api/reminder/events/route.ts

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/helpers/auth-helper";
import {
  listActiveRemindersForPegawai,
  markReminderSent,
} from "@/lib/models/reminder.model";
import {
  sendWhatsAppMessage,
  formatReminderMessage,
} from "@/lib/helpers/whatsapp-helper";

import type { ReminderDay, ReminderListItem } from "@/lib/types";

const encoder = new TextEncoder();

const DAY_INDEX: Record<ReminderDay, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 0,
};

const DAY_ORDER: ReminderDay[] = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

function parseReminderDays(value: string | null): ReminderDay[] {
  if (!value) return [];
  return value
    .split(",")
    .map((day) => day.trim())
    .filter((day): day is ReminderDay =>
      DAY_ORDER.includes(day as ReminderDay)
    );
}

function getTimeParts(time: string) {
  const [hour = "0", minute = "0", second = "0"] = time.split(":");
  return {
    hour: Number.parseInt(hour, 10) || 0,
    minute: Number.parseInt(minute, 10) || 0,
    second: Number.parseInt(second, 10) || 0,
  };
}

function clampDay(year: number, month: number, day: number) {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return Math.min(day, lastDayOfMonth);
}

function deriveAnchorDay(reminder: ReminderListItem) {
  if (reminder.tanggal_spesifik) {
    const date = new Date(reminder.tanggal_spesifik);
    if (!Number.isNaN(date.getTime())) {
      return date.getDate();
    }
  }

  if (reminder.created_at) {
    const created = new Date(reminder.created_at);
    if (!Number.isNaN(created.getTime())) {
      return created.getDate();
    }
  }

  return 1;
}

function buildDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
) {
  const validDay = clampDay(year, month, day);
  return new Date(year, month, validDay, hour, minute, second, 0);
}

/**
 * Cek apakah dua tanggal ada di hari yang sama
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Cek apakah reminder sudah dikirim hari ini
 * Untuk mencegah pengiriman berulang di hari yang sama
 */
function wasAlreadySentToday(reminder: ReminderListItem, now: Date): boolean {
  if (!reminder.terakhir_dikirim) {
    return false;
  }

  const lastSent = new Date(reminder.terakhir_dikirim);
  if (Number.isNaN(lastSent.getTime())) {
    return false;
  }

  // Untuk reminder Harian: Cek apakah sudah kirim hari ini
  if (reminder.tipe_reminder === "Harian") {
    return isSameDay(lastSent, now);
  }

  // Untuk reminder Mingguan: Cek apakah sudah kirim di hari yang sama minggu ini
  if (reminder.tipe_reminder === "Mingguan") {
    // Jika last sent di hari yang sama (day of week) dan dalam 7 hari terakhir
    if (lastSent.getDay() === now.getDay()) {
      const diffDays = Math.floor(
        (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays < 7;
    }
    return false;
  }

  // Untuk reminder Bulanan: Cek apakah sudah kirim di bulan ini
  if (reminder.tipe_reminder === "Bulanan") {
    return (
      lastSent.getFullYear() === now.getFullYear() &&
      lastSent.getMonth() === now.getMonth()
    );
  }

  // Untuk reminder Sekali: Jika sudah pernah kirim, return true
  if (reminder.tipe_reminder === "Sekali") {
    return true; // Sudah tidak aktif by markReminderSent, tapi double check
  }

  return false;
}

/**
 * Dapatkan waktu scheduled berikutnya untuk reminder
 */
function getNextOccurrence(
  reminder: ReminderListItem,
  afterDate: Date
): Date | null {
  if (reminder.is_active !== 1) {
    return null;
  }

  const { hour, minute, second } = getTimeParts(reminder.waktu_reminder);

  switch (reminder.tipe_reminder) {
    case "Harian": {
      const candidate = new Date(afterDate);
      candidate.setHours(hour, minute, second, 0);
      if (candidate <= afterDate) {
        candidate.setDate(candidate.getDate() + 1);
      }
      return candidate;
    }
    case "Mingguan": {
      const days = parseReminderDays(reminder.hari_dalam_minggu);
      if (!days.length) return null;
      let nextCandidate: Date | null = null;
      const currentDay = afterDate.getDay();

      for (const day of days) {
        const targetIndex = DAY_INDEX[day];
        let diff = (targetIndex - currentDay + 7) % 7;
        let candidate = new Date(afterDate);
        candidate.setDate(candidate.getDate() + diff);
        candidate.setHours(hour, minute, second, 0);
        if (candidate <= afterDate) {
          candidate.setDate(candidate.getDate() + 7);
        }

        if (!nextCandidate || candidate < nextCandidate) {
          nextCandidate = candidate;
        }
      }

      return nextCandidate;
    }
    case "Bulanan": {
      const anchorDay = deriveAnchorDay(reminder);
      const candidate = buildDate(
        afterDate.getFullYear(),
        afterDate.getMonth(),
        anchorDay,
        hour,
        minute,
        second
      );

      if (candidate <= afterDate) {
        return buildDate(
          candidate.getFullYear(),
          candidate.getMonth() + 1,
          anchorDay,
          hour,
          minute,
          second
        );
      }

      return candidate;
    }
    case "Sekali": {
      if (!reminder.tanggal_spesifik) return null;
      const scheduled = new Date(`${reminder.tanggal_spesifik}T00:00:00`);
      if (Number.isNaN(scheduled.getTime())) return null;
      scheduled.setHours(hour, minute, second, 0);
      if (scheduled <= afterDate) {
        return null;
      }
      return scheduled;
    }
    default:
      return null;
  }
}

function getReferenceDate(reminder: ReminderListItem) {
  if (reminder.terakhir_dikirim) {
    const last = new Date(reminder.terakhir_dikirim);
    if (!Number.isNaN(last.getTime())) {
      return last;
    }
  }

  if (reminder.created_at) {
    const created = new Date(reminder.created_at);
    if (!Number.isNaN(created.getTime())) {
      return created;
    }
  }

  return new Date();
}

function writeEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: string,
  data: unknown
) {
  controller.enqueue(
    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  );
}

/**
 * Kirim notifikasi WhatsApp untuk reminder
 */
async function sendReminderWhatsApp(
  reminder: any,
  scheduledAt: Date
): Promise<void> {
  try {
    const noHp = reminder.no_hp;

    if (!noHp) {
      console.log(
        `Reminder ${reminder.reminder_id}: Tidak ada nomor WhatsApp untuk pegawai ${reminder.pegawai_nama}`
      );
      return;
    }

    const message = formatReminderMessage({
      title: reminder.judul_reminder,
      message: reminder.pesan_reminder,
      tipe: reminder.tipe_reminder,
      scheduledAt: scheduledAt.toISOString(),
      pegawaiName: reminder.pegawai_nama ?? undefined,
    });

    const result = await sendWhatsAppMessage({
      phone: noHp,
      message: message,
      duration: 3600,
    });

    if (result.success) {
      console.log(
        `✅ WhatsApp sent for reminder ${reminder.reminder_id} to ${noHp}`
      );
    } else {
      console.error(
        `❌ Failed to send WhatsApp for reminder ${reminder.reminder_id}:`,
        result.error
      );
    }
  } catch (error) {
    console.error(
      `Error sending WhatsApp for reminder ${reminder.reminder_id}:`,
      error
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const pegawaiId = user.pegawai_id;

    if (!pegawaiId) {
      return NextResponse.json(
        { success: false, message: "Pegawai tidak ditemukan" },
        { status: 400 }
      );
    }

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        writeEvent(controller, "connected", { connected: true });

        let active = true;

        const checkReminders = async () => {
          try {
            const reminders = await listActiveRemindersForPegawai(pegawaiId);
            const now = new Date();

            for (const reminder of reminders) {
              const reference = getReferenceDate(reminder);
              const nextOccurrence = getNextOccurrence(reminder, reference);

              if (!nextOccurrence) continue;
              if (nextOccurrence > now) continue;

              // ✅ CEK: Apakah reminder sudah dikirim hari ini?
              if (wasAlreadySentToday(reminder, now)) {
                console.log(
                  `⏭️ Reminder ${reminder.reminder_id} (${reminder.judul_reminder}) sudah dikirim hari ini, skip.`
                );
                continue;
              }

              // Kirim SSE event ke browser
              writeEvent(controller, "reminder", {
                reminderId: reminder.reminder_id,
                title: reminder.judul_reminder,
                message: reminder.pesan_reminder,
                tipe: reminder.tipe_reminder,
                scheduled_at: nextOccurrence.toISOString(),
              });

              // Kirim notifikasi WhatsApp (non-blocking)
              sendReminderWhatsApp(reminder, nextOccurrence).catch((error) => {
                console.error(
                  `WhatsApp notification failed for reminder ${reminder.reminder_id}:`,
                  error
                );
              });

              // Mark as sent dengan waktu sekarang (bukan nextOccurrence)
              await markReminderSent(
                reminder.reminder_id,
                now, // ← Gunakan waktu sekarang, bukan scheduled time
                reminder.tipe_reminder === "Sekali"
              );

              console.log(
                `📨 Reminder ${reminder.reminder_id} (${reminder.judul_reminder}) berhasil dikirim`
              );
            }
          } catch (error) {
            console.error("Failed to process reminder notifications:", error);
            writeEvent(controller, "notify-error", {
              message: "Gagal memproses notifikasi reminder",
            });
          }
        };

        const runCheck = () => {
          if (!active) return;
          checkReminders().catch((error) => {
            console.error("Reminder notification loop failed:", error);
            writeEvent(controller, "notify-error", {
              message: "Gagal memproses notifikasi reminder",
            });
          });
        };

        runCheck();

        const intervalId = setInterval(runCheck, 60_000);
        const heartbeatId = setInterval(() => {
          controller.enqueue(encoder.encode(": ping\n\n"));
        }, 45_000);

        const cleanup = () => {
          active = false;
          clearInterval(intervalId);
          clearInterval(heartbeatId);
          try {
            controller.close();
          } catch (err) {
            console.debug("SSE controller already closed", err);
          }
        };

        request.signal.addEventListener("abort", cleanup);
      },
      cancel() {
        // handled via abort listener
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Failed to initialise reminder SSE:", error);
    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal membuat koneksi SSE" },
      { status: 500 }
    );
  }
}

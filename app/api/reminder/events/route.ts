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
import {
  resolveDueReminderOccurrence,
  wasReminderAlreadySent,
} from "@/lib/helpers/reminder-scheduler";

//import type { ReminderDay, ReminderListItem } from "@/lib/types";
import type { ReminderListItem } from "@/lib/types";

const encoder = new TextEncoder();

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
              // ✅ CEK: Apakah reminder sudah dikirim hari ini?
              const scheduledAt = resolveDueReminderOccurrence(reminder, now);

              if (!scheduledAt) {
                if (wasReminderAlreadySent(reminder, now)) {
                  console.log(
                    `⏭️ Reminder ${reminder.reminder_id} (${reminder.judul_reminder}) sudah dikirim untuk periode ini, skip.`
                  );
                }
                continue;
              }

              // Kirim SSE event ke browser
              writeEvent(controller, "reminder", {
                reminderId: reminder.reminder_id,
                title: reminder.judul_reminder,
                message: reminder.pesan_reminder,
                tipe: reminder.tipe_reminder,
                scheduled_at: scheduledAt.toISOString(),
              });

              // Kirim notifikasi WhatsApp (non-blocking)
              sendReminderWhatsApp(reminder, scheduledAt).catch((error) => {
                console.error(
                  `WhatsApp notification failed for reminder ${reminder.reminder_id}:`,
                  error
                );
              });

              // Mark as sent dengan waktu sekarang (bukan scheduledAt)
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

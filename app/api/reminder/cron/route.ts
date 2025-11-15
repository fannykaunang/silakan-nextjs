// app/api/reminder/cron/route.ts
import { NextResponse } from "next/server";

import {
  listAllActiveReminders,
  markReminderSent,
} from "@/lib/models/reminder.model";
import { createNotifikasi } from "@/lib/models/notifikasi.model";
import {
  formatReminderMessage,
  sendWhatsAppMessage,
} from "@/lib/helpers/whatsapp-helper";
import { resolveDueReminderOccurrence } from "@/lib/helpers/reminder-scheduler";

const CRON_SECRET = process.env.REMINDER_CRON_SECRET;

function extractSecret(request: Request) {
  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret?.trim()) {
    return headerSecret.trim();
  }

  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  const url = new URL(request.url);
  const querySecret = url.searchParams.get("token");
  if (querySecret?.trim()) {
    return querySecret.trim();
  }

  return null;
}

async function handleRequest(request: Request) {
  if (!CRON_SECRET) {
    return NextResponse.json(
      {
        success: false,
        message: "REMINDER_CRON_SECRET belum dikonfigurasi di environment.",
      },
      { status: 500 }
    );
  }

  const providedSecret = extractSecret(request);
  if (providedSecret !== CRON_SECRET) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const reminders = await listAllActiveReminders();
    const now = new Date();
    type ReminderCronResult = {
      reminderId: number;
      pegawaiId: number;
      status: "sent" | "failed" | "skipped-no-phone";
      scheduledAt: string;
      phoneNumber?: string | null;
      error?: string;
      notificationCreated?: boolean;
      notificationError?: string;
      markSent?: boolean;
      markError?: string;
    };

    const results: ReminderCronResult[] = [];

    const summary = {
      totalActiveReminders: reminders.length,
      dueReminders: 0,
      sent: 0,
      failed: 0,
      skippedNoPhone: 0,
      notificationsCreated: 0,
      notificationsFailed: 0,
      markedAsSent: 0,
    };

    for (const reminder of reminders) {
      const scheduledAt = resolveDueReminderOccurrence(reminder, now);
      if (!scheduledAt) {
        continue;
      }

      summary.dueReminders += 1;

      const formattedScheduledAt = scheduledAt.toISOString();
      const message = formatReminderMessage({
        title: reminder.judul_reminder,
        message: reminder.pesan_reminder,
        tipe: reminder.tipe_reminder,
        scheduledAt: formattedScheduledAt,
        pegawaiName: reminder.pegawai_nama ?? undefined,
      });

      const result: ReminderCronResult = {
        reminderId: reminder.reminder_id,
        pegawaiId: reminder.pegawai_id,
        scheduledAt: formattedScheduledAt,
        status: "failed",
        phoneNumber: reminder.no_hp ?? null,
      };

      const phoneNumber = reminder.no_hp?.trim();
      if (!phoneNumber) {
        result.status = "skipped-no-phone";
        result.error = "Nomor WhatsApp tidak tersedia";
        summary.skippedNoPhone += 1;
      } else {
        const sendResult = await sendWhatsAppMessage({
          phone: phoneNumber,
          message,
          duration: 3600,
        });

        if (sendResult.success) {
          result.status = "sent";
          summary.sent += 1;
        } else {
          result.status = "failed";
          result.error = sendResult.error || "Gagal mengirim pesan WhatsApp";
          summary.failed += 1;
        }
      }

      try {
        await createNotifikasi({
          pegawai_id: reminder.pegawai_id,
          judul: reminder.judul_reminder,
          pesan: message,
          tipe_notifikasi: "Reminder",
          link_tujuan: "/reminder",
          action_required: false,
        });
        result.notificationCreated = true;
        summary.notificationsCreated += 1;
      } catch (error) {
        const messageError =
          error instanceof Error ? error.message : "Gagal menyimpan notifikasi";
        result.notificationCreated = false;
        result.notificationError = messageError;
        summary.notificationsFailed += 1;
      }

      try {
        await markReminderSent(
          reminder.reminder_id,
          now,
          reminder.tipe_reminder === "Sekali"
        );
        result.markSent = true;
        summary.markedAsSent += 1;
      } catch (error) {
        result.markSent = false;
        result.markError =
          error instanceof Error
            ? error.message
            : "Gagal memperbarui status reminder";
      }

      results.push(result);
    }

    return NextResponse.json({
      success: true,
      message: "Reminder berhasil diproses",
      summary,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Reminder cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses reminder",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

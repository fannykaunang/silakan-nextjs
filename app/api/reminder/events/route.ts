// app/api/reminder/events/route.ts

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/helpers/auth-helper";
import {
  listActiveRemindersForPegawai,
  markReminderSent,
} from "@/lib/models/reminder.model";

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

              writeEvent(controller, "reminder", {
                reminderId: reminder.reminder_id,
                title: reminder.judul_reminder,
                message: reminder.pesan_reminder,
                tipe: reminder.tipe_reminder,
                scheduled_at: nextOccurrence.toISOString(),
              });

              await markReminderSent(
                reminder.reminder_id,
                nextOccurrence,
                reminder.tipe_reminder === "Sekali"
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

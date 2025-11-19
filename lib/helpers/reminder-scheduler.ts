// lib/helpers/reminder-scheduler.ts
import type { ReminderDay, ReminderListItem } from "@/lib/types";

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

export function parseReminderDays(value: string | null): ReminderDay[] {
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

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function wasReminderAlreadySent(
  reminder: ReminderListItem,
  now: Date
): boolean {
  if (!reminder.terakhir_dikirim) {
    return false;
  }

  const lastSent = new Date(reminder.terakhir_dikirim);
  if (Number.isNaN(lastSent.getTime())) {
    return false;
  }

  switch (reminder.tipe_reminder) {
    case "Harian":
      return isSameDay(lastSent, now);
    case "Mingguan": {
      if (lastSent.getDay() !== now.getDay()) {
        return false;
      }
      const diffDays = Math.floor(
        (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays < 7;
    }
    case "Bulanan":
      return (
        lastSent.getFullYear() === now.getFullYear() &&
        lastSent.getMonth() === now.getMonth()
      );
    case "Sekali":
      return true;
    default:
      return false;
  }
}

export function getReminderReferenceDate(reminder: ReminderListItem) {
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

export function getNextReminderOccurrence(
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
        const diff = (targetIndex - currentDay + 7) % 7;
        const candidate = new Date(afterDate);
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

export function resolveDueReminderOccurrence(
  reminder: ReminderListItem,
  now: Date
): Date | null {
  const reference = getReminderReferenceDate(reminder);
  const nextOccurrence = getNextReminderOccurrence(reminder, reference);
  if (!nextOccurrence) {
    return null;
  }
  if (nextOccurrence > now) {
    return null;
  }
  if (wasReminderAlreadySent(reminder, now)) {
    return null;
  }

  // 🔥 TAMBAHKAN CEK INI sebelum return
  if (reminder.terakhir_dikirim) {
    const lastSent = new Date(reminder.terakhir_dikirim);

    // Untuk reminder sekali, jangan kirim lagi
    if (reminder.tipe_reminder === "Sekali") {
      return null;
    }

    // Untuk reminder berulang, cek apakah sudah dikirim untuk occurrence ini
    // Toleransi 5 menit untuk menghindari duplikasi
    const diffMinutes = Math.abs(
      (nextOccurrence.getTime() - lastSent.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 5) {
      return null; // Sudah terkirim untuk jadwal ini
    }
  }

  return nextOccurrence;
}

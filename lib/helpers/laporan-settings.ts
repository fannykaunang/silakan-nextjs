// lib/helpers/laporan-settings.ts
import { fetchSettingsByKeys } from "@/lib/models/settings-laporan-kegiatan.model";
import type { Setting } from "@/lib/types";

const LAPORAN_SETTING_KEYS = [
  "min_durasi_kegiatan",
  "max_durasi_kegiatan",
  "batas_waktu_submit_laporan",
  "auto_verifikasi_enabled",
  "jam_kerja_mulai",
  "jam_kerja_selesai",
] as const;

const DEFAULT_MIN_DURASI = 1;
const DEFAULT_MAX_DURASI = 720;
const DEFAULT_DEADLINE_DAYS = 7;
const DEFAULT_WORK_START = "08:00";
const DEFAULT_WORK_END = "17:00";

export interface LaporanSettings {
  minDurasi: number;
  maxDurasi: number;
  submissionDeadlineDays: number;
  autoVerificationEnabled: boolean;
  workStartMinutes: number;
  workEndMinutes: number;
  workStartLabel: string;
  workEndLabel: string;
}

type SettingKey = (typeof LAPORAN_SETTING_KEYS)[number];
type SettingMap = Record<string, Setting>;

function parseNumberSetting(
  map: SettingMap,
  key: SettingKey,
  fallback: number
): number {
  const raw = map[key]?.setting_value;
  if (raw === undefined || raw === null) {
    return fallback;
  }

  const parsed = Number.parseInt(String(raw), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBooleanSetting(
  map: SettingMap,
  key: SettingKey,
  fallback: boolean
): boolean {
  const raw = map[key]?.setting_value;
  if (raw === undefined || raw === null) {
    return fallback;
  }

  const normalized = String(raw).trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  return fallback;
}

function parseTimeString(value: string | null | undefined, fallback: string) {
  const raw = value?.trim() || fallback;
  const match = raw.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return { raw: fallback, minutes: timeToMinutes(fallback)! };
  }

  const minutes = timeToMinutes(raw);
  if (minutes === null) {
    return { raw: fallback, minutes: timeToMinutes(fallback)! };
  }

  return { raw, minutes };
}

export async function loadLaporanSettings(): Promise<LaporanSettings> {
  const map = await fetchSettingsByKeys([...LAPORAN_SETTING_KEYS]);

  const minDurasi = parseNumberSetting(
    map,
    "min_durasi_kegiatan",
    DEFAULT_MIN_DURASI
  );
  const maxDurasi = parseNumberSetting(
    map,
    "max_durasi_kegiatan",
    DEFAULT_MAX_DURASI
  );
  const submissionDeadlineDays = parseNumberSetting(
    map,
    "batas_waktu_submit_laporan",
    DEFAULT_DEADLINE_DAYS
  );
  const autoVerificationEnabled = parseBooleanSetting(
    map,
    "auto_verifikasi_enabled",
    false
  );

  const workStart = parseTimeString(
    map["jam_kerja_mulai"]?.setting_value,
    DEFAULT_WORK_START
  );
  const workEnd = parseTimeString(
    map["jam_kerja_selesai"]?.setting_value,
    DEFAULT_WORK_END
  );

  return {
    minDurasi,
    maxDurasi,
    submissionDeadlineDays,
    autoVerificationEnabled,
    workStartMinutes: workStart.minutes,
    workEndMinutes: workEnd.minutes,
    workStartLabel: workStart.raw,
    workEndLabel: workEnd.raw,
  };
}

export function timeToMinutes(value: string): number | null {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

export function calculateDurationMinutes(
  start: string,
  end: string
): number | null {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (
    startMinutes === null ||
    endMinutes === null ||
    endMinutes <= startMinutes
  ) {
    return null;
  }

  return endMinutes - startMinutes;
}

function parseDateOnly(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10) - 1;
  const day = Number.parseInt(match[3], 10);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }

  return new Date(Date.UTC(year, month, day));
}

export function calculateDayDifference(
  fromDate: string,
  toDate: string
): number | null {
  const start = parseDateOnly(fromDate);
  const end = parseDateOnly(toDate);

  if (!start || !end) {
    return null;
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

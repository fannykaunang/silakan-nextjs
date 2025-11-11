// lib/types/reminder.types.ts
import { RowDataPacket } from "mysql2";

export type ReminderType = "Harian" | "Mingguan" | "Bulanan" | "Sekali";

export type ReminderDay =
  | "Senin"
  | "Selasa"
  | "Rabu"
  | "Kamis"
  | "Jumat"
  | "Sabtu"
  | "Minggu";

export interface ReminderRow extends RowDataPacket {
  reminder_id: number;
  pegawai_id: number;
  judul_reminder: string;
  pesan_reminder: string | null;
  tipe_reminder: ReminderType;
  waktu_reminder: string;
  hari_dalam_minggu: string | null;
  tanggal_spesifik: string | null;
  is_active: 0 | 1;
  terakhir_dikirim: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ReminderListItem extends ReminderRow {
  pegawai_nama: string | null;
  no_hp?: string | null;
}

export interface ReminderStats {
  total: number;
  active: number;
  harian: number;
  mingguan: number;
  bulanan: number;
}

export type ReminderPayload = {
  pegawai_id: number;
  judul_reminder: string;
  pesan_reminder?: string | null;
  tipe_reminder: ReminderType;
  waktu_reminder: string;
  hari_dalam_minggu?: ReminderDay[];
  tanggal_spesifik?: string | null;
  is_active?: boolean;
};

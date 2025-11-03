// lib/types/notifikasi.types.ts
import { RowDataPacket } from "mysql2/promise";

export type TipeNotifikasi =
  | "Verifikasi"
  | "Penolakan"
  | "Komentar"
  | "Reminder"
  | "Info"
  | "Peringatan";

export interface Notifikasi extends RowDataPacket {
  notifikasi_id: number;
  pegawai_id: number;
  judul: string;
  pesan: string;
  tipe_notifikasi: TipeNotifikasi;
  laporan_id: number | null;
  link_tujuan: string | null;
  action_required: number; // 0 atau 1 (boolean)
  is_read: number; // 0 atau 1 (boolean)
  tanggal_dibaca: Date | null;
  created_at: Date;
}

export interface CreateNotifikasiInput {
  pegawai_id: number;
  judul: string;
  pesan: string;
  tipe_notifikasi?: TipeNotifikasi;
  laporan_id?: number | null;
  link_tujuan?: string | null;
  action_required?: number;
}

export interface NotifikasiWithPegawai extends Notifikasi {
  pegawai_nama?: string;
}

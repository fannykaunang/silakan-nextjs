// lib/types/log.types.ts
import { RowDataPacket } from "mysql2/promise";

export interface LogAktivitas extends RowDataPacket {
  log_id: number;
  pegawai_id: number | null; // ✅ PERBAIKAN: Bisa null sesuai schema database
  aksi: string;
  modul: string;
  detail_aksi?: string;
  data_sebelum?: any; // JSON
  data_sesudah?: any; // JSON
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  method?: string;
  created_at?: Date;
}

export interface CreateLogInput {
  pegawai_id: number | null; // ✅ PERBAIKAN: Ubah dari number ke number | null
  aksi: string;
  modul: string;
  detail_aksi?: string | null;
  data_sebelum?: any | null;
  data_sesudah?: any | null;
  ip_address?: string | null;
  user_agent?: string | null;
  endpoint?: string | null;
  method?: string | null;
}

export interface CreateLogWithDataInput extends CreateLogInput {
  data_sebelum: any;
  data_sesudah: any;
}

// lib/types/pegawai.types.ts
import { RowDataPacket } from "mysql2/promise";

export interface Pegawai extends RowDataPacket {
  pegawai_id: number;
  pegawai_pin: string;
  pegawai_nip: string;
  pegawai_nama: string;
  tempat_lahir?: string;
  tgl_lahir?: string;
  gender?: number;
  pegawai_telp?: string;
  pegawai_privilege?: string;
  pegawai_status?: number;
  jabatan?: string;
  skpd?: string;
  sotk?: string;
  tgl_mulai_kerja?: string;
  photo_path?: string;
  last_sync?: Date;
  created_at?: Date;
}

export interface PegawaiWithRelations extends Pegawai {
  pegawai_pin: string;
  pegawai_nip: string;
  pegawai_nama: string;
  tempat_lahir?: string;
  tgl_lahir?: string;
  gender?: number;
}

export interface CreatePegawaiInput {
  pegawai_id: number;
  pegawai_pin: string;
  pegawai_nip: string;
  pegawai_nama: string;
  tempat_lahir?: string;
  tgl_lahir?: string;
  gender?: number;
  pegawai_telp?: string;
  pegawai_privilege?: string;
  pegawai_status?: number;
  jabatan?: string;
  skpd?: string;
  sotk?: string;
  tgl_mulai_kerja?: string;
  photo_path?: string;
}

export interface UpdatePegawaiInput {
  pegawai_nama?: string;
  pegawai_telp?: string;
  jabatan?: string;
  photo_path?: string;
}

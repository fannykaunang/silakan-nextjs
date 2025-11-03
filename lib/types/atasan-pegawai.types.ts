// lib/types/atasan-pegawai.types.ts

export interface AtasanPegawaiData {
  id: number;
  pegawai_id: number;
  pegawai_nama?: string;
  atasan_id: number;
  atasan_nama?: string;
  jenis_atasan: "Langsung" | "Tidak Langsung" | "PLT" | "PLH";
  is_active: number;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAtasanPegawaiInput {
  pegawai_id: number;
  atasan_id: number;
  jenis_atasan: "Langsung" | "Tidak Langsung" | "PLT" | "PLH";
  is_active?: number;
  tanggal_mulai: string;
  tanggal_selesai?: string | null;
  keterangan?: string | null;
}

export interface UpdateAtasanPegawaiInput {
  pegawai_id?: number;
  atasan_id?: number;
  jenis_atasan?: "Langsung" | "Tidak Langsung" | "PLT" | "PLH";
  is_active?: number;
  tanggal_mulai?: string;
  tanggal_selesai?: string | null;
  keterangan?: string | null;
}

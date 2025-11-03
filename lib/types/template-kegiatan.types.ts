// lib/types/template-kegiatan.ts
import { RowDataPacket } from "mysql2/promise";

export interface TemplateKegiatan extends RowDataPacket {
  template_id: number;
  pegawai_id: number;
  nama_template: string;
  kategori_id: number;
  deskripsi_template: string | null;
  target_output_default: string | null;
  lokasi_default: string | null;
  durasi_estimasi_menit: number;
  is_public: number;
  unit_kerja_akses: string | null;
  jumlah_penggunaan: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateKegiatanWithRelations extends TemplateKegiatan {
  pegawai_nama?: string;
  kategori_nama?: string;
  kategori_kode?: string;
  kategori_warna?: string;
}

export interface CreateTemplateKegiatanDTO {
  nama_template: string;
  kategori_id: number;
  deskripsi_template?: string | null;
  target_output_default?: string | null;
  lokasi_default?: string | null;
  durasi_estimasi_menit?: number;
  is_public?: number;
  unit_kerja_akses?: string | null;
  is_active?: number;
}

export interface UpdateTemplateKegiatanDTO {
  nama_template?: string;
  kategori_id?: number;
  deskripsi_template?: string | null;
  target_output_default?: string | null;
  lokasi_default?: string | null;
  durasi_estimasi_menit?: number;
  is_public?: number;
  unit_kerja_akses?: string | null;
  jumlah_penggunaan?: number;
  is_active?: number;
}

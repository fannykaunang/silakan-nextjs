// lib/types/laporan.types.ts
import { RowDataPacket } from "mysql2/promise";

export interface LaporanKegiatan extends RowDataPacket {
  laporan_id: number;
  pegawai_id: number;
  tanggal_kegiatan: string;
  kategori_id: number;
  nama_kegiatan: string;
  deskripsi_kegiatan: string;
  target_output?: string;
  hasil_output?: string;
  waktu_mulai: string;
  waktu_selesai: string;
  durasi_menit?: number;
  lokasi_kegiatan?: string;
  peserta_kegiatan?: string;
  jumlah_peserta?: number;
  kendala?: string;
  solusi?: string;
  status_laporan: "Draft" | "Diajukan" | "Diverifikasi" | "Ditolak" | "Revisi";
  verifikasi_oleh?: number;
  tanggal_verifikasi?: Date;
  catatan_verifikasi?: string;
  rating_kualitas?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateLaporanInput {
  pegawai_id: number;
  tanggal_kegiatan: string;
  kategori_id: number;
  nama_kegiatan: string;
  deskripsi_kegiatan: string;
  target_output?: string;
  hasil_output?: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi_kegiatan?: string;
  peserta_kegiatan?: string;
  jumlah_peserta?: number;
  kendala?: string;
  solusi?: string;
}

export interface UpdateLaporanInput {
  nama_kegiatan?: string;
  deskripsi_kegiatan?: string;
  hasil_output?: string;
  kendala?: string;
  solusi?: string;
  status_laporan?: "Draft" | "Diajukan" | "Diverifikasi" | "Ditolak" | "Revisi";
}

export interface VerifikasiLaporanInput {
  verifikasi_oleh: number;
  status_laporan: "Diverifikasi" | "Ditolak" | "Revisi";
  catatan_verifikasi?: string;
  rating_kualitas?: number;
}

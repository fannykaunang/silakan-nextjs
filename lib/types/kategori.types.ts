// lib/types/kategori.types.ts
import { RowDataPacket } from "mysql2/promise";

export interface KategoriKegiatan extends RowDataPacket {
  kategori_id: number;
  kode_kategori: string;
  nama_kategori: string;
  deskripsi: string | null;
  warna: string;
  icon: string | null;
  is_active: number; // 0 atau 1
  urutan: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateKategoriInput {
  kode_kategori: string;
  nama_kategori: string;
  deskripsi?: string | null;
  warna?: string;
  icon?: string | null;
  is_active?: number;
  urutan?: number;
}

export interface UpdateKategoriInput {
  kode_kategori?: string;
  nama_kategori?: string;
  deskripsi?: string | null;
  warna?: string;
  icon?: string | null;
  is_active?: number;
  urutan?: number;
}

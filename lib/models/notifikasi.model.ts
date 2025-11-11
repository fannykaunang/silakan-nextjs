// File: lib/models/notifikasi.model.ts

import { executeQuery } from "@/lib/helpers/db-helpers";

// Interface untuk parameter fungsi createNotifikasi
export interface CreateNotifikasiParams {
  pegawai_id: number;
  judul: string;
  pesan: string;
  tipe_notifikasi: string;
  laporan_id?: number | null; // Opsional, karena tidak semua notifikasi terkait laporan
  link_tujuan?: string | null;
  action_required?: boolean;
}

/**
 * Menyimpan entri baru ke tabel notifikasi
 */
export async function createNotifikasi(params: CreateNotifikasiParams) {
  const {
    pegawai_id,
    judul,
    pesan,
    tipe_notifikasi,
    laporan_id,
    link_tujuan,
    action_required = false, // Default false
  } = params;

  const query = `
    INSERT INTO notifikasi (
      pegawai_id, judul, pesan, tipe_notifikasi, laporan_id, link_tujuan, action_required, is_read
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `;

  const values = [
    pegawai_id,
    judul,
    pesan,
    tipe_notifikasi,
    laporan_id,
    link_tujuan,
    action_required ? 1 : 0, // Konversi boolean ke 1/0 untuk database
  ];

  try {
    const result = await executeQuery(query, values);
    // Anda bisa mengembalikan ID notifikasi yang baru dibuat jika perlu
    return { success: true, insertId: (result as any).insertId };
  } catch (error) {
    console.error("Error creating notifikasi:", error);
    // Lempar kembali error agar bisa ditangkap oleh pemanggil
    throw error;
  }
}

// lib/models/rekap.model.ts
import { executeQuery, executeUpdate } from "@/lib/helpers/db-helpers";
import { RowDataPacket } from "mysql2";

// ============================================
// REKAP HARIAN
// ============================================

export interface RekapHarian extends RowDataPacket {
  rekap_id: number;
  pegawai_id: number;
  tanggal: string;
  jumlah_kegiatan: number;
  total_durasi_menit: number;
  jumlah_diverifikasi: number;
  jumlah_pending: number;
  jumlah_ditolak: number;
  produktivitas_persen: number;
  rata_rata_rating: number;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

// Upsert rekap harian (auto-update after laporan changes)
export async function upsertRekapHarian(
  pegawaiId: number,
  tanggal: string
): Promise<void> {
  const query = `
    INSERT INTO rekap_harian (
      pegawai_id,
      tanggal,
      jumlah_kegiatan,
      total_durasi_menit,
      jumlah_diverifikasi,
      jumlah_pending,
      jumlah_ditolak,
      produktivitas_persen,
      rata_rata_rating
    )
    SELECT 
      pegawai_id,
      tanggal_kegiatan,
      COUNT(*) as jumlah_kegiatan,
      SUM(durasi_menit) as total_durasi_menit,
      SUM(CASE WHEN status_laporan = 'Diverifikasi' THEN 1 ELSE 0 END) as jumlah_diverifikasi,
      SUM(CASE WHEN status_laporan IN ('Draft', 'Diajukan', 'Revisi') THEN 1 ELSE 0 END) as jumlah_pending,
      SUM(CASE WHEN status_laporan = 'Ditolak' THEN 1 ELSE 0 END) as jumlah_ditolak,
      ROUND((SUM(durasi_menit) / 480) * 100, 2) as produktivitas_persen,
      ROUND(AVG(COALESCE(rating_kualitas, 0)), 2) as rata_rata_rating
    FROM laporan_kegiatan
    WHERE pegawai_id = ? AND tanggal_kegiatan = ?
    GROUP BY pegawai_id, tanggal_kegiatan
    ON DUPLICATE KEY UPDATE
      jumlah_kegiatan = VALUES(jumlah_kegiatan),
      total_durasi_menit = VALUES(total_durasi_menit),
      jumlah_diverifikasi = VALUES(jumlah_diverifikasi),
      jumlah_pending = VALUES(jumlah_pending),
      jumlah_ditolak = VALUES(jumlah_ditolak),
      produktivitas_persen = VALUES(produktivitas_persen),
      rata_rata_rating = VALUES(rata_rata_rating),
      updated_at = CURRENT_TIMESTAMP
  `;

  await executeUpdate(query, [pegawaiId, tanggal]);
}

// Get rekap harian by pegawai and date
export async function getRekapHarian(
  pegawaiId: number,
  tanggal: string
): Promise<RekapHarian | null> {
  const query = `
    SELECT * FROM rekap_harian 
    WHERE pegawai_id = ? AND tanggal = ?
  `;
  const result = await executeQuery<RekapHarian>(query, [pegawaiId, tanggal]);
  return result.length > 0 ? result[0] : null;
}

// ============================================
// REKAP BULANAN
// ============================================

export interface RekapBulanan extends RowDataPacket {
  rekap_id: number;
  pegawai_id: number;
  tahun: number;
  bulan: number;
  total_kegiatan: number;
  total_durasi_menit: number;
  rata_rata_kegiatan_per_hari: number;
  breakdown_kategori: any;
  total_diverifikasi: number;
  total_pending: number;
  total_ditolak: number;
  persentase_verifikasi: number;
  rata_rata_rating: number;
  total_revisi: number;
  created_at: string;
  updated_at: string;
}

// Upsert rekap bulanan (auto-update after laporan changes)
export async function upsertRekapBulanan(
  pegawaiId: number,
  tahun: number,
  bulan: number
): Promise<void> {
  // First, calculate the main statistics
  const statsQuery = `
    INSERT INTO rekap_bulanan (
      pegawai_id,
      tahun,
      bulan,
      total_kegiatan,
      total_durasi_menit,
      rata_rata_kegiatan_per_hari,
      total_diverifikasi,
      total_pending,
      total_ditolak,
      persentase_verifikasi,
      rata_rata_rating,
      total_revisi
    )
    SELECT 
      pegawai_id,
      YEAR(tanggal_kegiatan) as tahun,
      MONTH(tanggal_kegiatan) as bulan,
      COUNT(*) as total_kegiatan,
      SUM(durasi_menit) as total_durasi_menit,
      ROUND(COUNT(*) / COUNT(DISTINCT tanggal_kegiatan), 2) as rata_rata_kegiatan_per_hari,
      SUM(CASE WHEN status_laporan = 'Diverifikasi' THEN 1 ELSE 0 END) as total_diverifikasi,
      SUM(CASE WHEN status_laporan IN ('Draft', 'Diajukan', 'Revisi') THEN 1 ELSE 0 END) as total_pending,
      SUM(CASE WHEN status_laporan = 'Ditolak' THEN 1 ELSE 0 END) as total_ditolak,
      ROUND((SUM(CASE WHEN status_laporan = 'Diverifikasi' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as persentase_verifikasi,
      ROUND(AVG(COALESCE(rating_kualitas, 0)), 2) as rata_rata_rating,
      SUM(CASE WHEN status_laporan = 'Revisi' THEN 1 ELSE 0 END) as total_revisi
    FROM laporan_kegiatan
    WHERE pegawai_id = ? 
      AND YEAR(tanggal_kegiatan) = ? 
      AND MONTH(tanggal_kegiatan) = ?
    GROUP BY pegawai_id, YEAR(tanggal_kegiatan), MONTH(tanggal_kegiatan)
    ON DUPLICATE KEY UPDATE
      total_kegiatan = VALUES(total_kegiatan),
      total_durasi_menit = VALUES(total_durasi_menit),
      rata_rata_kegiatan_per_hari = VALUES(rata_rata_kegiatan_per_hari),
      total_diverifikasi = VALUES(total_diverifikasi),
      total_pending = VALUES(total_pending),
      total_ditolak = VALUES(total_ditolak),
      persentase_verifikasi = VALUES(persentase_verifikasi),
      rata_rata_rating = VALUES(rata_rata_rating),
      total_revisi = VALUES(total_revisi),
      updated_at = CURRENT_TIMESTAMP
  `;

  await executeUpdate(statsQuery, [pegawaiId, tahun, bulan]);

  // Then, update the breakdown_kategori JSON
  const breakdownQuery = `
    UPDATE rekap_bulanan
    SET breakdown_kategori = (
      SELECT JSON_OBJECTAGG(kategori_id, jumlah)
      FROM (
        SELECT 
          kategori_id,
          COUNT(*) as jumlah
        FROM laporan_kegiatan
        WHERE pegawai_id = ?
          AND YEAR(tanggal_kegiatan) = ?
          AND MONTH(tanggal_kegiatan) = ?
        GROUP BY kategori_id
      ) AS kategori_counts
    )
    WHERE pegawai_id = ? AND tahun = ? AND bulan = ?
  `;

  await executeUpdate(breakdownQuery, [
    pegawaiId,
    tahun,
    bulan,
    pegawaiId,
    tahun,
    bulan,
  ]);
}

// Get rekap bulanan by pegawai, year, and month
export async function getRekapBulanan(
  pegawaiId: number,
  tahun: number,
  bulan: number
): Promise<RekapBulanan | null> {
  const query = `
    SELECT * FROM rekap_bulanan 
    WHERE pegawai_id = ? AND tahun = ? AND bulan = ?
  `;
  const result = await executeQuery<RekapBulanan>(query, [
    pegawaiId,
    tahun,
    bulan,
  ]);
  return result.length > 0 ? result[0] : null;
}

// Get rekap bulanan for a pegawai for the entire year
export async function getRekapBulananByYear(
  pegawaiId: number,
  tahun: number
): Promise<RekapBulanan[]> {
  const query = `
    SELECT * FROM rekap_bulanan 
    WHERE pegawai_id = ? AND tahun = ?
    ORDER BY bulan ASC
  `;
  return await executeQuery<RekapBulanan>(query, [pegawaiId, tahun]);
}

// ============================================
// HELPER FUNCTION - Update all rekaps for a tanggal
// ============================================

export async function updateAllRekaps(
  pegawaiId: number,
  tanggal: string
): Promise<void> {
  // Parse tanggal to get year and month
  const date = new Date(tanggal);
  const tahun = date.getFullYear();
  const bulan = date.getMonth() + 1;

  // Update rekap harian
  await upsertRekapHarian(pegawaiId, tanggal);

  // Update rekap bulanan
  await upsertRekapBulanan(pegawaiId, tahun, bulan);
}

// lib/models/laporan.model.ts
// COMPLETE UPDATED VERSION dengan files support

import {
  executeQuery,
  executeInsert,
  executeUpdate,
  getOne,
} from "@/lib/helpers/db-helpers";
import { RowDataPacket } from "mysql2";
import { AtasanPegawaiModel } from "@/lib/models/atasan-pegawai.model";
import { updateAllRekaps } from "@/lib/models/rekap.model";
import { createLogWithData } from "@/lib/models/log.model";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface LaporanKegiatan extends RowDataPacket {
  laporan_id: number;
  pegawai_id: number;
  tanggal_kegiatan: string;
  kategori_id: number;
  nama_kegiatan: string;
  deskripsi_kegiatan: string;
  target_output: string | null;
  hasil_output: string | null;
  waktu_mulai: string;
  waktu_selesai: string;
  durasi_menit: number;
  lokasi_kegiatan: string | null;
  latitude: number | null;
  longitude: number | null;
  peserta_kegiatan: string | null;
  jumlah_peserta: number;
  file_bukti: string | null;
  link_referensi: string | null;
  kendala: string | null;
  solusi: string | null;
  status_laporan: "Draft" | "Diajukan" | "Diverifikasi" | "Ditolak" | "Revisi";
  tanggal_submit: string | null;
  verifikasi_oleh: number | null;
  tanggal_verifikasi: string | null;
  catatan_verifikasi: string | null;
  rating_kualitas: number | null;
  is_edited: boolean;
  edit_count: number;
  created_at: string;
  updated_at: string;
}

// ===== UPDATED: Tambahkan FileUploadWithUploader =====
export interface FileUpload extends RowDataPacket {
  file_id: number;
  laporan_id: number;
  nama_file_asli: string;
  nama_file_sistem: string;
  path_file: string;
  tipe_file: string | null;
  ukuran_file: number | null;
  uploaded_by: number;
  deskripsi_file: string | null;
  created_at: string;
}

export interface FileUploadWithUploader extends FileUpload {
  uploader_nama: string;
}

export interface FileUploadWithContext extends FileUploadWithUploader {
  nama_kegiatan: string;
  tanggal_kegiatan: string;
}

// ====================================================

// ===== UPDATED: Tambahkan files property =====
export interface LaporanWithDetails extends LaporanKegiatan {
  pegawai_nama: string;
  pegawai_nip: string;
  nama_kategori: string;
  skpd: string;
  verifikator_nama?: string | null;
  files?: FileUploadWithUploader[]; // ← ADDED
}
// ===========================================

export interface CreateLaporanData {
  pegawai_id: number;
  tanggal_kegiatan: string;
  kategori_id: number;
  nama_kegiatan: string;
  deskripsi_kegiatan: string;
  target_output?: string | null;
  hasil_output?: string | null;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi_kegiatan?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  peserta_kegiatan?: string | null;
  jumlah_peserta?: number;
  link_referensi?: string | null;
  kendala?: string | null;
  solusi?: string | null;
  status_laporan?: "Draft" | "Diajukan";
}

export interface UpdateLaporanData {
  tanggal_kegiatan?: string;
  kategori_id?: number;
  nama_kegiatan?: string;
  deskripsi_kegiatan?: string;
  target_output?: string | null;
  hasil_output?: string | null;
  waktu_mulai?: string;
  waktu_selesai?: string;
  lokasi_kegiatan?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  peserta_kegiatan?: string | null;
  jumlah_peserta?: number;
  link_referensi?: string | null;
  kendala?: string | null;
  solusi?: string | null;
  status_laporan?: "Draft" | "Diajukan" | "Revisi";
}

export interface VerifikasiLaporanData {
  status_laporan: "Diverifikasi" | "Ditolak" | "Revisi";
  verifikasi_oleh: number;
  catatan_verifikasi?: string | null;
  rating_kualitas?: number | null;
}

const AUTO_VERIFY_DELAY_DAYS = 3;

interface AutoVerifyCandidate extends RowDataPacket {
  laporan_id: number;
  pegawai_id: number;
  nama_kegiatan: string;
  tanggal_kegiatan: string;
  created_at: string;
}

// ============================================
// LAPORAN KEGIATAN CRUD
// ============================================

// Get all laporan with details (JOIN pegawai & kategori)
export async function getAllLaporan(
  pegawaiIds?: number | number[],
  isAdmin: boolean = false
): Promise<LaporanWithDetails[]> {
  let query = `
    SELECT 
      lk.*,
      pc.pegawai_nama,
      pc.pegawai_nip,
      pc.skpd,
      kk.nama_kategori
    FROM laporan_kegiatan lk
    INNER JOIN pegawai_cache pc ON lk.pegawai_id = pc.pegawai_id
    INNER JOIN kategori_kegiatan kk ON lk.kategori_id = kk.kategori_id
  `;

  const params: any[] = [];

  // Jika bukan admin, filter berdasarkan pegawai_id
  if (!isAdmin) {
    const idsArray = Array.isArray(pegawaiIds)
      ? pegawaiIds
      : typeof pegawaiIds === "number"
      ? [pegawaiIds]
      : [];

    if (idsArray.length === 0) {
      query += " WHERE 1 = 0";
    } else {
      const placeholders = idsArray.map(() => "?").join(", ");
      query += ` WHERE lk.pegawai_id IN (${placeholders})`;
      params.push(...idsArray);
    }
  }

  query += ` ORDER BY lk.tanggal_kegiatan DESC, lk.created_at DESC`;

  return await executeQuery<LaporanWithDetails>(query, params);
}

export async function getLaporanByPegawaiAndMonth(
  pegawaiId: number,
  tahun: number,
  bulan: number
): Promise<LaporanWithDetails[]> {
  const query = `
    SELECT
      lk.*,
      pc.pegawai_nama,
      pc.pegawai_nip,
      pc.skpd,
      kk.nama_kategori
    FROM laporan_kegiatan lk
    INNER JOIN pegawai_cache pc ON lk.pegawai_id = pc.pegawai_id
    INNER JOIN kategori_kegiatan kk ON lk.kategori_id = kk.kategori_id
    WHERE lk.pegawai_id = ?
      AND YEAR(lk.tanggal_kegiatan) = ?
      AND MONTH(lk.tanggal_kegiatan) = ?
    ORDER BY lk.tanggal_kegiatan ASC, lk.waktu_mulai ASC, lk.created_at ASC
  `;

  return await executeQuery<LaporanWithDetails>(query, [
    pegawaiId,
    tahun,
    bulan,
  ]);
}

// ===== UPDATED: getLaporanById dengan files =====
export async function getLaporanById(
  laporanId: number
): Promise<LaporanWithDetails | null> {
  // ✅ VALIDASI INPUT - Pastikan laporanId valid
  if (!laporanId || isNaN(laporanId) || laporanId <= 0) {
    console.error("❌ Invalid laporanId:", laporanId);
    return null; // Return null untuk ID tidak valid
  }

  const query = `
    SELECT 
      lk.*,
      pc.pegawai_nama,
      pc.pegawai_nip,
      pc.skpd,
      kk.kode_kategori,
      kk.nama_kategori,
      v.pegawai_nama as verifikator_nama
    FROM laporan_kegiatan lk
    INNER JOIN pegawai_cache pc ON lk.pegawai_id = pc.pegawai_id
    INNER JOIN kategori_kegiatan kk ON lk.kategori_id = kk.kategori_id
    LEFT JOIN pegawai_cache v ON lk.verifikasi_oleh = v.pegawai_id
    WHERE lk.laporan_id = ?
  `;

  try {
    const laporan = await getOne<LaporanWithDetails>(query, [laporanId]);

    // Query files jika laporan ditemukan
    if (laporan) {
      console.log("🔍 Model: Querying files for laporan_id:", laporanId);
      const filesQuery = `
        SELECT 
          fu.*,
          pc.pegawai_nama as uploader_nama
        FROM file_upload fu
        INNER JOIN pegawai_cache pc ON fu.uploaded_by = pc.pegawai_id
        WHERE fu.laporan_id = ?
        ORDER BY fu.created_at ASC
      `;
      const files = await executeQuery<FileUploadWithUploader>(filesQuery, [
        laporanId,
      ]);
      console.log("📁 Model: Files found:", files.length);
      if (files.length > 0) {
        console.log(
          "📄 Model: Files:",
          files.map((f) => ({
            id: f.file_id,
            name: f.nama_file_asli,
            size: f.ukuran_file,
            uploader: f.uploader_nama,
          }))
        );
      }
      laporan.files = files;
    }
    return laporan;
  } catch (error) {
    console.error("❌ Error in getLaporanById:", error);
    throw error; // Re-throw untuk di-handle di page
  }
}

export async function verifikasiLaporan(
  laporanId: number,
  data: VerifikasiLaporanData
): Promise<number> {
  const query = `
    UPDATE laporan_kegiatan
    SET status_laporan = ?,
        verifikasi_oleh = ?,
        tanggal_verifikasi = NOW(),
        catatan_verifikasi = ?,
        rating_kualitas = ?
    WHERE laporan_id = ?
  `;

  return await executeUpdate(query, [
    data.status_laporan,
    data.verifikasi_oleh,
    data.catatan_verifikasi ?? null,
    data.rating_kualitas ?? null,
    laporanId,
  ]);
}

export async function autoVerifyDueReports(
  referenceDate: string
): Promise<number> {
  const candidates = await executeQuery<AutoVerifyCandidate>(
    `SELECT laporan_id, pegawai_id, nama_kegiatan, tanggal_kegiatan, created_at
       FROM laporan_kegiatan
      WHERE status_laporan = 'Diajukan'
        AND created_at <= DATE_SUB(NOW(), INTERVAL ${AUTO_VERIFY_DELAY_DAYS} DAY)`
  );

  if (!candidates.length) {
    return 0;
  }

  let processed = 0;

  for (const candidate of candidates) {
    try {
      const supervisor = await AtasanPegawaiModel.getPrimarySupervisor(
        candidate.pegawai_id,
        referenceDate
      );

      if (!supervisor) {
        continue;
      }

      const before = await getLaporanById(candidate.laporan_id);

      await verifikasiLaporan(candidate.laporan_id, {
        status_laporan: "Diverifikasi",
        verifikasi_oleh: supervisor.atasan_id,
        catatan_verifikasi: "Diverifikasi otomatis oleh sistem",
        rating_kualitas: null,
      });

      await updateAllRekaps(candidate.pegawai_id, candidate.tanggal_kegiatan);

      const after = await getLaporanById(candidate.laporan_id);

      await createLogWithData({
        pegawai_id: supervisor.atasan_id,
        aksi: "Update",
        modul: "Laporan Kegiatan",
        detail_aksi: `Verifikasi otomatis laporan ${candidate.nama_kegiatan}`,
        data_sebelum: before,
        data_sesudah: after,
        endpoint: "AUTO_VERIFICATION",
        method: "SYSTEM",
      });

      processed += 1;
    } catch (error) {
      console.error(
        "Gagal melakukan verifikasi otomatis laporan",
        candidate.laporan_id,
        error
      );
    }
  }

  return processed;
}

// ==============================================

// Create new laporan
export async function createLaporan(data: CreateLaporanData): Promise<number> {
  const query = `
    INSERT INTO laporan_kegiatan (
      pegawai_id, tanggal_kegiatan, kategori_id, nama_kegiatan,
      deskripsi_kegiatan, target_output, hasil_output,
      waktu_mulai, waktu_selesai, lokasi_kegiatan,
      latitude, longitude, peserta_kegiatan, jumlah_peserta,
      link_referensi, kendala, solusi, status_laporan
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertId = await executeInsert(query, [
    data.pegawai_id,
    data.tanggal_kegiatan,
    data.kategori_id,
    data.nama_kegiatan,
    data.deskripsi_kegiatan,
    data.target_output || null,
    data.hasil_output || null,
    data.waktu_mulai,
    data.waktu_selesai,
    data.lokasi_kegiatan || null,
    data.latitude || null,
    data.longitude || null,
    data.peserta_kegiatan || null,
    data.jumlah_peserta || 0,
    data.link_referensi || null,
    data.kendala || null,
    data.solusi || null,
    data.status_laporan || "Draft",
  ]);

  return insertId;
}

// Update laporan
export async function updateLaporan(
  laporanId: number,
  data: UpdateLaporanData
): Promise<void> {
  // Build dynamic update query
  const fields: string[] = [];
  const values: any[] = [];

  if (data.tanggal_kegiatan !== undefined) {
    fields.push("tanggal_kegiatan = ?");
    values.push(data.tanggal_kegiatan);
  }
  if (data.kategori_id !== undefined) {
    fields.push("kategori_id = ?");
    values.push(data.kategori_id);
  }
  if (data.nama_kegiatan !== undefined) {
    fields.push("nama_kegiatan = ?");
    values.push(data.nama_kegiatan);
  }
  if (data.deskripsi_kegiatan !== undefined) {
    fields.push("deskripsi_kegiatan = ?");
    values.push(data.deskripsi_kegiatan);
  }
  if (data.target_output !== undefined) {
    fields.push("target_output = ?");
    values.push(data.target_output);
  }
  if (data.hasil_output !== undefined) {
    fields.push("hasil_output = ?");
    values.push(data.hasil_output);
  }
  if (data.waktu_mulai !== undefined) {
    fields.push("waktu_mulai = ?");
    values.push(data.waktu_mulai);
  }
  if (data.waktu_selesai !== undefined) {
    fields.push("waktu_selesai = ?");
    values.push(data.waktu_selesai);
  }
  if (data.lokasi_kegiatan !== undefined) {
    fields.push("lokasi_kegiatan = ?");
    values.push(data.lokasi_kegiatan);
  }
  if (data.latitude !== undefined) {
    fields.push("latitude = ?");
    values.push(data.latitude);
  }
  if (data.longitude !== undefined) {
    fields.push("longitude = ?");
    values.push(data.longitude);
  }
  if (data.peserta_kegiatan !== undefined) {
    fields.push("peserta_kegiatan = ?");
    values.push(data.peserta_kegiatan);
  }
  if (data.jumlah_peserta !== undefined) {
    fields.push("jumlah_peserta = ?");
    values.push(data.jumlah_peserta);
  }
  if (data.link_referensi !== undefined) {
    fields.push("link_referensi = ?");
    values.push(data.link_referensi);
  }
  if (data.kendala !== undefined) {
    fields.push("kendala = ?");
    values.push(data.kendala);
  }
  if (data.solusi !== undefined) {
    fields.push("solusi = ?");
    values.push(data.solusi);
  }
  if (data.status_laporan !== undefined) {
    fields.push("status_laporan = ?");
    values.push(data.status_laporan);
  }

  // Always update edit tracking
  fields.push("is_edited = 1");
  fields.push("edit_count = edit_count + 1");

  values.push(laporanId);

  const query = `UPDATE laporan_kegiatan SET ${fields.join(
    ", "
  )} WHERE laporan_id = ?`;

  await executeUpdate(query, values);
}

// Delete laporan
export async function deleteLaporan(laporanId: number): Promise<void> {
  const query = "DELETE FROM laporan_kegiatan WHERE laporan_id = ?";
  await executeUpdate(query, [laporanId]);
}

// Submit laporan (change status to Diajukan)
export async function submitLaporan(laporanId: number): Promise<void> {
  const query = `
    UPDATE laporan_kegiatan 
    SET status_laporan = 'Diajukan', tanggal_submit = NOW() 
    WHERE laporan_id = ?
  `;
  await executeUpdate(query, [laporanId]);
}

// Check if laporan can be edited
export async function canEditLaporan(laporanId: number): Promise<boolean> {
  interface StatusResult extends RowDataPacket {
    status_laporan: string;
  }

  const query = `
    SELECT status_laporan 
    FROM laporan_kegiatan 
    WHERE laporan_id = ?
  `;
  const result = await executeQuery<StatusResult>(query, [laporanId]);

  if (result.length === 0) return false;

  const editableStatuses = ["Draft", "Diajukan", "Revisi"];
  return editableStatuses.includes(result[0].status_laporan);
}

// ============================================
// FILE UPLOAD FUNCTIONS
// ============================================

export interface CreateFileData {
  laporan_id: number;
  nama_file_asli: string;
  nama_file_sistem: string;
  path_file: string;
  tipe_file: string;
  ukuran_file: number;
  uploaded_by: number;
  deskripsi_file?: string | null;
}

// Get files by laporan_id
export async function getFilesByLaporan(
  laporanId: number
): Promise<FileUpload[]> {
  const query = `
    SELECT * FROM file_upload
    WHERE laporan_id = ?
    ORDER BY created_at DESC
  `;
  return await executeQuery<FileUpload>(query, [laporanId]);
}

export async function getFilesByLaporanIds(
  laporanIds: number[]
): Promise<FileUploadWithContext[]> {
  if (!laporanIds.length) {
    return [];
  }

  const placeholders = laporanIds.map(() => "?").join(", ");

  const query = `
    SELECT
      fu.*, 
      pc.pegawai_nama AS uploader_nama,
      lk.nama_kegiatan,
      lk.tanggal_kegiatan
    FROM file_upload fu
    INNER JOIN pegawai_cache pc ON fu.uploaded_by = pc.pegawai_id
    INNER JOIN laporan_kegiatan lk ON fu.laporan_id = lk.laporan_id
    WHERE fu.laporan_id IN (${placeholders})
    ORDER BY lk.tanggal_kegiatan ASC, fu.created_at ASC, fu.file_id ASC
  `;

  return await executeQuery<FileUploadWithContext>(query, laporanIds);
}

// Create file upload record
export async function createFileUpload(data: CreateFileData): Promise<number> {
  const query = `
    INSERT INTO file_upload (
      laporan_id, nama_file_asli, nama_file_sistem,
      path_file, tipe_file, ukuran_file, uploaded_by, deskripsi_file
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertId = await executeInsert(query, [
    data.laporan_id,
    data.nama_file_asli,
    data.nama_file_sistem,
    data.path_file,
    data.tipe_file,
    data.ukuran_file,
    data.uploaded_by,
    data.deskripsi_file || null,
  ]);

  return insertId;
}

// Delete file upload
export async function deleteFileUpload(fileId: number): Promise<void> {
  const query = "DELETE FROM file_upload WHERE file_id = ?";
  await executeUpdate(query, [fileId]);
}

// ===== NEW: Get file by ID =====
export async function getFileById(fileId: number): Promise<FileUpload | null> {
  const query = `SELECT * FROM file_upload WHERE file_id = ?`;
  return await getOne<FileUpload>(query, [fileId]);
}
// ==============================

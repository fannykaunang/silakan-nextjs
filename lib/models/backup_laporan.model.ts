// lib/models/laporan.model.ts
import {
  executeQuery,
  executeInsert,
  executeUpdate,
  getOne,
} from "@/lib/helpers/db-helpers";
import {
  LaporanKegiatan,
  CreateLaporanInput,
  UpdateLaporanInput,
  VerifikasiLaporanInput,
} from "@/lib/types";

// ============================================
// CREATE
// ============================================

export async function createLaporan(data: CreateLaporanInput): Promise<number> {
  return await executeInsert(
    `INSERT INTO laporan_kegiatan (
      pegawai_id, tanggal_kegiatan, kategori_id, nama_kegiatan,
      deskripsi_kegiatan, target_output, hasil_output,
      waktu_mulai, waktu_selesai, lokasi_kegiatan,
      peserta_kegiatan, jumlah_peserta, kendala, solusi,
      status_laporan, tanggal_submit
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Diajukan', NOW())`,
    [
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
      data.peserta_kegiatan || null,
      data.jumlah_peserta || 0,
      data.kendala || null,
      data.solusi || null,
    ]
  );
}

// ============================================
// READ
// ============================================

export async function getLaporanById(
  id: number
): Promise<LaporanKegiatan | null> {
  return await getOne<LaporanKegiatan>(
    `SELECT lk.*, k.nama_kategori, p.pegawai_nama 
     FROM laporan_kegiatan lk
     LEFT JOIN kategori_kegiatan k ON lk.kategori_id = k.kategori_id
     LEFT JOIN pegawai_cache p ON lk.pegawai_id = p.pegawai_id
     WHERE lk.laporan_id = ?`,
    [id]
  );
}

export async function getLaporanByPegawai(
  pegawaiId: number,
  filters?: {
    tanggal?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<LaporanKegiatan[]> {
  let query = `
    SELECT lk.*, k.nama_kategori, k.warna as warna_kategori
    FROM laporan_kegiatan lk
    LEFT JOIN kategori_kegiatan k ON lk.kategori_id = k.kategori_id
    WHERE lk.pegawai_id = ?
  `;
  const params: any[] = [pegawaiId];

  if (filters?.tanggal) {
    query += " AND lk.tanggal_kegiatan = ?";
    params.push(filters.tanggal);
  }

  if (filters?.status) {
    query += " AND lk.status_laporan = ?";
    params.push(filters.status);
  }

  query += " ORDER BY lk.tanggal_kegiatan DESC, lk.waktu_mulai DESC";

  if (filters?.limit) {
    query += " LIMIT ? OFFSET ?";
    params.push(filters.limit, filters.offset || 0);
  }

  return await executeQuery<LaporanKegiatan>(query, params);
}

export async function getLaporanPendingVerifikasi(
  atasanId: number
): Promise<LaporanKegiatan[]> {
  return await executeQuery<LaporanKegiatan>(
    `SELECT lk.*, p.pegawai_nama, p.jabatan, k.nama_kategori
     FROM laporan_kegiatan lk
     INNER JOIN pegawai_cache p ON lk.pegawai_id = p.pegawai_id
     LEFT JOIN kategori_kegiatan k ON lk.kategori_id = k.kategori_id
     INNER JOIN atasan_pegawai ap ON lk.pegawai_id = ap.pegawai_id
     WHERE ap.atasan_id = ? 
     AND ap.is_active = TRUE
     AND lk.status_laporan = 'Diajukan'
     ORDER BY lk.tanggal_submit ASC`,
    [atasanId]
  );
}

// ============================================
// UPDATE
// ============================================

export async function updateLaporan(
  id: number,
  data: UpdateLaporanInput
): Promise<number> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.nama_kegiatan) {
    fields.push("nama_kegiatan = ?");
    values.push(data.nama_kegiatan);
  }
  if (data.deskripsi_kegiatan) {
    fields.push("deskripsi_kegiatan = ?");
    values.push(data.deskripsi_kegiatan);
  }
  if (data.hasil_output !== undefined) {
    fields.push("hasil_output = ?");
    values.push(data.hasil_output);
  }
  if (data.kendala !== undefined) {
    fields.push("kendala = ?");
    values.push(data.kendala);
  }
  if (data.solusi !== undefined) {
    fields.push("solusi = ?");
    values.push(data.solusi);
  }
  if (data.status_laporan) {
    fields.push("status_laporan = ?");
    values.push(data.status_laporan);
  }

  if (fields.length === 0) return 0;

  fields.push("is_edited = TRUE", "edit_count = edit_count + 1");
  values.push(id);

  return await executeUpdate(
    `UPDATE laporan_kegiatan SET ${fields.join(", ")} WHERE laporan_id = ?`,
    values
  );
}

export async function verifikasiLaporan(
  id: number,
  data: VerifikasiLaporanInput
): Promise<number> {
  return await executeUpdate(
    `UPDATE laporan_kegiatan 
     SET status_laporan = ?,
         verifikasi_oleh = ?,
         tanggal_verifikasi = NOW(),
         catatan_verifikasi = ?,
         rating_kualitas = ?
     WHERE laporan_id = ?`,
    [
      data.status_laporan,
      data.verifikasi_oleh,
      data.catatan_verifikasi || null,
      data.rating_kualitas || null,
      id,
    ]
  );
}

// ============================================
// DELETE
// ============================================

export async function deleteLaporan(id: number): Promise<number> {
  return await executeUpdate(
    "DELETE FROM laporan_kegiatan WHERE laporan_id = ?",
    [id]
  );
}

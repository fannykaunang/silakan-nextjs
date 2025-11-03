// lib/models/template-kegiatan.model.ts
import {
  executeQuery,
  executeInsert,
  executeUpdate,
  getOne,
} from "@/lib/helpers/db-helpers";
import { RowDataPacket } from "mysql2/promise";
import {
  TemplateKegiatan,
  TemplateKegiatanWithRelations,
  CreateTemplateKegiatanDTO,
  UpdateTemplateKegiatanDTO,
} from "@/lib/types/template-kegiatan.types";

// ============================================
// CREATE
// ============================================
export async function createTemplateKegiatan(
  pegawaiId: number,
  data: CreateTemplateKegiatanDTO
): Promise<number> {
  return await executeInsert(
    `INSERT INTO template_kegiatan (
      pegawai_id,
      nama_template,
      kategori_id,
      deskripsi_template,
      target_output_default,
      lokasi_default,
      durasi_estimasi_menit,
      is_public,
      unit_kerja_akses,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pegawaiId,
      data.nama_template,
      data.kategori_id,
      data.deskripsi_template || null,
      data.target_output_default || null,
      data.lokasi_default || null,
      data.durasi_estimasi_menit || 60,
      data.is_public ?? 0,
      data.unit_kerja_akses || null,
      data.is_active ?? 1,
    ]
  );
}

// ============================================
// READ
// ============================================
export async function getAllTemplateKegiatan(filters?: {
  kategori_id?: number;
  is_public?: number;
  is_active?: number;
  pegawai_id?: number;
  limit?: number;
  offset?: number;
}): Promise<TemplateKegiatanWithRelations[]> {
  let query = `
    SELECT 
      tk.*,
      kk.nama_kategori as kategori_nama,
      kk.kode_kategori as kategori_kode,
      kk.warna as kategori_warna,
      pc.pegawai_nama as pegawai_nama
    FROM template_kegiatan tk
    LEFT JOIN kategori_kegiatan kk ON tk.kategori_id = kk.kategori_id
    LEFT JOIN pegawai_cache pc ON tk.pegawai_id = pc.pegawai_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.kategori_id !== undefined) {
    query += " AND tk.kategori_id = ?";
    params.push(filters.kategori_id);
  }

  if (filters?.is_public !== undefined) {
    query += " AND tk.is_public = ?";
    params.push(filters.is_public);
  }

  if (filters?.is_active !== undefined) {
    query += " AND tk.is_active = ?";
    params.push(filters.is_active);
  }

  if (filters?.pegawai_id !== undefined) {
    query += " AND tk.pegawai_id = ?";
    params.push(filters.pegawai_id);
  }

  query += " ORDER BY tk.jumlah_penggunaan DESC, tk.created_at DESC";

  if (filters?.limit) {
    query += " LIMIT ? OFFSET ?";
    params.push(filters.limit, filters.offset || 0);
  }

  return await executeQuery<TemplateKegiatanWithRelations>(query, params);
}

export async function getTemplateKegiatanById(
  id: number
): Promise<TemplateKegiatanWithRelations | null> {
  return await getOne<TemplateKegiatanWithRelations>(
    `SELECT 
      tk.*,
      kk.nama_kategori as kategori_nama,
      kk.kode_kategori as kategori_kode,
      kk.warna as kategori_warna,
      pc.pegawai_nama as pegawai_nama
    FROM template_kegiatan tk
    LEFT JOIN kategori_kegiatan kk ON tk.kategori_id = kk.kategori_id
    LEFT JOIN pegawai_cache pc ON tk.pegawai_id = pc.pegawai_id
    WHERE tk.template_id = ?`,
    [id]
  );
}

export async function getTemplateKegiatanByPegawai(
  pegawaiId: number
): Promise<TemplateKegiatanWithRelations[]> {
  return await executeQuery<TemplateKegiatanWithRelations>(
    `SELECT 
      tk.*,
      kk.nama_kategori as kategori_nama,
      kk.kode_kategori as kategori_kode,
      kk.warna as kategori_warna,
      pc.pegawai_nama as pegawai_nama
    FROM template_kegiatan tk
    LEFT JOIN kategori_kegiatan kk ON tk.kategori_id = kk.kategori_id
    LEFT JOIN pegawai_cache pc ON tk.pegawai_id = pc.pegawai_id
    WHERE tk.pegawai_id = ?
    ORDER BY tk.created_at DESC`,
    [pegawaiId]
  );
}

export async function getTemplateKegiatanByKategori(
  kategoriId: number
): Promise<TemplateKegiatanWithRelations[]> {
  return await executeQuery<TemplateKegiatanWithRelations>(
    `SELECT 
      tk.*,
      kk.nama_kategori as kategori_nama,
      kk.kode_kategori as kategori_kode,
      kk.warna as kategori_warna,
      pc.pegawai_nama as pegawai_nama
    FROM template_kegiatan tk
    LEFT JOIN kategori_kegiatan kk ON tk.kategori_id = kk.kategori_id
    LEFT JOIN pegawai_cache pc ON tk.pegawai_id = pc.pegawai_id
    WHERE tk.kategori_id = ?
    ORDER BY tk.created_at DESC`,
    [kategoriId]
  );
}

export async function getPublicTemplateKegiatan(): Promise<
  TemplateKegiatanWithRelations[]
> {
  return await executeQuery<TemplateKegiatanWithRelations>(
    `SELECT 
      tk.*,
      kk.nama_kategori as kategori_nama,
      kk.kode_kategori as kategori_kode,
      kk.warna as kategori_warna,
      pc.pegawai_nama as pegawai_nama
    FROM template_kegiatan tk
    LEFT JOIN kategori_kegiatan kk ON tk.kategori_id = kk.kategori_id
    LEFT JOIN pegawai_cache pc ON tk.pegawai_id = pc.pegawai_id
    WHERE tk.is_public = 1 AND tk.is_active = 1
    ORDER BY tk.jumlah_penggunaan DESC, tk.created_at DESC`,
    []
  );
}

export async function getTemplateKegiatanByUnitKerja(
  unitKerjaCode: string
): Promise<TemplateKegiatanWithRelations[]> {
  return await executeQuery<TemplateKegiatanWithRelations>(
    `SELECT 
      tk.*,
      kk.nama_kategori as kategori_nama,
      kk.kode_kategori as kategori_kode,
      kk.warna as kategori_warna,
      pc.pegawai_nama as pegawai_nama
    FROM template_kegiatan tk
    LEFT JOIN kategori_kegiatan kk ON tk.kategori_id = kk.kategori_id
    LEFT JOIN pegawai_cache pc ON tk.pegawai_id = pc.pegawai_id
    WHERE tk.is_active = 1 
    AND (
      tk.is_public = 1 
      OR JSON_CONTAINS(tk.unit_kerja_akses, ?)
    )
    ORDER BY tk.jumlah_penggunaan DESC, tk.created_at DESC`,
    [JSON.stringify(unitKerjaCode)]
  );
}

export async function getMostUsedTemplateKegiatan(
  limit: number = 10
): Promise<TemplateKegiatanWithRelations[]> {
  return await executeQuery<TemplateKegiatanWithRelations>(
    `SELECT 
      tk.*,
      kk.nama_kategori as kategori_nama,
      kk.kode_kategori as kategori_kode,
      kk.warna as kategori_warna,
      pc.pegawai_nama as pegawai_nama
    FROM template_kegiatan tk
    LEFT JOIN kategori_kegiatan kk ON tk.kategori_id = kk.kategori_id
    LEFT JOIN pegawai_cache pc ON tk.pegawai_id = pc.pegawai_id
    WHERE tk.is_active = 1
    ORDER BY tk.jumlah_penggunaan DESC
    LIMIT ?`,
    [limit]
  );
}

// ============================================
// UPDATE
// ============================================
export async function updateTemplateKegiatan(
  id: number,
  data: UpdateTemplateKegiatanDTO
): Promise<number> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.nama_template !== undefined) {
    fields.push("nama_template = ?");
    values.push(data.nama_template);
  }
  if (data.kategori_id !== undefined) {
    fields.push("kategori_id = ?");
    values.push(data.kategori_id);
  }
  if (data.deskripsi_template !== undefined) {
    fields.push("deskripsi_template = ?");
    values.push(data.deskripsi_template);
  }
  if (data.target_output_default !== undefined) {
    fields.push("target_output_default = ?");
    values.push(data.target_output_default);
  }
  if (data.lokasi_default !== undefined) {
    fields.push("lokasi_default = ?");
    values.push(data.lokasi_default);
  }
  if (data.durasi_estimasi_menit !== undefined) {
    fields.push("durasi_estimasi_menit = ?");
    values.push(data.durasi_estimasi_menit);
  }
  if (data.is_public !== undefined) {
    fields.push("is_public = ?");
    values.push(data.is_public);
  }
  if (data.unit_kerja_akses !== undefined) {
    fields.push("unit_kerja_akses = ?");
    values.push(data.unit_kerja_akses);
  }
  if (data.jumlah_penggunaan !== undefined) {
    fields.push("jumlah_penggunaan = ?");
    values.push(data.jumlah_penggunaan);
  }
  if (data.is_active !== undefined) {
    fields.push("is_active = ?");
    values.push(data.is_active);
  }

  if (fields.length === 0) {
    return 0;
  }

  values.push(id);

  return await executeUpdate(
    `UPDATE template_kegiatan SET ${fields.join(", ")} WHERE template_id = ?`,
    values
  );
}

export async function incrementUsageTemplateKegiatan(
  id: number
): Promise<number> {
  return await executeUpdate(
    `UPDATE template_kegiatan 
     SET jumlah_penggunaan = jumlah_penggunaan + 1 
     WHERE template_id = ?`,
    [id]
  );
}

// ============================================
// DELETE
// ============================================
export async function deleteTemplateKegiatan(id: number): Promise<number> {
  // Soft delete (ubah is_active menjadi 0)
  return await executeUpdate(
    "UPDATE template_kegiatan SET is_active = 0 WHERE template_id = ?",
    [id]
  );
}

// Hard delete (jika diperlukan)
export async function hardDeleteTemplateKegiatan(id: number): Promise<number> {
  return await executeUpdate(
    "DELETE FROM template_kegiatan WHERE template_id = ?",
    [id]
  );
}

// ============================================
// VALIDATION
// ============================================

interface CountResult extends RowDataPacket {
  count: number;
}

export async function isTemplateNameExistsInKategori(
  namaTemplate: string,
  kategoriId: number,
  excludeTemplateId?: number
): Promise<boolean> {
  let query = `SELECT COUNT(*) as count FROM template_kegiatan 
               WHERE nama_template = ? AND kategori_id = ?`;
  const params: any[] = [namaTemplate, kategoriId];

  if (excludeTemplateId) {
    query += ` AND template_id != ?`;
    params.push(excludeTemplateId);
  }

  const result = await getOne<CountResult>(query, params);
  return result ? result.count > 0 : false;
}

// lib/models/kategori.model.ts
import {
  executeQuery,
  executeInsert,
  executeUpdate,
  getOne,
} from "@/lib/helpers/db-helpers";
import {
  KategoriKegiatan,
  CreateKategoriInput,
  UpdateKategoriInput,
} from "@/lib/types/kategori.types";

// ============================================
// CREATE
// ============================================

export async function createKategori(
  data: CreateKategoriInput
): Promise<number> {
  return await executeInsert(
    `INSERT INTO kategori_kegiatan (
      kode_kategori,
      nama_kategori,
      deskripsi,
      warna,
      icon,
      is_active,
      urutan
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.kode_kategori,
      data.nama_kategori,
      data.deskripsi || null,
      data.warna || "#3B82F6",
      data.icon || null,
      data.is_active !== undefined ? data.is_active : 1,
      data.urutan || 0,
    ]
  );
}

// ============================================
// READ
// ============================================

export async function getAllKategori(filters?: {
  is_active?: number;
  limit?: number;
  offset?: number;
}): Promise<KategoriKegiatan[]> {
  let query = "SELECT * FROM kategori_kegiatan WHERE 1=1";
  const params: any[] = [];

  if (filters?.is_active !== undefined) {
    query += " AND is_active = ?";
    params.push(filters.is_active);
  }

  query += " ORDER BY urutan ASC, nama_kategori ASC";

  if (filters?.limit) {
    query += " LIMIT ? OFFSET ?";
    params.push(filters.limit, filters.offset || 0);
  }

  return await executeQuery<KategoriKegiatan>(query, params);
}

export async function getKategoriById(
  id: number
): Promise<KategoriKegiatan | null> {
  return await getOne<KategoriKegiatan>(
    "SELECT * FROM kategori_kegiatan WHERE kategori_id = ?",
    [id]
  );
}

export async function getKategoriByKode(
  kode: string
): Promise<KategoriKegiatan | null> {
  return await getOne<KategoriKegiatan>(
    "SELECT * FROM kategori_kegiatan WHERE kode_kategori = ?",
    [kode]
  );
}

// ============================================
// UPDATE
// ============================================

export async function updateKategori(
  id: number,
  data: UpdateKategoriInput
): Promise<number> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.kode_kategori !== undefined) {
    fields.push("kode_kategori = ?");
    values.push(data.kode_kategori);
  }
  if (data.nama_kategori !== undefined) {
    fields.push("nama_kategori = ?");
    values.push(data.nama_kategori);
  }
  if (data.deskripsi !== undefined) {
    fields.push("deskripsi = ?");
    values.push(data.deskripsi);
  }
  if (data.warna !== undefined) {
    fields.push("warna = ?");
    values.push(data.warna);
  }
  if (data.icon !== undefined) {
    fields.push("icon = ?");
    values.push(data.icon);
  }
  if (data.is_active !== undefined) {
    fields.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.urutan !== undefined) {
    fields.push("urutan = ?");
    values.push(data.urutan);
  }

  if (fields.length === 0) {
    return 0;
  }

  values.push(id);

  return await executeUpdate(
    `UPDATE kategori_kegiatan SET ${fields.join(", ")} WHERE kategori_id = ?`,
    values
  );
}

// ============================================
// DELETE
// ============================================

export async function deleteKategori(id: number): Promise<number> {
  // Soft delete (ubah is_active menjadi 0)
  return await executeUpdate(
    "UPDATE kategori_kegiatan SET is_active = 0 WHERE kategori_id = ?",
    [id]
  );
}

// Hard delete (jika diperlukan)
export async function hardDeleteKategori(id: number): Promise<number> {
  return await executeUpdate(
    "DELETE FROM kategori_kegiatan WHERE kategori_id = ?",
    [id]
  );
}

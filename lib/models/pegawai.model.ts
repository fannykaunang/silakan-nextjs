// lib/models/pegawai.model.ts
import {
  executeQuery,
  executeInsert,
  executeUpdate,
  getOne,
} from "@/lib/helpers/db-helpers";
import {
  Pegawai,
  CreatePegawaiInput,
  UpdatePegawaiInput,
  PegawaiWithRelations,
} from "@/lib/types";
import pool from "@/lib/db";

// ============================================
// CREATE / UPSERT
// ============================================

export async function upsertPegawai(data: CreatePegawaiInput): Promise<void> {
  await pool.query(
    `INSERT INTO pegawai_cache (
      pegawai_id, pegawai_pin, pegawai_nip, pegawai_nama,
      tempat_lahir, tgl_lahir, gender, pegawai_telp,
      pegawai_privilege, pegawai_status, jabatan, skpdid, skpd, sotk,
      tgl_mulai_kerja, photo_path, last_sync
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      pegawai_pin = VALUES(pegawai_pin),
      pegawai_nip = VALUES(pegawai_nip),
      pegawai_nama = VALUES(pegawai_nama),
      tempat_lahir = VALUES(tempat_lahir),
      tgl_lahir = VALUES(tgl_lahir),
      gender = VALUES(gender),
      pegawai_telp = VALUES(pegawai_telp),
      pegawai_privilege = VALUES(pegawai_privilege),
      pegawai_status = VALUES(pegawai_status),
      jabatan = VALUES(jabatan),
      skpdid = VALUES(skpdid),
      skpd = VALUES(skpd),
      sotk = VALUES(sotk),
      tgl_mulai_kerja = VALUES(tgl_mulai_kerja),
      photo_path = VALUES(photo_path),
      last_sync = NOW()
    `,
    [
      data.pegawai_id,
      data.pegawai_pin,
      data.pegawai_nip,
      data.pegawai_nama,
      data.tempat_lahir || null,
      data.tgl_lahir || null,
      data.gender || 1,
      data.pegawai_telp || null,
      data.pegawai_privilege || "0",
      data.pegawai_status || 1,
      data.jabatan || null,
      data.skpdid,
      data.skpd || null,
      data.sotk || null,
      data.tgl_mulai_kerja || null,
      data.photo_path || null,
    ]
  );
}

// ============================================
// READ
// ============================================

export async function getPegawaiById(
  id: number
): Promise<PegawaiWithRelations | null> {
  return await getOne<PegawaiWithRelations>(
    `SELECT * FROM pegawai_cache WHERE pegawai_id = ?`,
    [id]
  );
}

export async function getPegawaiByPin(pin: string): Promise<Pegawai | null> {
  return await getOne<Pegawai>(
    "SELECT * FROM pegawai_cache WHERE pegawai_pin = ?",
    [pin]
  );
}

export async function getPegawaiByNip(nip: string): Promise<Pegawai | null> {
  return await getOne<Pegawai>(
    "SELECT * FROM pegawai_cache WHERE pegawai_nip = ?",
    [nip]
  );
}

export async function getAllPegawai(filters?: {
  status?: number;
  skpd?: string;
  limit?: number;
  offset?: number;
}): Promise<Pegawai[]> {
  let query = "SELECT * FROM pegawai_cache WHERE 1=1";
  const params: any[] = [];

  if (filters?.status !== undefined) {
    query += " AND pegawai_status = ?";
    params.push(filters.status);
  }

  if (filters?.skpd) {
    query += " AND skpd = ?";
    params.push(filters.skpd);
  }

  query += " ORDER BY pegawai_nama ASC";

  if (filters?.limit) {
    query += " LIMIT ? OFFSET ?";
    params.push(filters.limit, filters.offset || 0);
  }

  return await executeQuery<Pegawai>(query, params);
}

// ============================================
// UPDATE
// ============================================

export async function updatePegawai(
  id: number,
  data: UpdatePegawaiInput
): Promise<number> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.pegawai_nama !== undefined) {
    fields.push("pegawai_nama = ?");
    values.push(data.pegawai_nama);
  }
  if (data.pegawai_telp !== undefined) {
    fields.push("pegawai_telp = ?");
    values.push(data.pegawai_telp);
  }
  if (data.jabatan !== undefined) {
    fields.push("jabatan = ?");
    values.push(data.jabatan);
  }
  if (data.photo_path !== undefined) {
    fields.push("photo_path = ?");
    values.push(data.photo_path);
  }

  if (fields.length === 0) {
    return 0; // No fields to update
  }

  values.push(id);

  return await executeUpdate(
    `UPDATE pegawai_cache SET ${fields.join(
      ", "
    )}, last_sync = NOW() WHERE pegawai_id = ?`,
    values
  );
}

// ============================================
// DELETE
// ============================================

// export async function deletePegawai(id: number): Promise<number> {
//   return await executeUpdate("DELETE FROM pegawai_cache WHERE pegawai_id = ?", [
//     id,
//   ]);
// }

export async function deletePegawai(id: number): Promise<number> {
  const tableChecks = [
    {
      table: "log_aktivitas",
      column: "pegawai_id",
      message: "Data pegawai masih memiliki catatan di tabel Log Aktivitas.",
    },
    // Tambahkan pengecekan untuk tabel lain di sini jika ada:
    {
      table: "atasan_pegawai",
      column: "pegawai_id",
      message: "Data pegawai masih terkait dengan data 'Atasan Pegawai'.",
    },
    {
      table: "komentar_laporan",
      column: "pegawai_id",
      message: "Data pegawai masih terkait dengan data 'Komentar'.",
    },
    {
      table: "laporan_kegiatan",
      column: "pegawai_id",
      message: "Data pegawai masih terkait dengan data 'Laporan Kegiatan'.",
    },
    {
      table: "notifikasi",
      column: "pegawai_id",
      message: "Data pegawai masih terkait dengan data 'Notifikasi'.",
    },
    {
      table: "rekap_harian",
      column: "pegawai_id",
      message: "Data pegawai masih terkait dengan data 'Rekap Harian'.",
    },
    {
      table: "rekap_bulanan",
      column: "pegawai_id",
      message: "Data pegawai masih terkait dengan data 'Rekap Bulanan'.",
    },
    {
      table: "reminder",
      column: "pegawai_id",
      message: "Data pegawai masih terkait dengan data 'Reminder'.",
    },
    {
      table: "revisi_laporan",
      column: "pegawai_id",
      message: "Data pegawai masih terkait dengan data 'Revisi Laporan'.",
    },
    {
      table: "template_kegiatan",
      column: "pegawai_id",
      message: "Data pegawai masih terkait dengan data 'Template Kegiatan'.",
    },
  ];

  // 1. Lakukan Pengecekan Relasi di Seluruh Tabel
  for (const check of tableChecks) {
    const checkQuery = `
      SELECT COUNT(*) AS count 
      FROM ${check.table} 
      WHERE ${check.column} = ?
    `;

    const result = await executeQuery<Pegawai>(checkQuery, [id]);

    // Karena query SELECT COUNT(*) akan selalu mengembalikan satu baris,
    // kita mengambil nilai count dari baris pertama [0].
    const count = result[0].count;

    if (count > 0) {
      // Jika ditemukan baris yang mereferensikan pegawai_id ini
      throw new Error(
        `Gagal menghapus Pegawai ID ${id}: ${check.message} Total ${count} referensi ditemukan.`
      );
    }
  }

  // 2. Jika Tidak Ada Relasi Ditemukan, Lakukan Penghapusan
  const rowsAffected = await executeUpdate(
    "DELETE FROM pegawai_cache WHERE pegawai_id = ?",
    [id]
  );

  return rowsAffected;
}

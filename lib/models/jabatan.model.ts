import { RowDataPacket } from "mysql2";
import {
  executeInsert,
  executeQuery,
  executeUpdate,
  getOne,
} from "@/lib/helpers/db-helpers";

export interface JabatanRow extends RowDataPacket {
  jabatan_id: number;
  nama_jabatan: string | null;
  jenis_jabatan: "ASN" | "Honorer" | null;
}

export async function getJabatanById(id: number) {
  return getOne<JabatanRow>(
    "SELECT jabatan_id, nama_jabatan, jenis_jabatan FROM jabatan WHERE jabatan_id = ?",
    [id]
  );
}

export async function fetchJabatanList(options: {
  search?: string;
  jenis?: "ASN" | "Honorer" | null;
  limit: number;
  offset: number;
}) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (options.search) {
    conditions.push("LOWER(nama_jabatan) LIKE ?");
    params.push(`%${options.search.toLowerCase()}%`);
  }

  if (options.jenis) {
    conditions.push("jenis_jabatan = ?");
    params.push(options.jenis);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const query = `SELECT jabatan_id, nama_jabatan, jenis_jabatan
    FROM jabatan
    ${whereClause}
    ORDER BY CASE
        WHEN LOWER(nama_jabatan) LIKE 'kepala dinas%' THEN 1
        WHEN LOWER(nama_jabatan) LIKE 'sekretaris%' THEN 2
        WHEN LOWER(nama_jabatan) LIKE 'kepala bidang%' THEN 3
        WHEN LOWER(nama_jabatan) LIKE 'kepala sub bidang%' THEN 4
        WHEN LOWER(nama_jabatan) LIKE 'kepala seksi%' THEN 4
        WHEN LOWER(nama_jabatan) LIKE 'kepala sub bagian%' THEN 4
        WHEN LOWER(nama_jabatan) LIKE 'kepala subbag%' THEN 4
        WHEN LOWER(nama_jabatan) LIKE 'staf%' THEN 100
        ELSE 50
      END,
      nama_jabatan ASC
    LIMIT ? OFFSET ?`;

  params.push(options.limit, options.offset);

  return executeQuery<JabatanRow>(query, params);
}

export async function countJabatan(options: {
  search?: string;
  jenis?: "ASN" | "Honorer" | null;
}) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (options.search) {
    conditions.push("LOWER(nama_jabatan) LIKE ?");
    params.push(`%${options.search.toLowerCase()}%`);
  }

  if (options.jenis) {
    conditions.push("jenis_jabatan = ?");
    params.push(options.jenis);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [result] = await executeQuery<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM jabatan ${whereClause}`,
    params
  );

  return result?.total ?? 0;
}

export async function createJabatan(data: {
  nama_jabatan: string;
  jenis_jabatan: "ASN" | "Honorer";
}) {
  const insertId = await executeInsert(
    "INSERT INTO jabatan (nama_jabatan, jenis_jabatan) VALUES (?, ?)",
    [data.nama_jabatan, data.jenis_jabatan]
  );

  return insertId;
}

export async function updateJabatan(
  id: number,
  data: { nama_jabatan?: string; jenis_jabatan?: "ASN" | "Honorer" }
) {
  const fields: string[] = [];
  const params: (string | number)[] = [];

  if (data.nama_jabatan !== undefined) {
    fields.push("nama_jabatan = ?");
    params.push(data.nama_jabatan);
  }

  if (data.jenis_jabatan !== undefined) {
    fields.push("jenis_jabatan = ?");
    params.push(data.jenis_jabatan);
  }

  if (!fields.length) {
    return 0;
  }

  params.push(id);

  return executeUpdate(
    `UPDATE jabatan SET ${fields.join(", ")} WHERE jabatan_id = ?`,
    params
  );
}

export async function deleteJabatan(id: number) {
  return executeUpdate("DELETE FROM jabatan WHERE jabatan_id = ?", [id]);
}

// lib/models/log.model.ts
import { executeQuery, executeInsert } from "@/lib/helpers/db-helpers";
import { LogAktivitas, CreateLogInput } from "@/lib/types";

// ============================================
// CREATE LOG
// ============================================

/**
 * Create log aktivitas lengkap dengan semua field
 */
// lib/models/log.model.ts
export async function createLog(data: CreateLogInput): Promise<number> {
  try {
    // Handle undefined - convert to null
    let dataSebelum: string | null = null;
    let dataSesudah: string | null = null;

    // PERBAIKAN: Cek undefined dan null
    if (data.data_sebelum !== undefined && data.data_sebelum !== null) {
      if (typeof data.data_sebelum === "string") {
        dataSebelum = data.data_sebelum;
      } else {
        dataSebelum = JSON.stringify(data.data_sebelum);
      }
      console.log("📝 data_sebelum (stringified):", dataSebelum);
    }

    if (data.data_sesudah !== undefined && data.data_sesudah !== null) {
      if (typeof data.data_sesudah === "string") {
        dataSesudah = data.data_sesudah;
      } else {
        dataSesudah = JSON.stringify(data.data_sesudah);
      }
      console.log("📝 data_sesudah (stringified):", dataSesudah);
    }

    const logId = await executeInsert(
      `INSERT INTO log_aktivitas (
        pegawai_id, aksi, modul, detail_aksi, 
        data_sebelum, data_sesudah,
        ip_address, user_agent, endpoint, method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.pegawai_id,
        data.aksi,
        data.modul,
        data.detail_aksi || null,
        dataSebelum,
        dataSesudah,
        data.ip_address || null,
        data.user_agent || null,
        data.endpoint || null,
        data.method || null,
      ]
    );

    console.log("✅ Log created with ID:", logId);
    return logId;
  } catch (error: any) {
    console.error("❌ Failed to create log:", error.message);
    console.error("Full error:", error);
    return 0;
  }
}

/**
 * Create log simple (tanpa data_sebelum & data_sesudah)
 * Untuk aktivitas seperti Login, Logout, View
 */
export async function createSimpleLog(data: {
  pegawai_id: number;
  aksi: string;
  modul: string;
  detail_aksi?: string;
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  method?: string;
}): Promise<number> {
  return await createLog({
    ...data,
    data_sebelum: null, // ← PERBAIKAN: Explicit null
    data_sesudah: null, // ← PERBAIKAN: Explicit null
  });
}

/**
 * Create log dengan tracking perubahan data
 * Untuk aktivitas Create, Update, Delete
 */
export async function createLogWithData(data: {
  pegawai_id: number;
  aksi: string; // 'Create', 'Update', 'Delete'
  modul: string; // 'Laporan', 'Pegawai', etc
  detail_aksi?: string;
  data_sebelum?: any;
  data_sesudah?: any;
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  method?: string;
}): Promise<number> {
  return await createLog(data);
}

// ============================================
// READ LOGS
// ============================================

/**
 * Get logs by pegawai
 */
export async function getLogsByPegawai(
  pegawaiId: number,
  filters?: {
    limit?: number;
    offset?: number;
    modul?: string;
    aksi?: string;
  }
): Promise<LogAktivitas[]> {
  let query = `
    SELECT * FROM log_aktivitas 
    WHERE pegawai_id = ?
  `;
  const params: any[] = [pegawaiId];

  if (filters?.modul) {
    query += ` AND modul = ?`;
    params.push(filters.modul);
  }

  if (filters?.aksi) {
    query += ` AND aksi = ?`;
    params.push(filters.aksi);
  }

  query += ` ORDER BY created_at DESC`;

  if (filters?.limit) {
    query += ` LIMIT ? OFFSET ?`;
    params.push(filters.limit, filters.offset || 0);
  }

  return await executeQuery<LogAktivitas>(query, params);
}

/**
 * Get logs by modul
 */
export async function getLogsByModul(
  modul: string,
  filters?: {
    limit?: number;
    offset?: number;
    aksi?: string;
  }
): Promise<LogAktivitas[]> {
  let query = `
    SELECT la.*, p.pegawai_nama 
    FROM log_aktivitas la
    LEFT JOIN pegawai_cache p ON la.pegawai_id = p.pegawai_id
    WHERE la.modul = ?
  `;
  const params: any[] = [modul];

  if (filters?.aksi) {
    query += ` AND la.aksi = ?`;
    params.push(filters.aksi);
  }

  query += ` ORDER BY la.created_at DESC`;

  if (filters?.limit) {
    query += ` LIMIT ? OFFSET ?`;
    params.push(filters.limit, filters.offset || 0);
  }

  return await executeQuery<LogAktivitas>(query, params);
}

/**
 * Get all logs dengan filter
 */
export async function getAllLogs(filters?: {
  pegawai_id?: number;
  modul?: string;
  aksi?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<LogAktivitas[]> {
  let query = `
    SELECT la.*, p.pegawai_nama, p.jabatan
    FROM log_aktivitas la
    LEFT JOIN pegawai_cache p ON la.pegawai_id = p.pegawai_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.pegawai_id) {
    query += ` AND la.pegawai_id = ?`;
    params.push(filters.pegawai_id);
  }

  if (filters?.modul) {
    query += ` AND la.modul = ?`;
    params.push(filters.modul);
  }

  if (filters?.aksi) {
    query += ` AND la.aksi = ?`;
    params.push(filters.aksi);
  }

  if (filters?.startDate) {
    query += ` AND DATE(la.created_at) >= ?`;
    params.push(filters.startDate);
  }

  if (filters?.endDate) {
    query += ` AND DATE(la.created_at) <= ?`;
    params.push(filters.endDate);
  }

  query += ` ORDER BY la.created_at DESC`;

  if (filters?.limit) {
    query += ` LIMIT ? OFFSET ?`;
    params.push(filters.limit, filters.offset || 0);
  }

  return await executeQuery<LogAktivitas>(query, params);
}

/**
 * Get log by ID (untuk melihat detail perubahan)
 */
export async function getLogById(logId: number): Promise<LogAktivitas | null> {
  const logs = await executeQuery<LogAktivitas>(
    `SELECT la.*, p.pegawai_nama, p.jabatan
     FROM log_aktivitas la
     LEFT JOIN pegawai_cache p ON la.pegawai_id = p.pegawai_id
     WHERE la.log_id = ?`,
    [logId]
  );

  return logs.length > 0 ? logs[0] : null;
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get log statistics
 */
export async function getLogStatistics(filters?: {
  pegawai_id?: number;
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  let query = `
    SELECT 
      modul,
      aksi,
      COUNT(*) as total,
      COUNT(DISTINCT pegawai_id) as unique_users
    FROM log_aktivitas
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.pegawai_id) {
    query += ` AND pegawai_id = ?`;
    params.push(filters.pegawai_id);
  }

  if (filters?.startDate) {
    query += ` AND DATE(created_at) >= ?`;
    params.push(filters.startDate);
  }

  if (filters?.endDate) {
    query += ` AND DATE(created_at) <= ?`;
    params.push(filters.endDate);
  }

  query += ` GROUP BY modul, aksi ORDER BY total DESC`;

  return await executeQuery(query, params);
}

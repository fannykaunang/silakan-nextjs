// lib/models/reminder.model.ts

import { RowDataPacket } from "mysql2";

import {
  executeInsert,
  executeQuery,
  executeUpdate,
  getOne,
} from "@/lib/helpers/db-helpers";
import type {
  ReminderDay,
  ReminderListItem,
  ReminderPayload,
  ReminderStats,
  ReminderType,
} from "@/lib/types";

type ReminderListOptions = {
  search?: string;
  tipe?: ReminderType | "all";
  day?: ReminderDay | "all";
  limit: number;
  offset: number;
  allowedPegawaiIds?: number[];
};

type ReminderCountOptions = Omit<ReminderListOptions, "limit" | "offset">;

type ReminderStatsOptions = {
  allowedPegawaiIds?: number[];
};

type PegawaiOptionRow = RowDataPacket & {
  pegawai_id: number;
  pegawai_nama: string | null;
};

function buildPegawaiFilter(allowedPegawaiIds?: number[]): {
  clause: string;
  params: number[];
} {
  if (!allowedPegawaiIds || allowedPegawaiIds.length === 0) {
    return { clause: "", params: [] };
  }

  const placeholders = allowedPegawaiIds.map(() => "?").join(",");
  return {
    clause: ` AND r.pegawai_id IN (${placeholders})`,
    params: allowedPegawaiIds,
  };
}

export async function getReminderById(id: number) {
  return getOne<ReminderListItem>(
    `SELECT r.*, p.pegawai_nama
     FROM reminder r
     LEFT JOIN pegawai_cache p ON p.pegawai_id = r.pegawai_id
     WHERE r.reminder_id = ?`,
    [id]
  );
}

export async function listReminders(options: ReminderListOptions) {
  const conditions: string[] = ["1=1"];
  const params: (string | number | null)[] = [];

  if (options.search) {
    conditions.push("LOWER(r.judul_reminder) LIKE ?");
    params.push(`%${options.search.toLowerCase()}%`);
  }

  if (options.tipe && options.tipe !== "all") {
    conditions.push("r.tipe_reminder = ?");
    params.push(options.tipe);
  }

  if (options.day && options.day !== "all") {
    conditions.push("FIND_IN_SET(?, r.hari_dalam_minggu)");
    params.push(options.day);
  }

  const { clause: pegawaiClause, params: pegawaiParams } = buildPegawaiFilter(
    options.allowedPegawaiIds
  );

  const whereClause = `WHERE ${conditions.join(" AND ")}${pegawaiClause}`;
  const queryParams = [
    ...params,
    ...pegawaiParams,
    options.limit,
    options.offset,
  ];

  return executeQuery<ReminderListItem>(
    `SELECT r.*, p.pegawai_nama
     FROM reminder r
     LEFT JOIN pegawai_cache p ON p.pegawai_id = r.pegawai_id
     ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    queryParams
  );
}

export async function countReminders(options: ReminderCountOptions) {
  const conditions: string[] = ["1=1"];
  const params: (string | number | null)[] = [];

  if (options.search) {
    conditions.push("LOWER(r.judul_reminder) LIKE ?");
    params.push(`%${options.search.toLowerCase()}%`);
  }

  if (options.tipe && options.tipe !== "all") {
    conditions.push("r.tipe_reminder = ?");
    params.push(options.tipe);
  }

  if (options.day && options.day !== "all") {
    conditions.push("FIND_IN_SET(?, r.hari_dalam_minggu)");
    params.push(options.day);
  }

  const { clause: pegawaiClause, params: pegawaiParams } = buildPegawaiFilter(
    options.allowedPegawaiIds
  );

  const whereClause = `WHERE ${conditions.join(" AND ")}${pegawaiClause}`;

  const [row] = await executeQuery<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM reminder r ${whereClause}`,
    [...params, ...pegawaiParams]
  );

  return row?.total ?? 0;
}

export async function getReminderStats(options: ReminderStatsOptions) {
  const { clause: pegawaiClause, params: pegawaiParams } = buildPegawaiFilter(
    options.allowedPegawaiIds
  );

  const [row] = await executeQuery<
    RowDataPacket & {
      total: number;
      active: number;
      harian: number;
      mingguan: number;
      bulanan: number;
    }
  >(
    `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN r.is_active = 1 THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN r.tipe_reminder = 'Harian' THEN 1 ELSE 0 END) AS harian,
        SUM(CASE WHEN r.tipe_reminder = 'Mingguan' THEN 1 ELSE 0 END) AS mingguan,
        SUM(CASE WHEN r.tipe_reminder = 'Bulanan' THEN 1 ELSE 0 END) AS bulanan
      FROM reminder r
      WHERE 1=1${pegawaiClause}`,
    pegawaiParams
  );

  const stats: ReminderStats = {
    total: row?.total ?? 0,
    active: row?.active ?? 0,
    harian: row?.harian ?? 0,
    mingguan: row?.mingguan ?? 0,
    bulanan: row?.bulanan ?? 0,
  };

  return stats;
}

export async function createReminder(data: ReminderPayload) {
  const hariSet = data.hari_dalam_minggu?.length
    ? data.hari_dalam_minggu.join(",")
    : null;

  const insertId = await executeInsert(
    `INSERT INTO reminder (
      pegawai_id,
      judul_reminder,
      pesan_reminder,
      tipe_reminder,
      waktu_reminder,
      hari_dalam_minggu,
      tanggal_spesifik,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.pegawai_id,
      data.judul_reminder,
      data.pesan_reminder ?? null,
      data.tipe_reminder,
      data.waktu_reminder,
      hariSet,
      data.tanggal_spesifik ?? null,
      data.is_active ? 1 : 0,
    ]
  );

  return insertId;
}

export async function updateReminder(
  id: number,
  data: Partial<ReminderPayload>
) {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.pegawai_id !== undefined) {
    fields.push("pegawai_id = ?");
    params.push(data.pegawai_id);
  }

  if (data.judul_reminder !== undefined) {
    fields.push("judul_reminder = ?");
    params.push(data.judul_reminder);
  }

  if (data.pesan_reminder !== undefined) {
    fields.push("pesan_reminder = ?");
    params.push(data.pesan_reminder ?? null);
  }

  if (data.tipe_reminder !== undefined) {
    fields.push("tipe_reminder = ?");
    params.push(data.tipe_reminder);
  }

  if (data.waktu_reminder !== undefined) {
    fields.push("waktu_reminder = ?");
    params.push(data.waktu_reminder);
  }

  if (data.hari_dalam_minggu !== undefined) {
    const joined = data.hari_dalam_minggu.length
      ? data.hari_dalam_minggu.join(",")
      : null;
    fields.push("hari_dalam_minggu = ?");
    params.push(joined);
  }

  if (data.tanggal_spesifik !== undefined) {
    fields.push("tanggal_spesifik = ?");
    params.push(data.tanggal_spesifik ?? null);
  }

  if (data.is_active !== undefined) {
    fields.push("is_active = ?");
    params.push(data.is_active ? 1 : 0);
  }

  if (!fields.length) {
    return 0;
  }

  params.push(id);

  return executeUpdate(
    `UPDATE reminder SET ${fields.join(", ")} WHERE reminder_id = ?`,
    params
  );
}

export async function deleteReminder(id: number) {
  return executeUpdate("DELETE FROM reminder WHERE reminder_id = ?", [id]);
}

export async function fetchPegawaiOptionsForReminder(
  allowedPegawaiIds?: number[]
): Promise<{ pegawai_id: number; pegawai_nama: string | null }[]> {
  if (allowedPegawaiIds && allowedPegawaiIds.length === 0) {
    return [] as PegawaiOptionRow[];
  }

  let query = `SELECT pegawai_id, pegawai_nama FROM pegawai_cache`;
  const params: number[] = [];

  if (allowedPegawaiIds && allowedPegawaiIds.length > 0) {
    const placeholders = allowedPegawaiIds.map(() => "?").join(",");
    query += ` WHERE pegawai_id IN (${placeholders})`;
    params.push(...allowedPegawaiIds);
  }

  query += " ORDER BY pegawai_nama ASC";

  const rows = await executeQuery<PegawaiOptionRow>(query, params);

  return rows.map((row) => ({
    pegawai_id: row.pegawai_id,
    pegawai_nama: row.pegawai_nama,
  }));
}

function formatDateTimeForSql(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function listActiveRemindersForPegawai(pegawaiId: number) {
  return executeQuery<ReminderListItem>(
    `SELECT r.*, p.pegawai_nama
     FROM reminder r
     LEFT JOIN pegawai_cache p ON p.pegawai_id = r.pegawai_id
     WHERE r.is_active = 1 AND r.pegawai_id = ?
     ORDER BY r.waktu_reminder ASC`,
    [pegawaiId]
  );
}

export async function markReminderSent(
  reminderId: number,
  sentAt: Date,
  deactivateAfterSend: boolean = false
) {
  const fields = ["terakhir_dikirim = ?"];
  const params: (string | number)[] = [formatDateTimeForSql(sentAt)];

  if (deactivateAfterSend) {
    fields.push("is_active = 0");
  }

  params.push(reminderId);

  return executeUpdate(
    `UPDATE reminder SET ${fields.join(", ")} WHERE reminder_id = ?`,
    params
  );
}

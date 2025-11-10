// lib/models/atasan-pegawai.model.ts

import { RowDataPacket } from "mysql2";
import {
  executeQuery,
  executeInsert,
  executeUpdate,
  getOne,
} from "@/lib/helpers/db-helpers";
import {
  AtasanPegawaiData,
  CreateAtasanPegawaiInput,
  UpdateAtasanPegawaiInput,
} from "@/lib/types";

export class AtasanPegawaiModel {
  /**
   * Get all atasan pegawai with pegawai and atasan names
   */
  static async getAll(): Promise<AtasanPegawaiData[]> {
    const query = `
      SELECT 
        ap.*,
        p1.pegawai_nama as pegawai_nama,
        p2.pegawai_nama as atasan_nama
      FROM atasan_pegawai ap
      LEFT JOIN pegawai_cache p1 ON ap.pegawai_id = p1.pegawai_id
      LEFT JOIN pegawai_cache p2 ON ap.atasan_id = p2.pegawai_id
      ORDER BY ap.created_at DESC
    `;

    return await executeQuery<AtasanPegawaiData & RowDataPacket>(query);
  }

  /**
   * Get active subordinate pegawai IDs for a specific atasan on the given date
   */
  static async getActiveSubordinateIds(
    atasanId: number,
    referenceDate: string
  ): Promise<number[]> {
    const query = `
      SELECT pegawai_id
      FROM atasan_pegawai
      WHERE atasan_id = ?
        AND is_active = 1
        AND tanggal_mulai <= ?
        AND (tanggal_selesai IS NULL OR tanggal_selesai >= ?)
    `;

    const rows = await executeQuery<{ pegawai_id: number } & RowDataPacket>(
      query,
      [atasanId, referenceDate, referenceDate]
    );

    return rows.map((row) => row.pegawai_id);
  }

  static async getPrimarySupervisor(
    pegawaiId: number,
    referenceDate: string
  ): Promise<{ atasan_id: number; atasan_nama: string | null } | null> {
    const query = `
      SELECT ap.atasan_id, pc.pegawai_nama AS atasan_nama
      FROM atasan_pegawai ap
      LEFT JOIN pegawai_cache pc ON ap.atasan_id = pc.pegawai_id
      WHERE ap.pegawai_id = ?
        AND ap.is_active = 1
        AND ap.tanggal_mulai <= ?
        AND (ap.tanggal_selesai IS NULL OR ap.tanggal_selesai >= ?)
      ORDER BY CASE ap.jenis_atasan WHEN 'Langsung' THEN 0 ELSE 1 END,
               ap.tanggal_mulai DESC,
               ap.created_at DESC
      LIMIT 1
    `;

    const result = await getOne<
      { atasan_id: number; atasan_nama: string | null } & RowDataPacket
    >(query, [pegawaiId, referenceDate, referenceDate]);

    return result ?? null;
  }

  static async isSupervisorOf(
    atasanId: number,
    pegawaiId: number,
    referenceDate: string
  ): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as total
      FROM atasan_pegawai
      WHERE atasan_id = ?
        AND pegawai_id = ?
        AND is_active = 1
        AND tanggal_mulai <= ?
        AND (tanggal_selesai IS NULL OR tanggal_selesai >= ?)
    `;

    const result = await getOne<{ total: number } & RowDataPacket>(query, [
      atasanId,
      pegawaiId,
      referenceDate,
      referenceDate,
    ]);

    return Boolean(result?.total);
  }

  /**
   * Get atasan pegawai by ID
   */
  static async getById(id: number): Promise<AtasanPegawaiData | null> {
    const query = `
      SELECT 
        ap.*,
        p1.pegawai_nama as pegawai_nama,
        p2.pegawai_nama as atasan_nama
      FROM atasan_pegawai ap
      LEFT JOIN pegawai_cache p1 ON ap.pegawai_id = p1.pegawai_id
      LEFT JOIN pegawai_cache p2 ON ap.atasan_id = p2.pegawai_id
      WHERE ap.id = ?
    `;

    return await getOne<AtasanPegawaiData & RowDataPacket>(query, [id]);
  }

  /**
   * Create new atasan pegawai
   */
  static async create(data: CreateAtasanPegawaiInput): Promise<number> {
    const query = `
      INSERT INTO atasan_pegawai (
        pegawai_id,
        atasan_id,
        jenis_atasan,
        is_active,
        tanggal_mulai,
        tanggal_selesai,
        keterangan
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.pegawai_id,
      data.atasan_id,
      data.jenis_atasan,
      data.is_active ?? 1,
      data.tanggal_mulai,
      data.tanggal_selesai ?? null,
      data.keterangan ?? null,
    ];

    return await executeInsert(query, params);
  }

  /**
   * Update atasan pegawai
   */
  static async update(
    id: number,
    data: UpdateAtasanPegawaiInput
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.pegawai_id !== undefined) {
      fields.push("pegawai_id = ?");
      values.push(data.pegawai_id);
    }
    if (data.atasan_id !== undefined) {
      fields.push("atasan_id = ?");
      values.push(data.atasan_id);
    }
    if (data.jenis_atasan !== undefined) {
      fields.push("jenis_atasan = ?");
      values.push(data.jenis_atasan);
    }
    if (data.is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(data.is_active);
    }
    if (data.tanggal_mulai !== undefined) {
      fields.push("tanggal_mulai = ?");
      values.push(data.tanggal_mulai);
    }
    if (data.tanggal_selesai !== undefined) {
      fields.push("tanggal_selesai = ?");
      values.push(data.tanggal_selesai);
    }
    if (data.keterangan !== undefined) {
      fields.push("keterangan = ?");
      values.push(data.keterangan);
    }

    if (fields.length === 0) {
      return false;
    }

    const query = `UPDATE atasan_pegawai SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    const affectedRows = await executeUpdate(query, values);
    return affectedRows > 0;
  }

  /**
   * Delete atasan pegawai
   */
  static async delete(id: number): Promise<boolean> {
    const query = "DELETE FROM atasan_pegawai WHERE id = ?";
    const affectedRows = await executeUpdate(query, [id]);
    return affectedRows > 0;
  }

  /**
   * Check if pegawai-atasan relationship already exists
   */
  static async checkDuplicate(
    pegawaiId: number,
    atasanId: number,
    excludeId?: number
  ): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count 
      FROM atasan_pegawai 
      WHERE pegawai_id = ? AND atasan_id = ? AND is_active = 1
    `;
    const params: any[] = [pegawaiId, atasanId];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const result = await getOne<{ count: number } & RowDataPacket>(
      query,
      params
    );
    return result ? result.count > 0 : false;
  }
}

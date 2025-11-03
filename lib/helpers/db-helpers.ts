// lib/helpers/db-helpers.ts
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import pool from "@/lib/db";

// Generic SELECT
export async function executeQuery<T extends RowDataPacket>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const [rows] = await pool.query<T[]>(query, params);
  return rows;
}

// Generic INSERT
export async function executeInsert(
  query: string,
  params: any[] = []
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(query, params);
  return result.insertId;
}

// Generic UPDATE/DELETE
export async function executeUpdate(
  query: string,
  params: any[] = []
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(query, params);
  return result.affectedRows;
}

// Transaction helper
export async function executeTransaction(
  callback: (connection: any) => Promise<void>
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await callback(connection);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Get single row
export async function getOne<T extends RowDataPacket>(
  query: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await executeQuery<T>(query, params);
  return rows.length > 0 ? rows[0] : null;
}

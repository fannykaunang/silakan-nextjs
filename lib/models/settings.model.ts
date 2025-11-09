// lib/models/settings.model.ts
import { executeQuery, executeUpdate, getOne } from "@/lib/helpers/db-helpers";
import type { Setting } from "@/lib/types";

export async function fetchAllSettings(): Promise<Setting[]> {
  return await executeQuery<Setting>(
    `SELECT setting_id, setting_key, setting_value, setting_type, deskripsi,
            kategori_setting, is_editable, created_at, updated_at
       FROM settings
      ORDER BY COALESCE(kategori_setting, ''), setting_key`
  );
}

export async function getSettingById(
  settingId: number
): Promise<Setting | null> {
  return await getOne<Setting>(
    `SELECT setting_id, setting_key, setting_value, setting_type, deskripsi,
            kategori_setting, is_editable, created_at, updated_at
       FROM settings
      WHERE setting_id = ?`,
    [settingId]
  );
}

export async function updateSettingValue(
  settingId: number,
  newValue: string
): Promise<number> {
  return await executeUpdate(
    `UPDATE settings
        SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE setting_id = ?`,
    [newValue, settingId]
  );
}

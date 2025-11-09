// lib/types/settings.types.ts
import type { RowDataPacket } from "mysql2/promise";
export type SettingType = "String" | "Number" | "Boolean" | "JSON";

export interface Setting extends RowDataPacket {
  setting_id: number;
  setting_key: string;
  setting_value: string;
  setting_type: SettingType;
  deskripsi: string | null;
  kategori_setting: string | null;
  is_editable: 0 | 1;
  created_at: string | null;
  updated_at: string | null;
}

export interface SettingUpdatePayload {
  setting_id: number;
  setting_value: string;
}

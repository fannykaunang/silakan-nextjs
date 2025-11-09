// app/api/settings/[id]/route.ts

import { NextResponse } from "next/server";
import {
  getClientInfoWithEndpoint,
  requireAuth,
} from "@/lib/helpers/auth-helper";
import {
  getSettingById,
  updateSettingValue,
} from "@/lib/models/settings.model";
import { createLogWithData } from "@/lib/models/log.model";
import type { SettingType } from "@/lib/types";

class ValidationError extends Error {}

function normalizeSettingValue(type: SettingType, value: unknown): string {
  switch (type) {
    case "Number": {
      if (typeof value === "number") {
        if (!Number.isFinite(value)) {
          throw new ValidationError("Nilai angka tidak valid");
        }
        return String(value);
      }

      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) {
          throw new ValidationError("Nilai angka wajib diisi");
        }
        const parsed = Number(trimmed);
        if (Number.isNaN(parsed)) {
          throw new ValidationError("Nilai angka tidak valid");
        }
        return String(parsed);
      }

      throw new ValidationError("Nilai angka tidak valid");
    }
    case "Boolean": {
      if (typeof value === "boolean") {
        return value ? "true" : "false";
      }

      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "ya", "yes"].includes(normalized)) {
          return "true";
        }
        if (["false", "0", "tidak", "no"].includes(normalized)) {
          return "false";
        }
      }

      throw new ValidationError(
        "Nilai boolean tidak valid. Gunakan true atau false"
      );
    }
    case "JSON": {
      if (value === null || value === undefined) {
        throw new ValidationError("Nilai JSON wajib diisi");
      }

      try {
        const parsed =
          typeof value === "string"
            ? JSON.parse(value)
            : JSON.parse(JSON.stringify(value));
        return JSON.stringify(parsed);
      } catch (error) {
        throw new ValidationError("Format JSON tidak valid");
      }
    }
    case "String":
    default: {
      if (value === null || value === undefined) {
        return "";
      }
      return String(value);
    }
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const settingId = Number(params.id);

  if (!Number.isFinite(settingId)) {
    return NextResponse.json(
      { success: false, message: "ID pengaturan tidak valid" },
      { status: 400 }
    );
  }

  try {
    const user = await requireAuth();

    if (user.level !== 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya admin yang dapat memperbarui pengaturan",
        },
        { status: 403 }
      );
    }

    const existing = await getSettingById(settingId);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Pengaturan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!existing.is_editable) {
      return NextResponse.json(
        {
          success: false,
          message: "Pengaturan ini tidak dapat diubah",
        },
        { status: 403 }
      );
    }

    let body: any = null;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Format permintaan tidak valid",
        },
        { status: 400 }
      );
    }

    const rawValue =
      body?.setting_value !== undefined ? body.setting_value : body?.value;

    if (rawValue === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Nilai pengaturan wajib diisi",
        },
        { status: 400 }
      );
    }

    let normalizedValue: string;
    try {
      normalizedValue = normalizeSettingValue(existing.setting_type, rawValue);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }
      throw error;
    }

    if (normalizedValue === existing.setting_value) {
      return NextResponse.json(
        {
          success: true,
          message: "Tidak ada perubahan pada pengaturan",
          data: existing,
        },
        { status: 200 }
      );
    }

    const affected = await updateSettingValue(settingId, normalizedValue);

    if (affected === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Pengaturan gagal diperbarui",
        },
        { status: 500 }
      );
    }

    const updated = await getSettingById(settingId);

    const clientInfo = getClientInfoWithEndpoint(
      request,
      `/api/settings/${settingId}`,
      "PUT"
    );

    try {
      await createLogWithData({
        pegawai_id: user.pegawai_id ?? 0,
        aksi: "Update",
        modul: "Settings",
        detail_aksi: `Memperbarui pengaturan ${existing.setting_key}`,
        data_sebelum: existing,
        data_sesudah: updated,
        ...clientInfo,
      });
    } catch (logError) {
      console.error("Failed to write settings update log:", logError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pengaturan berhasil diperbarui",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    console.error(`Failed to update setting ${settingId}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui pengaturan",
      },
      { status: 500 }
    );
  }
}

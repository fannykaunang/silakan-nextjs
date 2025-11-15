// app/api/laporan-kegiatan/cetak/pegawai/route.ts

import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";

import { requireAuth } from "@/lib/helpers/auth-helper";
import { executeQuery } from "@/lib/helpers/db-helpers";
import { getTodayDateString } from "@/lib/helpers/laporan-settings";
import { AtasanPegawaiModel } from "@/lib/models/atasan-pegawai.model";

type PegawaiRow = RowDataPacket & {
  pegawai_id: number;
  pegawai_nama: string;
  pegawai_nip: string | null;
  jabatan: string | null;
  skpd: string | null;
  skpdid?: number | null;
};

export async function GET() {
  try {
    const user = await requireAuth();

    const isAdmin = user.level >= 3;
    const isSubAdmin = user.level === 2;

    const baseSelect = `SELECT pegawai_id, pegawai_nama, pegawai_nip, jabatan, skpd, skpdid FROM pegawai_cache`;

    let rows: PegawaiRow[] = [];
    let role: "admin" | "subadmin" | "atasan" | "pegawai" = "pegawai";
    let currentPegawaiId: number | null = null;

    if (isAdmin) {
      rows = await executeQuery<PegawaiRow>(
        `${baseSelect} ORDER BY pegawai_nama ASC`
      );
      role = "admin";
      currentPegawaiId =
        typeof user.pegawai_id === "number" ? user.pegawai_id : null;
    } else if (isSubAdmin) {
      if (typeof user.skpdid !== "number") {
        return NextResponse.json(
          {
            success: false,
            error: "Data SKPD pengguna tidak tersedia",
          },
          { status: 400 }
        );
      }

      rows = await executeQuery<PegawaiRow>(
        `${baseSelect} WHERE skpdid = ? ORDER BY pegawai_nama ASC`,
        [user.skpdid]
      );
      role = "subadmin";
      currentPegawaiId =
        typeof user.pegawai_id === "number" ? user.pegawai_id : null;
    } else {
      if (typeof user.pegawai_id !== "number") {
        return NextResponse.json(
          {
            success: false,
            error: "Pegawai tidak ditemukan pada sesi aktif",
          },
          { status: 400 }
        );
      }

      const today = getTodayDateString();
      const subordinateIds = await AtasanPegawaiModel.getActiveSubordinateIds(
        user.pegawai_id,
        today
      );

      const accessibleIds = Array.from(
        new Set([user.pegawai_id, ...subordinateIds])
      );

      if (accessibleIds.length === 0) {
        return NextResponse.json(
          {
            success: true,
            data: [],
            meta: {
              total: 0,
              role,
              currentPegawaiId: user.pegawai_id,
              subordinateCount: 0,
            },
          },
          { status: 200 }
        );
      }

      const placeholders = accessibleIds.map(() => "?").join(", ");
      rows = await executeQuery<PegawaiRow>(
        `${baseSelect} WHERE pegawai_id IN (${placeholders}) ORDER BY CASE WHEN pegawai_id = ? THEN 0 ELSE 1 END, pegawai_nama ASC`,
        [...accessibleIds, user.pegawai_id]
      );

      role = subordinateIds.length > 0 ? "atasan" : "pegawai";
      currentPegawaiId = user.pegawai_id;
    }

    const data = rows.map((row) => ({
      pegawai_id: Number(row.pegawai_id),
      pegawai_nama: row.pegawai_nama,
      pegawai_nip: row.pegawai_nip ?? null,
      jabatan: row.jabatan ?? null,
      skpd: row.skpd ?? null,
    }));

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          total: data.length,
          role,
          currentPegawaiId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pegawai options for cetak laporan:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil daftar pegawai yang tersedia",
      },
      { status: 500 }
    );
  }
}

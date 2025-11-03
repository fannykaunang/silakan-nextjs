// app/api/notifikasi/read-all/route.ts
import { NextResponse } from "next/server";
import { executeUpdate, executeQuery } from "@/lib/helpers/db-helpers";
import { requireAuth } from "@/lib/helpers/auth-helper";

export async function PATCH() {
  try {
    // Require authentication
    const user = await requireAuth();

    console.log("✅ Marking all notifikasi as read for user:", user.pin);

    // Get pegawai_id
    const pegawaiData = await executeQuery<any>(
      `SELECT pegawai_id FROM pegawai_cache WHERE pegawai_pin = ?`,
      [user.pin]
    );

    if (!pegawaiData || pegawaiData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pegawai tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const pegawaiId = pegawaiData[0].pegawai_id;

    const affectedRows = await executeUpdate(
      `UPDATE notifikasi 
       SET is_read = 1, tanggal_dibaca = NOW()
       WHERE pegawai_id = ? AND is_read = 0`,
      [pegawaiId]
    );

    console.log(`✅ Marked ${affectedRows} notifikasi as read`);

    return NextResponse.json(
      {
        success: true,
        message: "Semua notifikasi ditandai sudah dibaca",
        count: affectedRows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error marking all notifikasi as read:", error);

    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("login")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menandai notifikasi",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

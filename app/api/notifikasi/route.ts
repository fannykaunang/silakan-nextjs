// app/api/notifikasi/route.ts
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/helpers/db-helpers";
import { requireAuth } from "@/lib/helpers/auth-helper";

// GET: Fetch notifikasi untuk user yang login
export async function GET() {
  try {
    // Require authentication
    const user = await requireAuth();

    console.log("🔔 Fetching notifikasi for user:", user.pin);

    // Get pegawai_id from pin
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

    const notifikasi = await executeQuery<any>(
      `SELECT 
        notifikasi_id,
        pegawai_id,
        judul,
        pesan,
        tipe_notifikasi,
        laporan_id,
        link_tujuan,
        action_required,
        is_read,
        tanggal_dibaca,
        created_at
      FROM notifikasi
      WHERE pegawai_id = ?
      ORDER BY created_at DESC`,
      [pegawaiId]
    );

    console.log(`✅ Found ${notifikasi.length} notifikasi`);

    return NextResponse.json(
      {
        success: true,
        data: notifikasi,
        count: notifikasi.length,
        unread: notifikasi.filter((n: any) => n.is_read === 0).length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error fetching notifikasi:", error);

    // Handle authentication errors
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
        message: "Gagal mengambil data notifikasi",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

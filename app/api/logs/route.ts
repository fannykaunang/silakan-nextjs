// app/api/logs/route.ts
import { NextResponse } from "next/server";
import { executeQuery, executeUpdate } from "@/lib/helpers/db-helpers";
import { requireAdmin } from "@/lib/helpers/auth-helper";

// GET: Fetch semua log aktivitas
export async function GET() {
  try {
    // Hanya admin yang bisa akses
    await requireAdmin();

    console.log("🔍 Fetching all logs...");

    const logs = await executeQuery<any>(
      `SELECT 
        la.log_id,
        la.pegawai_id,
        pc.pegawai_nama,
        la.aksi,
        la.modul,
        la.detail_aksi,
        la.data_sebelum,
        la.data_sesudah,
        la.ip_address,
        la.user_agent,
        la.endpoint,
        la.method,
        la.created_at
      FROM log_aktivitas la
      LEFT JOIN pegawai_cache pc ON la.pegawai_id = pc.pegawai_id
      ORDER BY la.created_at DESC`
    );

    console.log(`✅ Found ${logs.length} logs`);

    return NextResponse.json(
      {
        success: true,
        data: logs,
        count: logs.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error fetching logs:", error);

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

    if (
      error.message?.includes("Forbidden") ||
      error.message?.includes("privilege")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya admin yang dapat melihat log aktivitas",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data log",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE: Hapus log tertentu
export async function DELETE(req: Request) {
  try {
    // Hanya admin yang bisa hapus log
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const log_id = searchParams.get("id");

    if (!log_id) {
      return NextResponse.json(
        { success: false, message: "ID log wajib diisi" },
        { status: 400 }
      );
    }

    console.log("🗑️ Deleting log:", log_id);

    const affectedRows = await executeUpdate(
      `DELETE FROM log_aktivitas WHERE log_id = ?`,
      [log_id]
    );

    if (affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Log tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("✅ Log deleted successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Log berhasil dihapus",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error deleting log:", error);

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

    if (
      error.message?.includes("Forbidden") ||
      error.message?.includes("privilege")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya admin yang dapat menghapus log",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus log",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

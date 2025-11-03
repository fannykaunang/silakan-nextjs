// app/api/logs/clear/route.ts
import { NextResponse } from "next/server";
import { executeUpdate } from "@/lib/helpers/db-helpers";
import { requireAdmin } from "@/lib/helpers/auth-helper";

// DELETE: Hapus semua log aktivitas
export async function DELETE() {
  try {
    // Hanya admin yang bisa hapus semua log
    await requireAdmin();

    console.log("🗑️ Clearing all logs...");

    const affectedRows = await executeUpdate(`DELETE FROM log_aktivitas`);

    console.log(`✅ Deleted ${affectedRows} logs`);

    return NextResponse.json(
      {
        success: true,
        message: "Semua log berhasil dihapus",
        deletedCount: affectedRows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error clearing logs:", error);

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
          message: "Hanya admin yang dapat menghapus semua log",
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

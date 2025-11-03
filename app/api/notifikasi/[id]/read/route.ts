// app/api/notifikasi/[id]/read/route.ts
import { NextResponse } from "next/server";
import { executeUpdate } from "@/lib/helpers/db-helpers";
import { requireAuth } from "@/lib/helpers/auth-helper";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await requireAuth();

    // Await params (Next.js 15+)
    const { id } = await params;
    const notifikasiId = id;

    console.log("✅ Marking notifikasi as read:", notifikasiId);

    const affectedRows = await executeUpdate(
      `UPDATE notifikasi 
       SET is_read = 1, tanggal_dibaca = NOW()
       WHERE notifikasi_id = ?`,
      [notifikasiId]
    );

    if (affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Notifikasi tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("✅ Notifikasi marked as read");

    return NextResponse.json(
      {
        success: true,
        message: "Notifikasi ditandai sudah dibaca",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error marking notifikasi as read:", error);

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

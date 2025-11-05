// app/api/laporan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getClientInfo } from "@/lib/helpers/auth-helper";
import { createLaporan } from "@/lib/models/laporan.model";
import { createLog } from "@/lib/models/log.model";

export async function POST(request: NextRequest) {
  try {
    // Require authentication (throws error if not authenticated)
    const user = await requireAuth();

    const body = await request.json();
    const clientInfo = getClientInfo(request);

    // Create laporan
    const laporanId = await createLaporan({
      ...body,
      pegawai_id: user.pegawai_id!,
    });

    // Log activity
    await createLog({
      pegawai_id: user.pegawai_id!,
      aksi: "Create",
      modul: "Laporan",
      detail_aksi: `Created laporan: ${body.nama_kegiatan}`,
      ...clientInfo,
    });

    return NextResponse.json(
      {
        success: true,
        data: { laporan_id: laporanId },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

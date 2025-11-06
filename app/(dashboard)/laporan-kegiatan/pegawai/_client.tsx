import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/helpers/auth-helper";
import { getPegawaiById } from "@/lib/models/pegawai.model";
import { getAllLaporan } from "@/lib/models/laporan.model";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const pegawaiId = Number(params.id);
    if (!pegawaiId || Number.isNaN(pegawaiId)) {
      return NextResponse.json(
        { success: false, error: "ID pegawai tidak valid" },
        { status: 400 }
      );
    }

    const targetPegawai = await getPegawaiById(pegawaiId);

    if (!targetPegawai) {
      return NextResponse.json(
        { success: false, error: "Data pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    const isAdmin = user.level === 3;
    const isSubAdmin = user.level === 2;
    const isSameUser = user.pegawai_id === pegawaiId;

    if (!isAdmin) {
      if (isSubAdmin) {
        if (
          user.skpdid == null ||
          targetPegawai.skpdid == null ||
          Number(user.skpdid) !== Number(targetPegawai.skpdid)
        ) {
          return NextResponse.json(
            { success: false, error: "Anda tidak memiliki akses ke data ini" },
            { status: 403 }
          );
        }
      } else if (!isSameUser) {
        return NextResponse.json(
          { success: false, error: "Anda tidak memiliki akses ke data ini" },
          { status: 403 }
        );
      }
    }

    const laporanList = await getAllLaporan(pegawaiId, false);

    return NextResponse.json({
      success: true,
      data: laporanList,
      pegawai: {
        pegawai_id: targetPegawai.pegawai_id,
        pegawai_nama: targetPegawai.pegawai_nama,
        pegawai_nip: targetPegawai.pegawai_nip,
        jabatan: targetPegawai.jabatan ?? null,
        skpd: targetPegawai.skpd ?? null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching laporan by pegawai:", error);

    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat mengambil data laporan",
      },
      { status: 500 }
    );
  }
}

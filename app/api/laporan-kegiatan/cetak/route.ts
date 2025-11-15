import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/helpers/auth-helper";
import { getPegawaiById } from "@/lib/models/pegawai.model";
import {
  getFilesByLaporanIds,
  getLaporanByPegawaiAndMonth,
} from "@/lib/models/laporan.model";
import { getTodayDateString } from "@/lib/helpers/laporan-settings";
import { AtasanPegawaiModel } from "@/lib/models/atasan-pegawai.model";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const pegawaiIdParam = searchParams.get("pegawaiId");
    const tahunParam = searchParams.get("tahun");
    const bulanParam = searchParams.get("bulan");

    if (!pegawaiIdParam || !tahunParam || !bulanParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Parameter pegawaiId, tahun, dan bulan wajib diisi",
        },
        { status: 400 }
      );
    }

    const pegawaiId = Number(pegawaiIdParam);
    const tahun = Number(tahunParam);
    const bulan = Number(bulanParam);

    if (Number.isNaN(pegawaiId) || Number.isNaN(tahun) || Number.isNaN(bulan)) {
      return NextResponse.json(
        { success: false, error: "Parameter yang diberikan tidak valid" },
        { status: 400 }
      );
    }

    if (bulan < 1 || bulan > 12) {
      return NextResponse.json(
        { success: false, error: "Nilai bulan harus antara 1 sampai 12" },
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

    if (!isAdmin) {
      if (isSubAdmin) {
        if (
          typeof user.skpdid !== "number" ||
          typeof targetPegawai.skpdid !== "number" ||
          Number(user.skpdid) !== Number(targetPegawai.skpdid)
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Anda tidak memiliki akses ke data pegawai ini",
            },
            { status: 403 }
          );
        }
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
        const accessiblePegawaiIds = new Set<number>([user.pegawai_id]);
        const subordinateIds = await AtasanPegawaiModel.getActiveSubordinateIds(
          user.pegawai_id,
          today
        );
        subordinateIds.forEach((id) => accessiblePegawaiIds.add(id));

        if (!accessiblePegawaiIds.has(pegawaiId)) {
          return NextResponse.json(
            {
              success: false,
              error: "Anda tidak memiliki akses ke data pegawai ini",
            },
            { status: 403 }
          );
        }
      }
    }

    const laporanList = await getLaporanByPegawaiAndMonth(
      pegawaiId,
      tahun,
      bulan
    );

    const laporanIds = laporanList.map((laporan) => laporan.laporan_id);
    const lampiranList = await getFilesByLaporanIds(laporanIds);

    return NextResponse.json({
      success: true,
      data: {
        pegawai: {
          pegawai_id: targetPegawai.pegawai_id,
          pegawai_nama: targetPegawai.pegawai_nama,
          pegawai_nip: targetPegawai.pegawai_nip,
          jabatan: targetPegawai.jabatan ?? null,
          skpd: targetPegawai.skpd ?? null,
        },
        laporan: laporanList,
        lampiran: lampiranList.map((lampiran) => ({
          file_id: lampiran.file_id,
          laporan_id: lampiran.laporan_id,
          nama_file_asli: lampiran.nama_file_asli,
          nama_file_sistem: lampiran.nama_file_sistem,
          path_file: lampiran.path_file,
          tipe_file: lampiran.tipe_file,
          ukuran_file: lampiran.ukuran_file,
          uploaded_by: lampiran.uploaded_by,
          deskripsi_file: lampiran.deskripsi_file,
          created_at: lampiran.created_at,
          nama_kegiatan: lampiran.nama_kegiatan,
          tanggal_kegiatan: lampiran.tanggal_kegiatan,
        })),
      },
      meta: {
        tahun,
        bulan,
        total: laporanList.length,
      },
    });
  } catch (error) {
    console.error("Error generating monthly activity report:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
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

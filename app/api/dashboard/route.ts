import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/helpers/db-helpers";
import { RowDataPacket } from "mysql2";
import { getUserFromCookie } from "@/lib/helpers/auth-helper";

type TotalRow = RowDataPacket & { total: number };
type MonthlyRow = RowDataPacket & { month: string; total: number };
type LatestLaporanRow = RowDataPacket & {
  laporan_id: number;
  nama_kegiatan: string;
  status_laporan: string;
  created_at: string | Date | null;
  pegawai_nama: string | null;
};

const STATUS_DIAJUKAN = "Diajukan";
const STATUS_DIVERIFIKASI = "Diverifikasi";
const STATUS_REVISI = "Revisi";

function formatMonthlySeries(rows: MonthlyRow[]) {
  const now = new Date();
  const series = [] as { month: string; total: number }[];
  const map = new Map<string, number>();

  rows.forEach((row) => {
    map.set(row.month, Number(row.total) || 0);
  });

  for (let index = 5; index >= 0; index -= 1) {
    const current = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${current.getFullYear()}-${String(
      current.getMonth() + 1
    ).padStart(2, "0")}`;
    const label = current.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });

    series.push({
      month: label,
      total: map.get(key) ?? 0,
    });
  }

  return series;
}

export async function GET() {
  try {
    const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const isAdmin = user.level >= 3;
    const pegawaiId = user.pegawai_id;

    if (!isAdmin && typeof pegawaiId !== "number") {
      return NextResponse.json(
        {
          success: false,
          message: "Data pegawai tidak ditemukan untuk pengguna ini",
        },
        { status: 400 }
      );
    }

    const laporanFilterSuffix = isAdmin ? "" : " AND pegawai_id = ?";
    const pegawaiFilterSuffix = isAdmin ? "" : " WHERE pegawai_id = ?";
    const latestWhereClause = isAdmin ? "" : " WHERE lk.pegawai_id = ?";

    const [totalDiajukan] = await executeQuery<TotalRow>(
      `SELECT COUNT(*) AS total FROM laporan_kegiatan WHERE status_laporan = ?${laporanFilterSuffix}`,
      isAdmin ? [STATUS_DIAJUKAN] : [STATUS_DIAJUKAN, pegawaiId!]
    );

    const [totalDiverifikasi] = await executeQuery<TotalRow>(
      `SELECT COUNT(*) AS total FROM laporan_kegiatan WHERE status_laporan = ?${laporanFilterSuffix}`,
      isAdmin ? [STATUS_DIVERIFIKASI] : [STATUS_DIVERIFIKASI, pegawaiId!]
    );

    const [totalRevisi] = await executeQuery<TotalRow>(
      `SELECT COUNT(*) AS total FROM laporan_kegiatan WHERE status_laporan = ?${laporanFilterSuffix}`,
      isAdmin ? [STATUS_REVISI] : [STATUS_REVISI, pegawaiId!]
    );

    const [totalPegawai] = await executeQuery<TotalRow>(
      `SELECT COUNT(*) AS total FROM pegawai_cache${pegawaiFilterSuffix}`,
      isAdmin ? [] : [pegawaiId!]
    );

    const kegiatanByMonthRaw = await executeQuery<MonthlyRow>(
      `
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS total
        FROM laporan_kegiatan
        WHERE created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
          ${isAdmin ? "" : "AND pegawai_id = ?"}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
          `,
      isAdmin ? [] : [pegawaiId!]
    );

    const pegawaiByMonthRaw = await executeQuery<MonthlyRow>(
      `
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS total
        FROM pegawai_cache
        WHERE created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
          ${isAdmin ? "" : "AND pegawai_id = ?"}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
         `,
      isAdmin ? [] : [pegawaiId!]
    );

    const latestLaporan = await executeQuery<LatestLaporanRow>(
      `
        SELECT
          lk.laporan_id,
          lk.nama_kegiatan,
          lk.status_laporan,
          lk.created_at,
          pc.pegawai_nama
        FROM laporan_kegiatan lk
        LEFT JOIN pegawai_cache pc ON lk.pegawai_id = pc.pegawai_id
          ${latestWhereClause}
        ORDER BY lk.created_at DESC
        LIMIT 10
            `,
      isAdmin ? [] : [pegawaiId!]
    );

    const formattedLatestLaporan = latestLaporan.map((item) => ({
      laporan_id: item.laporan_id,
      nama_kegiatan: item.nama_kegiatan,
      status_laporan: item.status_laporan,
      pegawai_nama: item.pegawai_nama,
      created_at: item.created_at
        ? new Date(item.created_at).toISOString()
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          diajukan: totalDiajukan?.total ?? 0,
          diverifikasi: totalDiverifikasi?.total ?? 0,
          revisi: totalRevisi?.total ?? 0,
          pegawai: totalPegawai?.total ?? 0,
        },
        kegiatanByMonth: formatMonthlySeries(kegiatanByMonthRaw),
        pegawaiByMonth: formatMonthlySeries(pegawaiByMonthRaw),
        latestLaporan: formattedLatestLaporan,
      },
    });
  } catch (error) {
    console.error("Failed to load dashboard summary:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat ringkasan dashboard",
      },
      { status: 500 }
    );
  }
}

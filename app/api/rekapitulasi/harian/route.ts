// app/api/rekapitulasi/harian/route.ts
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/helpers/db-helpers";
import { RowDataPacket } from "mysql2";
import { getUserFromCookie } from "@/lib/helpers/auth-helper";

type RekapRow = RowDataPacket & {
  jumlah_diverifikasi: number;
  jumlah_pending: number;
  jumlah_ditolak: number;
  avg_produktivitas: number;
  total_durasi: number;
};

type TimeSeriesRow = RowDataPacket & {
  tanggal: string;
  jumlah_kegiatan: number;
};

type SkpdRow = RowDataPacket & {
  skpdid: number;
  skpd: string;
};

type PegawaiRow = RowDataPacket & {
  pegawai_id: number;
  pegawai_nama: string;
};

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const skpdFilter = searchParams.get("skpdid");
    const pegawaiFilter = searchParams.get("pegawai_id");

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

    // Build WHERE clause based on user role and filters
    let whereClause = "";
    const params: any[] = [];

    if (!isAdmin) {
      // Non-admin: hanya data milik sendiri
      whereClause = "WHERE rh.pegawai_id = ?";
      params.push(pegawaiId!);
    } else {
      // Admin: bisa filter berdasarkan skpd dan pegawai
      const conditions: string[] = [];

      if (skpdFilter) {
        conditions.push("pc.skpdid = ?");
        params.push(parseInt(skpdFilter));
      }

      if (pegawaiFilter) {
        conditions.push("rh.pegawai_id = ?");
        params.push(parseInt(pegawaiFilter));
      }

      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(" AND ")}`;
      }
    }

    // 1. Get aggregated metrics
    const [metricsResult] = await executeQuery<RekapRow>(
      `
      SELECT
        COALESCE(SUM(rh.jumlah_diverifikasi), 0) AS jumlah_diverifikasi,
        COALESCE(SUM(rh.jumlah_pending), 0) AS jumlah_pending,
        COALESCE(SUM(rh.jumlah_ditolak), 0) AS jumlah_ditolak,
        COALESCE(AVG(rh.produktivitas_persen), 0) AS avg_produktivitas,
        COALESCE(SUM(rh.total_durasi_menit), 0) AS total_durasi
      FROM rekap_harian rh
      LEFT JOIN pegawai_cache pc ON rh.pegawai_id = pc.pegawai_id
      ${whereClause}
      `,
      params
    );

    // 2. Get time series data (last 30 days)
    const timeSeriesData = await executeQuery<TimeSeriesRow>(
      `
      SELECT
        DATE_FORMAT(rh.tanggal, '%Y-%m-%d') AS tanggal,
        COALESCE(SUM(rh.jumlah_kegiatan), 0) AS jumlah_kegiatan
      FROM rekap_harian rh
      LEFT JOIN pegawai_cache pc ON rh.pegawai_id = pc.pegawai_id
      ${whereClause}
        ${
          whereClause ? "AND" : "WHERE"
        } rh.tanggal >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY rh.tanggal
      ORDER BY rh.tanggal ASC
      `,
      params
    );

    // Format time series to include all dates in range (with 0 for missing dates)
    const formattedTimeSeries = formatTimeSeriesData(timeSeriesData);

    // 3. Get SKPD list for admin filter (with deduplication)
    let skpdList: SkpdRow[] = [];
    if (isAdmin) {
      const rawSkpdList = await executeQuery<SkpdRow>(
        `
        SELECT DISTINCT pc.skpdid, pc.skpd
        FROM pegawai_cache pc
        WHERE pc.skpdid IS NOT NULL AND pc.skpd IS NOT NULL
        ORDER BY pc.skpd ASC
        `
      );

      // Additional deduplication in case of database inconsistencies
      const skpdMap = new Map<number, string>();
      rawSkpdList.forEach((row) => {
        if (!skpdMap.has(row.skpdid)) {
          skpdMap.set(row.skpdid, row.skpd);
        }
      });

      skpdList = Array.from(skpdMap.entries()).map(([skpdid, skpd]) => ({
        skpdid,
        skpd,
      })) as SkpdRow[];
    }

    // 4. Get Pegawai list for admin filter
    let pegawaiList: PegawaiRow[] = [];
    if (isAdmin) {
      const pegawaiWhereClause = skpdFilter ? "WHERE pc.skpdid = ?" : "";
      const pegawaiParams = skpdFilter ? [parseInt(skpdFilter)] : [];

      pegawaiList = await executeQuery<PegawaiRow>(
        `
        SELECT pc.pegawai_id, pc.pegawai_nama
        FROM pegawai_cache pc
        ${pegawaiWhereClause}
        ORDER BY pc.pegawai_nama ASC
        `,
        pegawaiParams
      );
    }

    // Convert avg_produktivitas safely (MySQL returns DECIMAL as string)
    const avgProduktivitas = metricsResult?.avg_produktivitas ?? 0;
    const avgProduktivitasNum =
      typeof avgProduktivitas === "string"
        ? parseFloat(avgProduktivitas)
        : Number(avgProduktivitas);
    const avgProduktivitasRounded = isNaN(avgProduktivitasNum)
      ? 0
      : parseFloat(avgProduktivitasNum.toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          jumlah_diverifikasi: metricsResult?.jumlah_diverifikasi ?? 0,
          jumlah_pending: metricsResult?.jumlah_pending ?? 0,
          jumlah_ditolak: metricsResult?.jumlah_ditolak ?? 0,
          avg_produktivitas: avgProduktivitasRounded,
          total_durasi: metricsResult?.total_durasi ?? 0,
        },
        timeSeries: formattedTimeSeries,
        filters: {
          skpdList,
          pegawaiList,
        },
        isAdmin,
      },
    });
  } catch (error) {
    console.error("Failed to load rekapitulasi harian:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat data rekapitulasi harian",
      },
      { status: 500 }
    );
  }
}

function formatTimeSeriesData(rows: TimeSeriesRow[]) {
  const now = new Date();
  const series: { tanggal: string; jumlah_kegiatan: number }[] = [];
  const dataMap = new Map<string, number>();

  rows.forEach((row) => {
    dataMap.set(row.tanggal, row.jumlah_kegiatan);
  });

  // Generate last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    series.push({
      tanggal: dateStr,
      jumlah_kegiatan: dataMap.get(dateStr) ?? 0,
    });
  }

  return series;
}

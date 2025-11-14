// app/api/statistik/bulanan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/helpers/auth-helper";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

type MetricsData = {
  total_kegiatan: number;
  total_durasi_menit: number;
  rata_rata_kegiatan_per_hari: number;
  total_diverifikasi: number;
  total_pending: number;
  total_ditolak: number;
  persentase_verifikasi: number;
  rata_rata_rating: number;
  total_revisi: number;
};

type TimeSeriesItem = {
  tahun: number;
  bulan: number;
  bulan_nama: string;
  total_kegiatan: number;
};

type SkpdItem = {
  skpdid: number;
  skpd: string;
};

type PegawaiItem = {
  pegawai_id: number;
  pegawai_nama: string;
};

type BulanItem = {
  value: number;
  label: string;
};

type TahunItem = {
  value: number;
  label: string;
};

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const skpdid = searchParams.get("skpdid");
    const pegawai_id = searchParams.get("pegawai_id");
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");

    // Check if user is admin (level 3)
    const isAdmin = user.level >= 3;

    // Build WHERE clause
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    if (!isAdmin) {
      // Non-admin can only see their own data
      if (!user.pegawai_id) {
        return NextResponse.json(
          { success: false, message: "Pegawai ID not found in session" },
          { status: 400 }
        );
      }
      whereConditions.push("rb.pegawai_id = ?");
      queryParams.push(user.pegawai_id);
    } else {
      // Admin filters
      if (skpdid) {
        whereConditions.push("pc.skpdid = ?");
        queryParams.push(skpdid);
      }
      if (pegawai_id) {
        whereConditions.push("rb.pegawai_id = ?");
        queryParams.push(pegawai_id);
      }
    }

    if (bulan) {
      whereConditions.push("rb.bulan = ?");
      queryParams.push(bulan);
    }

    if (tahun) {
      whereConditions.push("rb.tahun = ?");
      queryParams.push(tahun);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get metrics summary
    const metricsQuery = `
      SELECT 
        COALESCE(SUM(rb.total_kegiatan), 0) as total_kegiatan,
        COALESCE(SUM(rb.total_durasi_menit), 0) as total_durasi_menit,
        COALESCE(AVG(rb.rata_rata_kegiatan_per_hari), 0) as rata_rata_kegiatan_per_hari,
        COALESCE(SUM(rb.total_diverifikasi), 0) as total_diverifikasi,
        COALESCE(SUM(rb.total_pending), 0) as total_pending,
        COALESCE(SUM(rb.total_ditolak), 0) as total_ditolak,
        COALESCE(AVG(rb.persentase_verifikasi), 0) as persentase_verifikasi,
        COALESCE(AVG(rb.rata_rata_rating), 0) as rata_rata_rating,
        COALESCE(SUM(rb.total_revisi), 0) as total_revisi
      FROM rekap_bulanan rb
      LEFT JOIN pegawai_cache pc ON rb.pegawai_id = pc.pegawai_id
      ${whereClause}
    `;

    const [metricsRows] = await pool.query<RowDataPacket[]>(
      metricsQuery,
      queryParams
    );

    const metrics: MetricsData = metricsRows[0] as MetricsData;

    // Get time series data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const timeSeriesQuery = `
      SELECT 
        rb.tahun,
        rb.bulan,
        SUM(rb.total_kegiatan) as total_kegiatan
      FROM rekap_bulanan rb
      LEFT JOIN pegawai_cache pc ON rb.pegawai_id = pc.pegawai_id
      ${whereClause}
      ${whereConditions.length > 0 ? "AND" : "WHERE"} (
        (rb.tahun = ? AND rb.bulan >= ?) OR
        (rb.tahun > ?)
      )
      GROUP BY rb.tahun, rb.bulan
      ORDER BY rb.tahun ASC, rb.bulan ASC
      LIMIT 6
    `;

    const timeSeriesParams = [
      ...queryParams,
      sixMonthsAgo.getFullYear(),
      sixMonthsAgo.getMonth() + 1,
      sixMonthsAgo.getFullYear(),
    ];

    const [timeSeriesRows] = await pool.query<RowDataPacket[]>(
      timeSeriesQuery,
      timeSeriesParams
    );

    const namaBulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const timeSeries: TimeSeriesItem[] = timeSeriesRows.map((row) => ({
      tahun: row.tahun,
      bulan: row.bulan,
      bulan_nama: `${namaBulan[row.bulan - 1]} ${row.tahun}`,
      total_kegiatan: row.total_kegiatan,
    }));

    // Get filter options (only for admin)
    let filters = {
      skpdList: [] as SkpdItem[],
      pegawaiList: [] as PegawaiItem[],
      bulanList: [] as BulanItem[],
      tahunList: [] as TahunItem[],
    };

    if (isAdmin) {
      // Get SKPD list
      const [skpdRows] = await pool.query<RowDataPacket[]>(
        "SELECT DISTINCT skpdid, skpd FROM pegawai_cache WHERE skpdid IS NOT NULL ORDER BY skpd"
      );
      filters.skpdList = skpdRows as SkpdItem[];

      // Get Pegawai list (filtered by SKPD if selected)
      let pegawaiQuery = `
        SELECT DISTINCT pc.pegawai_id, pc.pegawai_nama 
        FROM pegawai_cache pc
        INNER JOIN rekap_bulanan rb ON pc.pegawai_id = rb.pegawai_id
      `;
      let pegawaiParams: any[] = [];

      if (skpdid) {
        pegawaiQuery += " WHERE pc.skpdid = ?";
        pegawaiParams.push(skpdid);
      }

      pegawaiQuery += " ORDER BY pc.pegawai_nama";

      const [pegawaiRows] = await pool.query<RowDataPacket[]>(
        pegawaiQuery,
        pegawaiParams
      );
      filters.pegawaiList = pegawaiRows as PegawaiItem[];

      // Bulan list
      filters.bulanList = namaBulan.map((nama, index) => ({
        value: index + 1,
        label: nama,
      }));

      // Get available years from data
      const [tahunRows] = await pool.query<RowDataPacket[]>(
        "SELECT DISTINCT tahun FROM rekap_bulanan ORDER BY tahun DESC"
      );
      filters.tahunList = tahunRows.map((row) => ({
        value: row.tahun,
        label: row.tahun.toString(),
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        timeSeries,
        filters,
        isAdmin,
      },
    });
  } catch (error) {
    console.error("Error fetching monthly statistics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memuat data statistik bulanan",
      },
      { status: 500 }
    );
  }
}

// app/page.tsx
import { executeQuery } from "@/lib/helpers/db-helpers";
import { PublicLanding } from "@/components/layout/PublicLanding";
import { generatePageMetadata } from "@/lib/helpers/metadata-helper";

export async function generateMetadata() {
  return generatePageMetadata({
    path: "/",
  });
}

type SkpdItem = {
  id: number;
  nama: string;
  singkatan?: string;
  totalPegawai: number;
};

type RecentActivity = {
  laporanId: number;
  namaPegawai: string;
  skpd: string;
  namaKegiatan: string;
  tanggalKegiatan: string; // sudah diformat untuk tampilan
  waktu: string; // sudah diformat untuk tampilan (mis: 09.00 WIT)
};

type PublicOverview = {
  totalSkpd: number;
  totalPegawai: number;
  skpd: SkpdItem[];
  recentActivities: RecentActivity[];
};

// Opsional: mapping singkatan SKPD
const SKPD_ALIAS_BY_ID: Record<number, string> = {
  1: "Kominfo",
  11: "PUPR",
  34: "Disdukcapil",
  35: "Perpust. & Arsip",
  // tambahkan sesuai kebutuhan
};

// Helper format tanggal ke bahasa Indonesia
function formatTanggalIndo(dateStr: string): string {
  // dateStr: '2025-11-17'
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Helper format waktu (HH:MM:SS => 09.00 WIT)
function formatWaktuWIT(timeStr: string | null | undefined): string {
  if (!timeStr) return "-";
  // asumsi timeStr = '09:00:00'
  const hhmm = timeStr.slice(0, 5); // '09:00'
  return hhmm.replace(":", ".") + " WIT";
}

async function getPublicOverview(): Promise<PublicOverview> {
  // Query SKPD agregat + aktivitas terkini secara paralel
  const [skpdRows, activityRows] = await Promise.all([
    executeQuery<any>(
      `
      SELECT
        skpdid,
        skpd,
        COUNT(*) AS totalPegawai
      FROM pegawai_cache
      WHERE pegawai_status = 1
        AND skpdid IS NOT NULL
        AND skpd IS NOT NULL
      GROUP BY skpdid, skpd
      ORDER BY skpd ASC
      `
    ),
    executeQuery<any>(
      `
      SELECT
        lk.laporan_id,
        lk.nama_kegiatan,
        lk.tanggal_kegiatan,
        lk.waktu_mulai,
        pc.pegawai_nama,
        pc.skpd
      FROM laporan_kegiatan lk
      JOIN pegawai_cache pc ON pc.pegawai_id = lk.pegawai_id
      WHERE lk.status_laporan IN ('Diajukan','Diverifikasi')
      ORDER BY lk.tanggal_kegiatan DESC, lk.waktu_mulai DESC
      LIMIT 3
      `
    ),
  ]);

  // SKPD list
  const skpdList: SkpdItem[] = skpdRows.map((row: any) => {
    const id = Number(row.skpdid);
    const nama = row.skpd as string;
    const totalPegawai = Number(row.totalPegawai);

    return {
      id,
      nama,
      totalPegawai,
      singkatan: SKPD_ALIAS_BY_ID[id],
    };
  });

  const totalSkpd = skpdList.length;
  const totalPegawai = skpdList.reduce(
    (sum, item) => sum + item.totalPegawai,
    0
  );

  // Recent activities
  const recentActivities: RecentActivity[] = activityRows.map((row: any) => ({
    laporanId: Number(row.laporan_id),
    namaPegawai: row.pegawai_nama as string,
    skpd: (row.skpd as string) ?? "-",
    namaKegiatan: row.nama_kegiatan as string,
    tanggalKegiatan: formatTanggalIndo(String(row.tanggal_kegiatan)),
    waktu: formatWaktuWIT(row.waktu_mulai as string),
  }));

  return {
    totalSkpd,
    totalPegawai,
    skpd: skpdList,
    recentActivities,
  };
}

export default async function HomePage() {
  const overview = await getPublicOverview();

  return <PublicLanding overview={overview} />;
}

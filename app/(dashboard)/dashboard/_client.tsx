// app/(dashboard)/dashboard/_client.tsx
"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle,
  FileText,
  LucideIcon,
  RefreshCw,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRouter } from "next/navigation";

type Props = {
  userEmail?: string;
};

type MonthlySeriesItem = {
  month: string;
  total: number;
};

type DashboardData = {
  totals: {
    diajukan: number;
    diverifikasi: number;
    revisi: number;
    pegawai: number;
  };
  kegiatanByMonth: MonthlySeriesItem[];
  pegawaiByMonth: MonthlySeriesItem[];
  latestLaporan: {
    laporan_id: number;
    nama_kegiatan: string;
    status_laporan: string;
    pegawai_nama: string | null;
    created_at: string | null;
  }[];
};

type DashboardResponse = {
  success: boolean;
  data?: DashboardData;
  message?: string;
};

type AppSettings = {
  nama_aplikasi: string;
  alias_aplikasi: string;
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  Diverifikasi: "bg-green-100 text-green-800",
  Diajukan: "bg-blue-100 text-blue-800",
  Revisi: "bg-yellow-100 text-yellow-800",
  Draft: "bg-gray-100 text-gray-800",
  Ditolak: "bg-red-100 text-red-800",
};

const generateEmptySeries = (): MonthlySeriesItem[] => {
  const now = new Date();
  return Array.from({ length: 6 }).map((_, index) => {
    const offset = 5 - index;
    const current = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return {
      month: current.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      }),
      total: 0,
    };
  });
};

const defaultStats: DashboardData = {
  totals: {
    diajukan: 0,
    diverifikasi: 0,
    revisi: 0,
    pegawai: 0,
  },
  kegiatanByMonth: generateEmptySeries(),
  pegawaiByMonth: generateEmptySeries(),
  latestLaporan: [],
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value ?? 0);

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  description,
  isLoading,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  description: string;
  isLoading: boolean;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm dark:text-gray-300 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
          {isLoading ? "-" : value}
        </h3>
        <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <div
        className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default function DashboardClient({ userEmail }: Props) {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [stats, setStats] = useState<DashboardData>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const router = useRouter();

  // Load user from localStorage
  useEffect(() => {
    if (!userEmail) {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      }
    }
  }, [userEmail]);

  // Fetch app settings untuk ditampilkan di UI (optional)
  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        const response = await fetch("/api/settings/app");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAppSettings({
              nama_aplikasi: data.data.nama_aplikasi,
              alias_aplikasi: data.data.alias_aplikasi,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch app settings:", err);
        // Tidak perlu set error karena ini optional
      }
    };

    fetchAppSettings();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Gagal memuat data dashboard");
        }

        const payload: DashboardResponse = await response.json();

        if (!payload.success || !payload.data) {
          throw new Error(payload.message || "Data dashboard tidak tersedia");
        }

        setStats(payload.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat data dashboard"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const displayEmail = userEmail || user?.email || "email@domain.com";
  const latestLaporan = stats.latestLaporan;
  const appName = appSettings?.alias_aplikasi || "IZAKOD-ASN";

  return (
    <DashboardLayout userEmail={displayEmail}>
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
          Selamat Datang Kembali! 👋
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mt-1">
          Berikut adalah ringkasan aktivitas {appName} hari ini
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Kegiatan Diajukan"
          value={formatNumber(stats.totals.diajukan)}
          icon={FileText}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          description="Jumlah laporan kegiatan dengan status Diajukan."
          isLoading={isLoading}
        />
        <StatCard
          title="Kegiatan Diverifikasi"
          value={formatNumber(stats.totals.diverifikasi)}
          icon={CheckCircle}
          color="bg-gradient-to-br from-green-500 to-green-600"
          description="Laporan kegiatan yang telah diverifikasi."
          isLoading={isLoading}
        />
        <StatCard
          title="Kegiatan Revisi"
          value={formatNumber(stats.totals.revisi)}
          icon={RefreshCw}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          description="Laporan kegiatan yang membutuhkan revisi."
          isLoading={isLoading}
        />
        <StatCard
          title="Total Pegawai"
          value={formatNumber(stats.totals.pegawai)}
          icon={Users}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          description="Total pegawai yang terdaftar pada sistem."
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Kegiatan 6 Bulan Terakhir
              </h3>
              <p className="text-sm dark:text-gray-400">6 bulan terakhir</p>
            </div>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Lihat Detail
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.kegiatanByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Pegawai 6 Bulan Terakhir
              </h3>
              <p className="text-sm dark:text-gray-400">6 bulan terakhir</p>
            </div>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Lihat Detail
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.pegawaiByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="total" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Laporan Kegiatan Terbaru
            </h3>
            <p className="text-sm dark:text-gray-400">
              Daftar 10 laporan kegiatan yang terakhir dibuat
            </p>
          </div>
          <button
            onClick={() => router.push("/laporan-kegiatan")}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Lihat Semua
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 uppercase">
                  Nama Kegiatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 uppercase">
                  Nama Pegawai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 uppercase">
                  Dibuat Pada
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {latestLaporan.map((laporan, index) => (
                <tr
                  key={laporan.laporan_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm dark:text-gray-300">
                    {laporan.nama_kegiatan}
                  </td>
                  <td className="px-6 py-4 text-sm dark:text-gray-300">
                    {laporan.pegawai_nama ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        STATUS_BADGE_STYLES[laporan.status_laporan] ||
                        "bg-slate-100 text-slate-800"
                      }`}>
                      {laporan.status_laporan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm dark:text-gray-400">
                    {formatDate(laporan.created_at)}
                  </td>
                </tr>
              ))}
              {latestLaporan.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Belum ada data laporan kegiatan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

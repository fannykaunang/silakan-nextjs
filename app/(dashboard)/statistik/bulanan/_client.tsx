// app/(dashboard)/statistik/bulanan/_client.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle,
  Clock,
  XCircle,
  FileCheck,
  TrendingUp,
  Calendar,
  Activity,
  Star,
  RotateCcw,
  LucideIcon,
} from "lucide-react";

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

type RekapBulananData = {
  metrics: MetricsData;
  timeSeries: TimeSeriesItem[];
  filters: {
    skpdList: SkpdItem[];
    pegawaiList: PegawaiItem[];
    bulanList: BulanItem[];
    tahunList: TahunItem[];
  };
  isAdmin: boolean;
};

type RekapBulananResponse = {
  success: boolean;
  data?: RekapBulananData;
  message?: string;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value ?? 0);

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}j ${mins}m`;
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
        {isLoading ? (
          <div className="mt-2 space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-32"></div>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
              {value}
            </h3>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </>
        )}
      </div>
      <div
        className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default function RekapBulananClient() {
  const [data, setData] = useState<RekapBulananData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedSkpd, setSelectedSkpd] = useState<string>("");
  const [selectedPegawai, setSelectedPegawai] = useState<string>("");
  const [selectedBulan, setSelectedBulan] = useState<string>("");
  const [selectedTahun, setSelectedTahun] = useState<string>("");

  useEffect(() => {
    const fetchRekapBulanan = async () => {
      try {
        setIsLoading(true);

        // Build query params
        const params = new URLSearchParams();
        if (selectedSkpd) params.append("skpdid", selectedSkpd);
        if (selectedPegawai) params.append("pegawai_id", selectedPegawai);
        if (selectedBulan) params.append("bulan", selectedBulan);
        if (selectedTahun) params.append("tahun", selectedTahun);

        const url = `/api/statistik/bulanan${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Gagal memuat data statistik bulanan");
        }

        const payload: RekapBulananResponse = await response.json();

        if (!payload.success || !payload.data) {
          throw new Error(
            payload.message || "Data statistik bulanan tidak tersedia"
          );
        }

        setData(payload.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat data statistik bulanan"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRekapBulanan();
  }, [selectedSkpd, selectedPegawai, selectedBulan, selectedTahun]);

  const metrics = data?.metrics;
  const timeSeries = data?.timeSeries ?? [];
  const isAdmin = data?.isAdmin ?? false;

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Memuat Data...
          </p>
        </div>
      </div>
    );
  }

  // Error State (when no data)
  if (error && !data) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <svg
            className="w-12 h-12 text-red-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
            Statistik Bulanan
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mt-1">
            Ringkasan data statistik kegiatan bulanan
          </p>
        </div>

        {/* Admin Filters */}
        {isAdmin && data && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Filter Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* SKPD Filter */}
              <div>
                <label
                  htmlFor="skpd-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKPD
                </label>
                <select
                  id="skpd-filter"
                  value={selectedSkpd}
                  onChange={(e) => {
                    setSelectedSkpd(e.target.value);
                    setSelectedPegawai(""); // Reset pegawai filter
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="">Semua SKPD</option>
                  {data.filters.skpdList.map((skpd, index) => (
                    <option
                      key={`skpd-${skpd.skpdid}-${index}`}
                      value={skpd.skpdid}>
                      {skpd.skpd}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pegawai Filter */}
              <div>
                <label
                  htmlFor="pegawai-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pegawai
                </label>
                <select
                  id="pegawai-filter"
                  value={selectedPegawai}
                  onChange={(e) => setSelectedPegawai(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  disabled={isLoading}>
                  <option value="">Semua Pegawai</option>
                  {data.filters.pegawaiList.map((pegawai, index) => (
                    <option
                      key={`pegawai-${pegawai.pegawai_id}-${index}`}
                      value={pegawai.pegawai_id}>
                      {pegawai.pegawai_nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulan Filter */}
              <div>
                <label
                  htmlFor="bulan-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bulan
                </label>
                <select
                  id="bulan-filter"
                  value={selectedBulan}
                  onChange={(e) => setSelectedBulan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}>
                  <option value="">Semua Bulan</option>
                  {data.filters.bulanList.map((bulan, index) => (
                    <option
                      key={`bulan-${bulan.value}-${index}`}
                      value={bulan.value}>
                      {bulan.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Filter */}
              <div>
                <label
                  htmlFor="tahun-filter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tahun
                </label>
                <select
                  id="tahun-filter"
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}>
                  <option value="">Semua Tahun</option>
                  {data.filters.tahunList.map((tahun, index) => (
                    <option
                      key={`tahun-${tahun.value}-${index}`}
                      value={tahun.value}>
                      {tahun.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats Grid - Baris 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="Total Kegiatan"
            value={formatNumber(metrics?.total_kegiatan ?? 0)}
            icon={Activity}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            description="Total kegiatan bulanan"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Durasi"
            value={formatDuration(metrics?.total_durasi_menit ?? 0)}
            icon={Clock}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            description="Total durasi kegiatan"
            isLoading={isLoading}
          />
          <StatCard
            title="Rata-rata Per Hari"
            value={`${Number(metrics?.rata_rata_kegiatan_per_hari ?? 0).toFixed(
              2
            )}`}
            icon={Calendar}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            description="Kegiatan rata-rata per hari"
            isLoading={isLoading}
          />
        </div>

        {/* Stats Grid - Baris 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="Diverifikasi"
            value={formatNumber(metrics?.total_diverifikasi ?? 0)}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-green-600"
            description="Total kegiatan diverifikasi"
            isLoading={isLoading}
          />
          <StatCard
            title="Pending"
            value={formatNumber(metrics?.total_pending ?? 0)}
            icon={Clock}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            description="Total kegiatan pending"
            isLoading={isLoading}
          />
          <StatCard
            title="Ditolak"
            value={formatNumber(metrics?.total_ditolak ?? 0)}
            icon={XCircle}
            color="bg-gradient-to-br from-red-500 to-red-600"
            description="Total kegiatan ditolak"
            isLoading={isLoading}
          />
        </div>

        {/* Stats Grid - Baris 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Persentase Verifikasi"
            value={`${Number(metrics?.persentase_verifikasi ?? 0).toFixed(2)}%`}
            icon={TrendingUp}
            color="bg-gradient-to-br from-teal-500 to-teal-600"
            description="Persentase kegiatan terverifikasi"
            isLoading={isLoading}
          />
          <StatCard
            title="Rata-rata Rating"
            value={`${Number(metrics?.rata_rata_rating ?? 0).toFixed(2)}`}
            icon={Star}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            description="Rating rata-rata kegiatan"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Revisi"
            value={formatNumber(metrics?.total_revisi ?? 0)}
            icon={RotateCcw}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            description="Total kegiatan direvisi"
            isLoading={isLoading}
          />
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Tren Total Kegiatan (6 Bulan Terakhir)
              </h3>
              <p className="text-sm dark:text-gray-400">
                Grafik total kegiatan berdasarkan bulan dan tahun
              </p>
            </div>
          </div>
          {isLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Memuat grafik...
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="bulan_nama"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: number) => [
                    `${value} kegiatan`,
                    "Total Kegiatan",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="total_kegiatan"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

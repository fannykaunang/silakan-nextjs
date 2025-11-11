// app/(dashboard)/rekapitulasi/harian/_client.tsx
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
  TrendingUp,
  XCircle,
  FileCheck,
  LucideIcon,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

type Props = { userEmail?: string };

type MetricsData = {
  jumlah_diverifikasi: number;
  jumlah_pending: number;
  jumlah_ditolak: number;
  avg_produktivitas: number;
  total_durasi: number;
};

type TimeSeriesItem = {
  tanggal: string;
  jumlah_kegiatan: number;
};

type SkpdItem = {
  skpdid: number;
  skpd: string;
};

type PegawaiItem = {
  pegawai_id: number;
  pegawai_nama: string;
};

type RekapHarianData = {
  metrics: MetricsData;
  timeSeries: TimeSeriesItem[];
  filters: {
    skpdList: SkpdItem[];
    pegawaiList: PegawaiItem[];
  };
  isAdmin: boolean;
};

type RekapHarianResponse = {
  success: boolean;
  data?: RekapHarianData;
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

export default function RekapHarianClient({ userEmail }: Props) {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [data, setData] = useState<RekapHarianData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedSkpd, setSelectedSkpd] = useState<string>("");
  const [selectedPegawai, setSelectedPegawai] = useState<string>("");

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

  useEffect(() => {
    const fetchRekapHarian = async () => {
      try {
        setIsLoading(true);

        // Build query params
        const params = new URLSearchParams();
        if (selectedSkpd) params.append("skpdid", selectedSkpd);
        if (selectedPegawai) params.append("pegawai_id", selectedPegawai);

        const url = `/api/rekapitulasi/harian${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Gagal memuat data rekapitulasi harian");
        }

        const payload: RekapHarianResponse = await response.json();

        if (!payload.success || !payload.data) {
          throw new Error(
            payload.message || "Data rekapitulasi harian tidak tersedia"
          );
        }

        setData(payload.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat data rekapitulasi harian"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRekapHarian();
  }, [selectedSkpd, selectedPegawai]);

  const displayEmail = userEmail || user?.email || "email@domain.com";
  const metrics = data?.metrics;
  const timeSeries = data?.timeSeries ?? [];
  const isAdmin = data?.isAdmin ?? false;

  return (
    <DashboardLayout userEmail={displayEmail}>
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
          Rekapitulasi Harian 📊
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mt-1">
          Ringkasan data rekapitulasi kegiatan harian
        </p>
      </div>

      {/* Admin Filters */}
      {isAdmin && data && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Filter Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100">
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
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Diverifikasi"
          value={formatNumber(metrics?.jumlah_diverifikasi ?? 0)}
          icon={CheckCircle}
          color="bg-gradient-to-br from-green-500 to-green-600"
          description="Total kegiatan yang diverifikasi"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending"
          value={formatNumber(metrics?.jumlah_pending ?? 0)}
          icon={Clock}
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          description="Total kegiatan yang pending"
          isLoading={isLoading}
        />
        <StatCard
          title="Ditolak"
          value={formatNumber(metrics?.jumlah_ditolak ?? 0)}
          icon={XCircle}
          color="bg-gradient-to-br from-red-500 to-red-600"
          description="Total kegiatan yang ditolak"
          isLoading={isLoading}
        />
        <StatCard
          title="Rata-rata Produktivitas"
          value={`${(metrics?.avg_produktivitas ?? 0).toFixed(1)}%`}
          icon={TrendingUp}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          description="Persentase produktivitas rata-rata"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Durasi"
          value={formatDuration(metrics?.total_durasi ?? 0)}
          icon={FileCheck}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          description="Total durasi kegiatan"
          isLoading={isLoading}
        />
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Tren Jumlah Kegiatan (30 Hari Terakhir)
            </h3>
            <p className="text-sm dark:text-gray-400">
              Grafik jumlah kegiatan berdasarkan tanggal
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={timeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="tanggal"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                });
              }}
            />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              }}
              formatter={(value: number) => [
                `${value} kegiatan`,
                "Jumlah Kegiatan",
              ]}
            />
            <Line
              type="monotone"
              dataKey="jumlah_kegiatan"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useEffect, useState } from "react";
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
import { Home, Users, ShoppingCart, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

type Props = { userEmail?: string };

const salesData = [
  { month: "Jan", revenue: 4000, orders: 240 },
  { month: "Feb", revenue: 3000, orders: 198 },
  { month: "Mar", revenue: 5000, orders: 320 },
  { month: "Apr", revenue: 4500, orders: 278 },
  { month: "May", revenue: 6000, orders: 389 },
  { month: "Jun", revenue: 5500, orders: 349 },
];

const recentOrders = [
  {
    id: "#3452",
    customer: "Ahmad Rizki",
    amount: "Rp 2.450.000",
    status: "Selesai",
    date: "10 Okt 2025",
  },
  {
    id: "#3451",
    customer: "Siti Nurhaliza",
    amount: "Rp 1.230.000",
    status: "Proses",
    date: "10 Okt 2025",
  },
  {
    id: "#3450",
    customer: "Budi Santoso",
    amount: "Rp 3.890.000",
    status: "Selesai",
    date: "9 Okt 2025",
  },
  {
    id: "#3449",
    customer: "Dewi Lestari",
    amount: "Rp 890.000",
    status: "Pending",
    date: "9 Okt 2025",
  },
];

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm dark:text-gray-300 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
          {value}
        </h3>
        <p
          className={`text-sm mt-2 ${
            change >= 0 ? "text-green-600" : "text-red-600"
          }`}>
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% dari bulan lalu
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

  const displayEmail = userEmail || user?.email || "email@domain.com";

  return (
    <DashboardLayout userEmail={displayEmail}>
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
          Selamat Datang Kembali! 👋
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mt-1">
          Berikut adalah ringkasan bisnis Anda hari ini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Pendapatan"
          value="Rp 45.2M"
          change={12.5}
          icon={BarChart3}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Pesanan"
          value="1,845"
          change={8.2}
          icon={ShoppingCart}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Pelanggan Baru"
          value="342"
          change={-3.1}
          icon={Users}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Produk Terjual"
          value="3,248"
          change={15.3}
          icon={Home}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Pendapatan
              </h3>
              <p className="text-sm dark:text-gray-400">6 bulan terakhir</p>
            </div>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Lihat Detail
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
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
                Pesanan
              </h3>
              <p className="text-sm dark:text-gray-400">6 bulan terakhir</p>
            </div>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Lihat Detail
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Pesanan Terbaru
            </h3>
            <p className="text-sm dark:text-gray-400">
              Daftar pesanan terbaru dari pelanggan
            </p>
          </div>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Lihat Semua
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  ID Pesanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 uppercase">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 uppercase">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 uppercase">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentOrders.map((order, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm dark:text-gray-300">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === "Selesai"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Proses"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm dark:text-gray-400">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

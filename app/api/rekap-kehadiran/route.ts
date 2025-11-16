// app/api/rekap-kehadiran/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/helpers/auth-helper";

const API_BASE_URL = "https://dev.api.eabsen.merauke.go.id/api";
const API_KEY = process.env.EABSEN_API_KEY || "api_key";

interface RekapKehadiranResponse {
  pegawai_id: number;
  pegawai_pin: string;
  pegawai_nama: string;
  jumlah_kehadiran: number;
  jumlah_izin: number;
  jumlah_sakit: number;
  jumlah_hari_kerja: number;
  jumlah_alpa: number;
}

export async function GET(req: Request) {
  try {
    // Autentikasi
    await requireAuth();

    // Parse query params
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");

    // Validasi
    if (!pin || !bulan || !tahun) {
      return NextResponse.json(
        { error: "Parameter pin, bulan, dan tahun harus diisi" },
        { status: 400 }
      );
    }

    // Fetch dari API eAbsen
    const response = await fetch(
      `${API_BASE_URL}/rekap/kehadiran?pin=${pin}&bulan=${bulan}&tahun=${tahun}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          EabsenApiKey: API_KEY,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch rekap kehadiran: ${response.status}`);
      return NextResponse.json(
        { error: "Gagal mengambil data kehadiran" },
        { status: response.status }
      );
    }

    const data: RekapKehadiranResponse[] = await response.json();

    // Return data
    return NextResponse.json({
      success: true,
      data: data.length > 0 ? data[0] : null,
    });
  } catch (error: any) {
    console.error("Error fetching rekap kehadiran:", error);

    // Handle unauthorized error
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data kehadiran" },
      { status: 500 }
    );
  }
}

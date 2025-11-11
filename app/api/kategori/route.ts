// app/api/kategori/route.ts
import { NextResponse } from "next/server";
import {
  requireAdmin,
  requireAuth,
  getClientInfo,
  getUserFromCookie,
} from "@/lib/helpers/auth-helper";
import {
  getAllKategori,
  createKategori,
  getKategoriByKode,
} from "@/lib/models/kategori.model";
import { getPegawaiByPin } from "@/lib/models/pegawai.model";
import { createLog } from "@/lib/models/log.model";

// GET: Fetch semua kategori
export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const is_active = searchParams.get("is_active");

    console.log("📋 Fetching kategori kegiatan...");

    const filters: any = {};
    if (is_active !== null) {
      filters.is_active = parseInt(is_active);
    }

    const kategori = await getAllKategori(filters);

    console.log(`✅ Found ${kategori.length} kategori`);

    return NextResponse.json(
      {
        success: true,
        data: kategori,
        count: kategori.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error fetching kategori:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data kategori",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: Create kategori baru (Admin only)
export async function POST(req: Request) {
  try {
    // Require admin access
    await requireAdmin();

    const body = await req.json();
    const {
      kode_kategori,
      nama_kategori,
      deskripsi,
      warna,
      icon,
      is_active,
      urutan,
    } = body;

    // Validasi input
    if (!kode_kategori || !nama_kategori) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode kategori dan nama kategori wajib diisi",
        },
        { status: 400 }
      );
    }

    console.log("➕ Creating kategori:", nama_kategori);

    // Cek apakah kode sudah ada
    const existing = await getKategoriByKode(kode_kategori);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode kategori sudah digunakan",
        },
        { status: 409 }
      );
    }

    // Create kategori
    const kategoriId = await createKategori({
      kode_kategori,
      nama_kategori,
      deskripsi,
      warna,
      icon,
      is_active,
      urutan,
    });

    // Log aktivitas
    try {
      const user = await getUserFromCookie();
      if (user && user.pin) {
        const pegawaiData = await getPegawaiByPin(user.pin);
        const clientInfo = getClientInfo(req);

        await createLog({
          pegawai_id: pegawaiData?.pegawai_id || null,
          aksi: "Create",
          modul: "Kategori Kegiatan",
          detail_aksi: `Membuat kategori kegiatan: ${nama_kategori} (${kode_kategori})`,
          data_sebelum: null,
          data_sesudah: JSON.stringify({
            kategori_id: kategoriId,
            kode_kategori,
            nama_kategori,
            deskripsi,
            warna,
            icon,
            is_active,
            urutan,
          }),
          ip_address: clientInfo.ip_address,
          user_agent: clientInfo.user_agent,
          endpoint: "/api/kategori",
          method: "POST",
        });
      }
    } catch (logError) {
      console.error("⚠️ Failed to log activity:", logError);
    }

    console.log("✅ Kategori created with ID:", kategoriId);

    return NextResponse.json(
      {
        success: true,
        message: "Kategori berhasil ditambahkan",
        data: { kategori_id: kategoriId },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error creating kategori:", error);

    // Handle authentication errors
    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("login")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu",
        },
        { status: 401 }
      );
    }

    if (
      error.message?.includes("Forbidden") ||
      error.message?.includes("privilege")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya admin yang dapat menambah kategori",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambah kategori",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

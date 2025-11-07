// app/api/laporan/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/helpers/auth-helper";
import { getClientInfoWithEndpoint } from "@/lib/helpers/auth-helper";
import {
  getAllLaporan,
  createLaporan,
  CreateLaporanData,
} from "@/lib/models/laporan.model";
import { updateAllRekaps } from "@/lib/models/rekap.model";
import { createLogWithData } from "@/lib/models/log.model";
import {
  checkAttendanceToday,
  getTodayFormatted,
} from "@/lib/helpers/attendance-helper";

// GET - Mengambil semua laporan
export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    // Check if admin (level 3)
    const isAdmin = user.level === 3;

    // Get all laporan (filtered by pegawai_id if not admin)
    const laporanList = await getAllLaporan(
      isAdmin ? undefined : user.pegawai_id,
      isAdmin
    );

    return NextResponse.json(laporanList);
  } catch (error: any) {
    console.error("Error fetching laporan:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data laporan" },
      { status: 500 }
    );
  }
}

// POST - Membuat laporan baru
export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    // Get request body
    const body = await req.json();

    // Validasi input
    if (!body.tanggal_kegiatan) {
      return NextResponse.json(
        { error: "Tanggal kegiatan wajib diisi" },
        { status: 400 }
      );
    }

    if (!body.kategori_id) {
      return NextResponse.json(
        { error: "Kategori kegiatan wajib diisi" },
        { status: 400 }
      );
    }

    if (!body.nama_kegiatan || !body.nama_kegiatan.trim()) {
      return NextResponse.json(
        { error: "Nama kegiatan wajib diisi" },
        { status: 400 }
      );
    }

    if (!body.deskripsi_kegiatan || !body.deskripsi_kegiatan.trim()) {
      return NextResponse.json(
        { error: "Deskripsi kegiatan wajib diisi" },
        { status: 400 }
      );
    }

    if (!body.waktu_mulai || !body.waktu_selesai) {
      return NextResponse.json(
        { error: "Waktu mulai dan selesai wajib diisi" },
        { status: 400 }
      );
    }

    // Check if creating laporan for today
    //const today = getTodayFormatted();
    //const isToday = body.tanggal_kegiatan === today;

    const tanggalKegiatan: string = `${body.tanggal_kegiatan}`.trim(); // ekspektasi "YYYY-MM-DD"
    const attendanceCheck = await checkAttendanceToday(
      user.pin,
      tanggalKegiatan
    );

    // If creating for today, check attendance
    //if (isToday) {
    //const attendanceCheck = await checkAttendanceToday(user.pin, tanggalKegiatan);

    if (!attendanceCheck.success) {
      return NextResponse.json(
        {
          error:
            attendanceCheck.message ||
            "Anda belum absen pada tanggal yang dipilih!",
          requiresAttendance: true,
        },
        { status: 403 }
      );
    }
    //}

    // Prepare laporan data
    const laporanData: CreateLaporanData = {
      pegawai_id: user.pegawai_id!,
      tanggal_kegiatan: body.tanggal_kegiatan,
      kategori_id: parseInt(body.kategori_id),
      nama_kegiatan: body.nama_kegiatan.trim(),
      deskripsi_kegiatan: body.deskripsi_kegiatan.trim(),
      target_output: body.target_output?.trim() || null,
      hasil_output: body.hasil_output?.trim() || null,
      waktu_mulai: body.waktu_mulai,
      waktu_selesai: body.waktu_selesai,
      lokasi_kegiatan: body.lokasi_kegiatan?.trim() || null,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      peserta_kegiatan: body.peserta_kegiatan?.trim() || null,
      jumlah_peserta: parseInt(body.jumlah_peserta) || 0,
      link_referensi: body.link_referensi?.trim() || null,
      kendala: body.kendala?.trim() || null,
      solusi: body.solusi?.trim() || null,
      status_laporan: body.status_laporan || "Draft",
    };

    // Create laporan
    const laporanId = await createLaporan(laporanData);

    // Update rekap harian dan bulanan
    await updateAllRekaps(user.pegawai_id!, body.tanggal_kegiatan);

    // Log aktivitas
    const clientInfo = await getClientInfoWithEndpoint(
      req,
      "/api/laporan-kegiatan/tambah"
    );
    await createLogWithData({
      pegawai_id: user.pegawai_id!,
      aksi: "Create",
      modul: "Laporan Kegiatan",
      detail_aksi: `Membuat laporan kegiatan: ${body.nama_kegiatan}`,
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      endpoint: clientInfo.endpoint,
      method: clientInfo.method,
      data_sebelum: null,
      data_sesudah: { laporan_id: laporanId, ...laporanData },
    });

    return NextResponse.json({
      success: true,
      message: "Laporan kegiatan berhasil dibuat",
      laporan_id: laporanId,
    });
  } catch (error: any) {
    console.error("Error creating laporan:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat laporan kegiatan" },
      { status: 500 }
    );
  }
}

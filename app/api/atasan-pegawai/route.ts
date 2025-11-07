// app/api/atasan-pegawai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AtasanPegawaiModel } from "@/lib/models/atasan-pegawai.model";
import {
  requireAdmin,
  getClientInfoWithEndpoint,
  UserSession,
} from "@/lib/helpers/auth-helper";
import { CreateAtasanPegawaiInput } from "@/lib/types/atasan-pegawai.types";
import { createSimpleLog, createLogWithData } from "@/lib/models/log.model";
import { getPegawaiById } from "@/lib/models/pegawai.model";

const MODUL_NAME = "Atasan Pegawai";

/**
 * GET /api/atasan-pegawai
 * Get all atasan pegawai
 */
export async function GET(request: NextRequest) {
  let userSession: UserSession | null = null;
  const clientInfo = getClientInfoWithEndpoint(request);

  try {
    // Verifikasi autentikasi dan admin
    userSession = await requireAdmin();

    const data = await AtasanPegawaiModel.getAll();

    // Logika logging saat sukses "Read" Dihapus sesuai permintaan pengguna.
    // Hanya log yang berkaitan dengan Create, Update, dan Delete yang dipertahankan.

    return NextResponse.json({
      success: true,
      message: "Data atasan pegawai berhasil dimuat",
      data,
    });
  } catch (error: any) {
    console.error(
      `Error in ${clientInfo.method} ${clientInfo.endpoint}:`,
      error
    );

    // --- LOGGING ERROR ---
    try {
      await createSimpleLog({
        pegawai_id: userSession?.pegawai_id || 0, // 0 jika user tidak teridentifikasi
        aksi: "Error",
        modul: MODUL_NAME,
        detail_aksi: `Gagal melihat data: ${error.message}`,
        ...clientInfo,
      });
    } catch (logError) {
      console.error("Error log creation failed:", logError);
    }
    // --- END LOGGING ERROR ---

    // Handle authentication/authorization errors
    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    if (
      error?.message?.includes("Forbidden") ||
      error?.message?.includes("privilege")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak. Hanya admin yang dapat mengakses halaman ini.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal memuat data atasan pegawai",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/atasan-pegawai
 * Create new atasan pegawai
 */
export async function POST(request: NextRequest) {
  let userSession: UserSession | null = null;
  const clientInfo = getClientInfoWithEndpoint(request);
  let body: CreateAtasanPegawaiInput | null = null;

  try {
    // Verifikasi autentikasi dan admin
    userSession = await requireAdmin();

    body = await request.json();

    // --- PERBAIKAN: Tambahkan pengecekan null/empty body ---
    // Ini berfungsi sebagai type guard untuk TypeScript
    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: "Request body tidak boleh kosong.",
        },
        { status: 400 }
      );
    }
    // --- END PERBAIKAN ---

    // Validation
    if (
      !body.pegawai_id ||
      !body.atasan_id ||
      !body.jenis_atasan ||
      !body.tanggal_mulai
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pegawai, atasan, jenis atasan, dan tanggal mulai harus diisi",
        },
        { status: 400 }
      );
    }

    // Check if pegawai and atasan are the same
    if (body.pegawai_id === body.atasan_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Pegawai dan atasan tidak boleh sama",
        },
        { status: 400 }
      );
    }

    // Check for duplicate active relationship
    const isDuplicate = await AtasanPegawaiModel.checkDuplicate(
      body.pegawai_id,
      body.atasan_id
    );

    if (isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Hubungan atasan-pegawai yang aktif sudah ada",
        },
        { status: 400 }
      );
    }

    const id = await AtasanPegawaiModel.create(body);
    const atasan = await getPegawaiById(body.atasan_id);
    const atasanName = atasan?.pegawai_nama ?? String(body.atasan_id);
    const dataSesudah = {
      ...body,
      id,
      atasan_nama: atasan?.pegawai_nama ?? null,
    };

    // --- LOGGING ---
    try {
      await createLogWithData({
        pegawai_id: userSession.pegawai_id!,
        aksi: "Create",
        modul: MODUL_NAME,
        detail_aksi: `Membuat Atasan Pegawai ${atasanName}`,
        data_sebelum: null,
        data_sesudah: dataSesudah,
        ...clientInfo,
      });
    } catch (logError) {
      console.error("Log creation failed:", logError);
    }
    // --- END LOGGING ---

    return NextResponse.json({
      success: true,
      message: "Atasan pegawai berhasil ditambahkan",
      data: { id },
    });
  } catch (error: any) {
    console.error(
      `Error in ${clientInfo.method} ${clientInfo.endpoint}:`,
      error
    );

    // --- LOGGING ERROR ---
    try {
      await createLogWithData({
        pegawai_id: userSession?.pegawai_id || 0,
        aksi: "Error",
        modul: MODUL_NAME,
        detail_aksi: `Gagal membuat data: ${error.message}`,
        data_sebelum: null,
        data_sesudah: body, // Log data yang coba di-insert
        ...clientInfo,
      });
    } catch (logError) {
      console.error("Error log creation failed:", logError);
    }
    // --- END LOGGING ERROR ---

    // Handle authentication/authorization errors
    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    if (
      error?.message?.includes("Forbidden") ||
      error?.message?.includes("privilege")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak. Hanya admin yang dapat menambah data.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal menambah atasan pegawai",
      },
      { status: 500 }
    );
  }
}

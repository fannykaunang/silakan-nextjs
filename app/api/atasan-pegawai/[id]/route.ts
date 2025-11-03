// app/api/atasan-pegawai/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AtasanPegawaiModel } from "@/lib/models/atasan-pegawai.model";
import {
  requireAdmin,
  getClientInfoWithEndpoint,
  UserSession,
} from "@/lib/helpers/auth-helper";
import {
  UpdateAtasanPegawaiInput,
  AtasanPegawaiData,
} from "@/lib/types/atasan-pegawai.types";
import { createLogWithData } from "@/lib/models/log.model";
// Import model pegawai untuk mendapatkan nama pegawai dari pegawai_cache
import { getPegawaiById } from "@/lib/models/pegawai.model";

const MODUL_NAME = "Atasan Pegawai";

/**
 * PUT /api/atasan-pegawai/[id]
 * Update atasan pegawai by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userSession: UserSession | null = null;
  const clientInfo = getClientInfoWithEndpoint(request);
  let id: number | null = null;
  let existing: AtasanPegawaiData | null = null;
  let body: UpdateAtasanPegawaiInput | null = null;

  try {
    // Verifikasi autentikasi dan admin
    userSession = await requireAdmin();

    // Await params
    const resolvedParams = await params;
    id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 }
      );
    }

    // Check if exists (data_sebelum)
    existing = await AtasanPegawaiModel.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Atasan pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    body = await request.json();

    // --- PERBAIKAN: Tambahkan pengecekan null/empty body ---
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

    // Check if pegawai and atasan are the same
    if (
      body.pegawai_id &&
      body.atasan_id &&
      body.pegawai_id === body.atasan_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Pegawai dan atasan tidak boleh sama",
        },
        { status: 400 }
      );
    }

    // Check for duplicate if pegawai_id or atasan_id changed
    if (body.pegawai_id || body.atasan_id) {
      const pegawaiId = body.pegawai_id ?? existing.pegawai_id;
      const atasanId = body.atasan_id ?? existing.atasan_id;

      const isDuplicate = await AtasanPegawaiModel.checkDuplicate(
        pegawaiId,
        atasanId,
        id
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
    }

    const updated = await AtasanPegawaiModel.update(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Gagal mengubah atasan pegawai" },
        { status: 500 }
      );
    }

    // Tentukan ID pegawai yang relasinya diupdate
    const updatedPegawaiId = body.pegawai_id ?? existing.pegawai_id;

    // Ambil data pegawai dari cache untuk mendapatkan nama
    const pegawaiData = await getPegawaiById(updatedPegawaiId);
    // Gunakan nama pegawai jika ditemukan, jika tidak gunakan fallback
    const pegawaiName =
      pegawaiData?.pegawai_nama || `Pegawai ID ${updatedPegawaiId}`;

    // --- LOGGING ---
    try {
      await createLogWithData({
        pegawai_id: userSession.pegawai_id!,
        aksi: "Update",
        modul: MODUL_NAME,
        // DETAIL AKSI DIPERBARUI SESUAI PERMINTAAN PENGGUNA
        detail_aksi: `Memperbarui atasan langsung ${pegawaiName} dari pegawai_id ${updatedPegawaiId} di tabel pegawai_cache`,
        data_sebelum: existing, // Data lama
        data_sesudah: body, // Data perubahan
        ...clientInfo,
      });
    } catch (logError) {
      console.error("Log creation failed:", logError);
    }
    // --- END LOGGING ---

    return NextResponse.json({
      success: true,
      message: "Atasan pegawai berhasil diperbarui",
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
        detail_aksi: `Gagal memperbarui ID ${id || "unknown"}: ${
          error.message
        }`,
        data_sebelum: existing, // Data lama jika sudah diambil
        data_sesudah: body, // Data perubahan jika sudah diambil
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
          message: "Akses ditolak. Hanya admin yang dapat mengubah data.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal mengubah atasan pegawai",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/atasan-pegawai/[id]
 * Delete atasan pegawai by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userSession: UserSession | null = null;
  const clientInfo = getClientInfoWithEndpoint(request); // Ambil info klien
  let id: number | null = null;
  let existing: AtasanPegawaiData | null = null;

  try {
    // Verifikasi autentikasi dan admin
    userSession = await requireAdmin();

    // Await params
    const resolvedParams = await params;
    id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 }
      );
    }

    // Check if exists (data_sebelum)
    existing = await AtasanPegawaiModel.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Atasan pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    const deleted = await AtasanPegawaiModel.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus atasan pegawai" },
        { status: 500 }
      );
    }

    // Ambil nama pegawai yang relasinya dihapus
    const pegawaiData = await getPegawaiById(existing.pegawai_id);
    const pegawaiName =
      pegawaiData?.pegawai_nama || `Pegawai ID ${existing.pegawai_id}`;

    // --- LOGGING ---
    try {
      await createLogWithData({
        pegawai_id: userSession.pegawai_id!,
        aksi: "Delete",
        modul: MODUL_NAME,
        // DETAIL AKSI DIPERBARUI
        detail_aksi: `Menghapus relasi atasan langsung ${pegawaiName} dari pegawai_id ${existing.pegawai_id} di tabel pegawai_cache`,
        data_sebelum: existing, // Data yang dihapus
        data_sesudah: null,
        ...clientInfo,
      });
    } catch (logError) {
      console.error("Log creation failed:", logError);
    }
    // --- END LOGGING ---

    return NextResponse.json({
      success: true,
      message: "Atasan pegawai berhasil dihapus",
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
        detail_aksi: `Gagal menghapus ID ${id || "unknown"}: ${error.message}`,
        data_sebelum: existing, // Data yang gagal dihapus
        data_sesudah: null,
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
          message: "Akses ditolak. Hanya admin yang dapat menghapus data.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal menghapus atasan pegawai",
      },
      { status: 500 }
    );
  }
}

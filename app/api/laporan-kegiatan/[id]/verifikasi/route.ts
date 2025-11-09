// app/api/laporan-kegiatan/[id]/verifikasi/route.ts

import { NextResponse } from "next/server";
import {
  requireAuth,
  getClientInfoWithEndpoint,
} from "@/lib/helpers/auth-helper";
import { getLaporanById, verifikasiLaporan } from "@/lib/models/laporan.model";
import { AtasanPegawaiModel } from "@/lib/models/atasan-pegawai.model";
import {
  getRekapHarian,
  updateAllRekaps,
  updateRekapHarianCompletion,
} from "@/lib/models/rekap.model";
import type { RekapHarian } from "@/lib/models/rekap.model";
import { createLogWithData } from "@/lib/models/log.model";

const ALLOWED_STATUSES = ["Diverifikasi", "Revisi", "Ditolak"] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function normalizeRekap(rekap: RekapHarian | null) {
  if (!rekap) {
    return null;
  }

  return {
    ...rekap,
    is_complete: Boolean(rekap.is_complete),
  };
}

function buildStatusMessage(status: AllowedStatus) {
  switch (status) {
    case "Diverifikasi":
      return "Laporan berhasil diverifikasi";
    case "Revisi":
      return "Laporan dikembalikan untuk revisi";
    case "Ditolak":
      return "Laporan berhasil ditolak";
    default:
      return "Laporan berhasil diproses";
  }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (!user.pegawai_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pegawai tidak ditemukan dalam sesi",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const laporanId = Number(id);

    if (!laporanId || Number.isNaN(laporanId)) {
      return NextResponse.json(
        { success: false, message: "ID laporan tidak valid" },
        { status: 400 }
      );
    }

    const laporan = await getLaporanById(laporanId);

    if (!laporan) {
      return NextResponse.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (laporan.pegawai_id === user.pegawai_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak dapat memverifikasi laporan Anda sendiri",
        },
        { status: 403 }
      );
    }

    const isAdmin = user.level === 3;
    const today = new Date().toISOString().split("T")[0];
    const isSupervisor = await AtasanPegawaiModel.isSupervisorOf(
      user.pegawai_id,
      laporan.pegawai_id,
      today
    );

    if (!isSupervisor) {
      return NextResponse.json(
        {
          success: false,
          message: isAdmin
            ? "Halaman verifikasi hanya untuk atasan pegawai"
            : "Anda bukan atasan dari pegawai tersebut",
        },
        { status: 403 }
      );
    }

    const rekap = await getRekapHarian(
      laporan.pegawai_id,
      laporan.tanggal_kegiatan
    );

    return NextResponse.json({
      success: true,
      data: {
        laporan,
        rekapHarian: normalizeRekap(rekap),
      },
    });
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    console.error("Failed to load laporan verification data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data verifikasi",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (!user.pegawai_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pegawai tidak ditemukan dalam sesi",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const laporanId = Number(id);

    if (!laporanId || Number.isNaN(laporanId)) {
      return NextResponse.json(
        { success: false, message: "ID laporan tidak valid" },
        { status: 400 }
      );
    }

    const laporan = await getLaporanById(laporanId);

    if (!laporan) {
      return NextResponse.json(
        { success: false, message: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (laporan.pegawai_id === user.pegawai_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak dapat memverifikasi laporan Anda sendiri",
        },
        { status: 403 }
      );
    }

    const isAdmin = user.level === 3;
    const today = new Date().toISOString().split("T")[0];
    const isSupervisor = await AtasanPegawaiModel.isSupervisorOf(
      user.pegawai_id,
      laporan.pegawai_id,
      today
    );

    if (!isSupervisor) {
      return NextResponse.json(
        {
          success: false,
          message: isAdmin
            ? "Hanya atasan pegawai yang dapat memverifikasi laporan"
            : "Anda bukan atasan dari pegawai tersebut",
        },
        { status: 403 }
      );
    }

    const payload = await req.json();
    const status = (payload?.status_laporan ?? "") as AllowedStatus;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status verifikasi tidak valid" },
        { status: 400 }
      );
    }

    const rawCatatan =
      typeof payload?.catatan_verifikasi === "string"
        ? payload.catatan_verifikasi.trim()
        : undefined;
    const catatan = rawCatatan ? rawCatatan : null;

    let rating: number | null = null;
    if (
      payload?.rating_kualitas !== undefined &&
      payload.rating_kualitas !== null &&
      payload.rating_kualitas !== ""
    ) {
      rating = Number(payload.rating_kualitas);
      if (Number.isNaN(rating)) {
        return NextResponse.json(
          { success: false, message: "Rating kualitas tidak valid" },
          { status: 400 }
        );
      }

      if (rating < 0 || rating > 5) {
        return NextResponse.json(
          { success: false, message: "Rating kualitas harus 0-5" },
          { status: 400 }
        );
      }
    }

    const completeFlag =
      typeof payload?.is_complete === "boolean"
        ? payload.is_complete
        : undefined;

    const rekapBefore = await getRekapHarian(
      laporan.pegawai_id,
      laporan.tanggal_kegiatan
    );
    const normalizedBefore = normalizeRekap(rekapBefore);

    await verifikasiLaporan(laporanId, {
      status_laporan: status,
      verifikasi_oleh: user.pegawai_id,
      catatan_verifikasi: catatan,
      rating_kualitas: rating,
    });

    await updateAllRekaps(laporan.pegawai_id, laporan.tanggal_kegiatan);

    if (completeFlag !== undefined) {
      await updateRekapHarianCompletion(
        laporan.pegawai_id,
        laporan.tanggal_kegiatan,
        completeFlag
      );
    }

    const updatedLaporan = await getLaporanById(laporanId);
    const updatedRekap = await getRekapHarian(
      laporan.pegawai_id,
      laporan.tanggal_kegiatan
    );
    const normalizedAfter = normalizeRekap(updatedRekap);

    try {
      const clientInfo = getClientInfoWithEndpoint(
        req,
        `/api/laporan-kegiatan/${laporanId}/verifikasi`,
        "POST"
      );

      await createLogWithData({
        pegawai_id: user.pegawai_id,
        aksi: "Update",
        modul: "Laporan",
        detail_aksi: `Memverifikasi laporan ${laporan.nama_kegiatan} menjadi ${status}`,
        data_sebelum: {
          laporan,
          rekap_harian: normalizedBefore,
        },
        data_sesudah: {
          laporan: updatedLaporan,
          rekap_harian: normalizedAfter,
        },
        ...clientInfo,
      });
    } catch (logError) {
      console.error("Failed to log laporan verification:", logError);
    }

    return NextResponse.json({
      success: true,
      message: buildStatusMessage(status),
      data: {
        laporan: updatedLaporan,
        rekapHarian: normalizedAfter,
      },
    });
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    console.error("Failed to verify laporan:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat verifikasi laporan" },
      { status: 500 }
    );
  }
}

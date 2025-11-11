// app/api/laporan/[id]/route.ts
import { NextResponse } from "next/server";
import {
  requireAuth,
  getClientInfoWithEndpoint,
} from "@/lib/helpers/auth-helper";
import {
  getLaporanById,
  updateLaporan,
  deleteLaporan,
  canEditLaporan,
  UpdateLaporanData,
} from "@/lib/models/laporan.model";
import { updateAllRekaps } from "@/lib/models/rekap.model";
import { createLogWithData } from "@/lib/models/log.model";
import { AtasanPegawaiModel } from "@/lib/models/atasan-pegawai.model";
import {
  loadLaporanSettings,
  timeToMinutes,
  calculateDayDifference,
  getTodayDateString,
} from "@/lib/helpers/laporan-settings";

// GET - Mengambil detail laporan by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const laporanId = parseInt(id);

    if (isNaN(laporanId)) {
      return NextResponse.json(
        { error: "ID laporan tidak valid" },
        { status: 400 }
      );
    }

    // Get laporan
    const laporan = await getLaporanById(laporanId);

    if (!laporan) {
      return NextResponse.json(
        { error: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check authorization (only admin or owner can view)
    const isAdmin = user.level === 3;
    const isOwner = laporan.pegawai_id === user.pegawai_id;
    let isAtasan = false;

    if (!isAdmin && user.pegawai_id) {
      const today = new Date().toISOString().split("T")[0];
      const subordinateIds = await AtasanPegawaiModel.getActiveSubordinateIds(
        user.pegawai_id,
        today
      );

      isAtasan = subordinateIds.includes(laporan.pegawai_id);
    }

    if (!isAdmin && !isOwner && !isAtasan) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke laporan ini" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: laporan,
      canEdit: isAdmin || isOwner,
    });
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

// PUT - Update laporan
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const laporanId = parseInt(id);

    if (isNaN(laporanId)) {
      return NextResponse.json(
        { error: "ID laporan tidak valid" },
        { status: 400 }
      );
    }

    // Get existing laporan
    const oldData = await getLaporanById(laporanId);

    if (!oldData) {
      return NextResponse.json(
        { error: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check authorization (only admin or owner can edit)
    const isAdmin = user.level === 3;
    const isOwner = oldData.pegawai_id === user.pegawai_id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk mengubah laporan ini" },
        { status: 403 }
      );
    }

    // Check if laporan can be edited (status must be Draft/Diajukan/Revisi)
    const canEdit = await canEditLaporan(laporanId);
    if (!canEdit) {
      return NextResponse.json(
        {
          message:
            "Laporan tidak dapat diedit. Status harus Draft, Diajukan, atau Revisi.",
          status: oldData.status_laporan,
        },
        { status: 403 }
      );
    }

    // Parse body
    const body = await req.json();

    // Validasi input (jika ada)
    if (body.nama_kegiatan !== undefined && !body.nama_kegiatan.trim()) {
      return NextResponse.json(
        { error: "Nama kegiatan tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (
      body.deskripsi_kegiatan !== undefined &&
      !body.deskripsi_kegiatan.trim()
    ) {
      return NextResponse.json(
        { error: "Deskripsi kegiatan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const settings = await loadLaporanSettings();
    const nextTanggal =
      body.tanggal_kegiatan !== undefined
        ? body.tanggal_kegiatan
        : oldData.tanggal_kegiatan;
    const nextWaktuMulai =
      body.waktu_mulai !== undefined ? body.waktu_mulai : oldData.waktu_mulai;
    const nextWaktuSelesai =
      body.waktu_selesai !== undefined
        ? body.waktu_selesai
        : oldData.waktu_selesai;

    const shouldValidateTimes =
      body.waktu_mulai !== undefined ||
      body.waktu_selesai !== undefined ||
      (body.status_laporan === "Diajukan" &&
        oldData.status_laporan !== "Diajukan");

    if (shouldValidateTimes) {
      if (!nextWaktuMulai || !nextWaktuSelesai) {
        return NextResponse.json(
          { error: "Waktu mulai dan selesai wajib diisi" },
          { status: 400 }
        );
      }

      const startMinutes = timeToMinutes(nextWaktuMulai);
      const endMinutes = timeToMinutes(nextWaktuSelesai);

      if (startMinutes === null || endMinutes === null) {
        return NextResponse.json(
          { error: "Format waktu mulai dan selesai harus HH:MM" },
          { status: 400 }
        );
      }

      if (endMinutes <= startMinutes) {
        return NextResponse.json(
          { error: "Waktu selesai harus lebih besar dari waktu mulai" },
          { status: 400 }
        );
      }

      if (
        startMinutes < settings.workStartMinutes ||
        startMinutes > settings.workEndMinutes
      ) {
        return NextResponse.json(
          {
            error: `Waktu mulai harus berada antara ${settings.workStartLabel} dan ${settings.workEndLabel}`,
          },
          { status: 400 }
        );
      }

      if (
        endMinutes > settings.workEndMinutes ||
        endMinutes < settings.workStartMinutes
      ) {
        return NextResponse.json(
          {
            error: `Waktu selesai harus berada antara ${settings.workStartLabel} dan ${settings.workEndLabel}`,
          },
          { status: 400 }
        );
      }

      const durationMinutes = endMinutes - startMinutes;

      if (durationMinutes < settings.minDurasi) {
        return NextResponse.json(
          {
            error: `Durasi kegiatan minimal ${settings.minDurasi} menit`,
          },
          { status: 400 }
        );
      }

      if (durationMinutes > settings.maxDurasi) {
        return NextResponse.json(
          {
            error: `Durasi kegiatan maksimal ${settings.maxDurasi} menit`,
          },
          { status: 400 }
        );
      }
    }

    if (
      body.status_laporan === "Diajukan" &&
      oldData.status_laporan !== "Diajukan"
    ) {
      const todayDate = getTodayDateString();
      const diffDays = calculateDayDifference(nextTanggal, todayDate);

      if (diffDays === null) {
        return NextResponse.json(
          { error: "Tanggal kegiatan tidak valid" },
          { status: 400 }
        );
      }

      if (diffDays < 0) {
        return NextResponse.json(
          {
            error:
              "Tanggal kegiatan tidak boleh lebih besar dari tanggal hari ini",
          },
          { status: 400 }
        );
      }

      if (diffDays > settings.submissionDeadlineDays) {
        return NextResponse.json(
          {
            error: `Pengajuan laporan maksimal ${settings.submissionDeadlineDays} hari setelah tanggal kegiatan`,
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: UpdateLaporanData = {};

    if (body.tanggal_kegiatan !== undefined)
      updateData.tanggal_kegiatan = body.tanggal_kegiatan;
    if (body.kategori_id !== undefined)
      updateData.kategori_id = parseInt(body.kategori_id);
    if (body.nama_kegiatan !== undefined)
      updateData.nama_kegiatan = body.nama_kegiatan.trim();
    if (body.deskripsi_kegiatan !== undefined)
      updateData.deskripsi_kegiatan = body.deskripsi_kegiatan.trim();
    if (body.target_output !== undefined)
      updateData.target_output = body.target_output?.trim() || null;
    if (body.hasil_output !== undefined)
      updateData.hasil_output = body.hasil_output?.trim() || null;
    if (body.waktu_mulai !== undefined)
      updateData.waktu_mulai = body.waktu_mulai;
    if (body.waktu_selesai !== undefined)
      updateData.waktu_selesai = body.waktu_selesai;
    if (body.lokasi_kegiatan !== undefined)
      updateData.lokasi_kegiatan = body.lokasi_kegiatan?.trim() || null;
    if (body.latitude !== undefined)
      updateData.latitude = body.latitude ? parseFloat(body.latitude) : null;
    if (body.longitude !== undefined)
      updateData.longitude = body.longitude ? parseFloat(body.longitude) : null;
    if (body.peserta_kegiatan !== undefined)
      updateData.peserta_kegiatan = body.peserta_kegiatan?.trim() || null;
    if (body.jumlah_peserta !== undefined)
      updateData.jumlah_peserta = parseInt(body.jumlah_peserta);
    if (body.link_referensi !== undefined)
      updateData.link_referensi = body.link_referensi?.trim() || null;
    if (body.kendala !== undefined)
      updateData.kendala = body.kendala?.trim() || null;
    if (body.solusi !== undefined)
      updateData.solusi = body.solusi?.trim() || null;
    if (body.status_laporan !== undefined)
      updateData.status_laporan = body.status_laporan;

    // Update laporan
    await updateLaporan(laporanId, updateData);

    // Update rekap (use old or new tanggal_kegiatan)
    const tanggalForRekap =
      updateData.tanggal_kegiatan || oldData.tanggal_kegiatan;
    await updateAllRekaps(oldData.pegawai_id, tanggalForRekap);

    // If tanggal changed, also update old date rekap
    if (
      updateData.tanggal_kegiatan &&
      updateData.tanggal_kegiatan !== oldData.tanggal_kegiatan
    ) {
      await updateAllRekaps(oldData.pegawai_id, oldData.tanggal_kegiatan);
    }

    // Log aktivitas
    const clientInfo = await getClientInfoWithEndpoint(
      req,
      `/api/laporan/${id}`
    );
    await createLogWithData({
      pegawai_id: user.pegawai_id!,
      aksi: "Update",
      modul: "Laporan Kegiatan",
      detail_aksi: `Memperbarui laporan: ${
        updateData.nama_kegiatan || oldData.nama_kegiatan
      }`,
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      endpoint: clientInfo.endpoint,
      method: clientInfo.method,
      data_sebelum: oldData,
      data_sesudah: { ...oldData, ...updateData },
    });

    return NextResponse.json({
      success: true,
      message: "Laporan kegiatan berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Error updating laporan:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui laporan" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus laporan
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const laporanId = parseInt(id);

    if (isNaN(laporanId)) {
      return NextResponse.json(
        { error: "ID laporan tidak valid" },
        { status: 400 }
      );
    }

    // Get laporan
    const laporan = await getLaporanById(laporanId);

    if (!laporan) {
      return NextResponse.json(
        { error: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check authorization (only admin or owner can delete)
    const isAdmin = user.level === 3;
    const isOwner = laporan.pegawai_id === user.pegawai_id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk menghapus laporan ini" },
        { status: 403 }
      );
    }

    // Check if laporan can be deleted (status must be Draft/Diajukan/Revisi)
    const canEdit = await canEditLaporan(laporanId);
    if (!canEdit) {
      return NextResponse.json(
        {
          error:
            "Laporan tidak dapat dihapus. Status harus Draft, Diajukan, atau Revisi.",
          status: laporan.status_laporan,
        },
        { status: 403 }
      );
    }

    // Delete laporan
    await deleteLaporan(laporanId);

    // Update rekap after deletion
    await updateAllRekaps(laporan.pegawai_id, laporan.tanggal_kegiatan);

    // Log aktivitas
    const clientInfo = await getClientInfoWithEndpoint(
      req,
      `/api/laporan/${id}`
    );
    await createLogWithData({
      pegawai_id: user.pegawai_id!,
      aksi: "Delete",
      modul: "Laporan Kegiatan",
      detail_aksi: `Menghapus laporan: ${laporan.nama_kegiatan}`,
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      endpoint: clientInfo.endpoint,
      method: clientInfo.method,
      data_sebelum: laporan,
      data_sesudah: null,
    });

    return NextResponse.json({
      success: true,
      message: "Laporan kegiatan berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Error deleting laporan:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus laporan" },
      { status: 500 }
    );
  }
}

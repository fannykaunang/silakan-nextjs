// app/api/laporan-kegiatan/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/helpers/auth-helper";
import { getClientInfoWithEndpoint } from "@/lib/helpers/auth-helper";
import {
  getAllLaporan,
  createLaporan,
  CreateLaporanData,
  autoVerifyDueReports,
} from "@/lib/models/laporan.model";
import { updateAllRekaps } from "@/lib/models/rekap.model";
import { createLogWithData } from "@/lib/models/log.model";
import { checkAttendanceToday } from "@/lib/helpers/attendance-helper";
import { AtasanPegawaiModel } from "@/lib/models/atasan-pegawai.model";
import {
  loadLaporanSettings,
  timeToMinutes,
  calculateDayDifference,
  getTodayDateString,
} from "@/lib/helpers/laporan-settings";
import { createNotifikasi } from "@/lib/models/notifikasi.model";
import { getAtasanLangsungAktif } from "@/lib/models/atasan-pegawai.model";
import { getPegawaiById } from "@/lib/models/pegawai.model";
import { sendWhatsAppInBackground } from "@/lib/helpers/background-tasks";

// GET - Mengambil semua laporan
export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    const settings = await loadLaporanSettings();

    if (settings.autoVerificationEnabled) {
      const todayString = getTodayDateString();
      await autoVerifyDueReports(todayString);
    }

    // Check if admin (level 3)
    const isAdmin = user.level === 3;
    if (!isAdmin && !user.pegawai_id) {
      return NextResponse.json(
        { success: false, message: "Pegawai tidak ditemukan pada sesi aktif" },
        { status: 400 }
      );
    }

    const today = getTodayDateString();

    const accessiblePegawaiIds = new Set<number>();
    const supervisedPegawaiIds = new Set<number>();
    let isAtasan = false;

    if (user.pegawai_id) {
      accessiblePegawaiIds.add(user.pegawai_id);

      const subordinateIds = await AtasanPegawaiModel.getActiveSubordinateIds(
        user.pegawai_id,
        today
      );

      if (subordinateIds.length > 0) {
        isAtasan = true;
        subordinateIds.forEach((id) => {
          accessiblePegawaiIds.add(id);
          supervisedPegawaiIds.add(id);
        });
      }
    }

    const allowedPegawaiIds = isAdmin
      ? undefined
      : Array.from(accessiblePegawaiIds.values());

    const laporanList = await getAllLaporan(allowedPegawaiIds, isAdmin);

    return NextResponse.json({
      success: true,
      data: laporanList,
      meta: {
        isAdmin,
        isAtasan,
        manageablePegawaiIds: Array.from(accessiblePegawaiIds.values()),
        supervisedPegawaiIds: Array.from(supervisedPegawaiIds.values()),
      },
    });
  } catch (error: any) {
    console.error("Error fetching laporan:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please login" },
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
    const pegawaiId = user.pegawai_id;

    if (!pegawaiId) {
      return NextResponse.json(
        { success: false, message: "Pegawai tidak ditemukan" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await req.json();

    // ===== VALIDASI INPUT =====
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

    const settingsForValidation = await loadLaporanSettings();

    const startMinutes = timeToMinutes(body.waktu_mulai);
    const endMinutes = timeToMinutes(body.waktu_selesai);

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
      startMinutes < settingsForValidation.workStartMinutes ||
      startMinutes > settingsForValidation.workEndMinutes
    ) {
      return NextResponse.json(
        {
          error: `Waktu mulai harus berada antara ${settingsForValidation.workStartLabel} dan ${settingsForValidation.workEndLabel}`,
        },
        { status: 400 }
      );
    }

    if (
      endMinutes > settingsForValidation.workEndMinutes ||
      endMinutes < settingsForValidation.workStartMinutes
    ) {
      return NextResponse.json(
        {
          error: `Waktu selesai harus berada antara ${settingsForValidation.workStartLabel} dan ${settingsForValidation.workEndLabel}`,
        },
        { status: 400 }
      );
    }

    const durationMinutes = endMinutes - startMinutes;

    if (durationMinutes < settingsForValidation.minDurasi) {
      return NextResponse.json(
        {
          error: `Durasi kegiatan minimal ${settingsForValidation.minDurasi} menit`,
        },
        { status: 400 }
      );
    }

    if (durationMinutes > settingsForValidation.maxDurasi) {
      return NextResponse.json(
        {
          error: `Durasi kegiatan maksimal ${settingsForValidation.maxDurasi} menit`,
        },
        { status: 400 }
      );
    }

    const targetStatus = body.status_laporan || "Draft";

    if (targetStatus === "Diajukan") {
      const todayDate = getTodayDateString();
      const diffDays = calculateDayDifference(body.tanggal_kegiatan, todayDate);

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

      if (diffDays > settingsForValidation.submissionDeadlineDays) {
        return NextResponse.json(
          {
            error: `Pengajuan laporan maksimal ${settingsForValidation.submissionDeadlineDays} hari setelah tanggal kegiatan`,
          },
          { status: 400 }
        );
      }
    }

    const tanggalKegiatan = `${body.tanggal_kegiatan}`.trim();
    const attendanceCheck = await checkAttendanceToday(
      user.pin,
      tanggalKegiatan
    );

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

    // ===== PREPARE LAPORAN DATA =====
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
      status_laporan: targetStatus,
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

    // ===== NOTIFIKASI & WHATSAPP KE ATASAN (BACKGROUND TASK) =====
    if (targetStatus === "Diajukan") {
      try {
        console.log(`📤 Mengirim notifikasi untuk laporan ID: ${laporanId}`);

        // Ambil data pegawai pembuat laporan
        const pegawaiData = await getPegawaiById(user.pegawai_id!);

        if (!pegawaiData) {
          console.error("❌ Data pegawai tidak ditemukan");
        } else {
          // Ambil atasan langsung yang aktif
          const atasan = await getAtasanLangsungAktif(user.pegawai_id!);

          if (!atasan || !atasan.atasan_id) {
            console.log(
              `⚠️ Tidak ada atasan langsung aktif untuk pegawai ID: ${user.pegawai_id}`
            );
          } else {
            console.log(
              `👤 Atasan ditemukan: ${atasan.atasan_nama} (ID: ${atasan.atasan_id})`
            );

            // 1. Buat notifikasi untuk atasan (SINKRON)
            const notifikasiData = {
              pegawai_id: atasan.atasan_id,
              judul: "Laporan Kegiatan Baru Perlu Direview",
              pesan: `${pegawaiData.pegawai_nama} telah mengajukan laporan kegiatan: ${body.nama_kegiatan}`,
              tipe_notifikasi: "Info" as const,
              laporan_id: laporanId,
              link_tujuan: `/laporan-kegiatan/${laporanId}`,
              action_required: true,
            };

            await createNotifikasi(notifikasiData);
            console.log(
              `✅ Notifikasi berhasil dibuat untuk atasan ID: ${atasan.atasan_id}`
            );

            // 2. Kirim WhatsApp di background (NON-BLOCKING)
            if (atasan.atasan_no_hp) {
              // Format tanggal
              const formattedDate = new Date(
                body.tanggal_kegiatan
              ).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              // Buat pesan WhatsApp
              const whatsappMessage = `📋 *LAPORAN KEGIATAN BARU*

Anda memiliki laporan kegiatan baru yang perlu direview dari bawahan Anda.

👤 *Pegawai*
${pegawaiData.pegawai_nama}

📝 *Kegiatan*
${body.nama_kegiatan}
${body.kategori_nama ? `Kategori: ${body.kategori_nama}` : ""}

📅 *Tanggal Kegiatan*
${formattedDate}

⏰ *Waktu Pelaksanaan*
${body.waktu_mulai} - ${body.waktu_selesai} WIT

${body.lokasi_kegiatan ? `📍 *Lokasi*\n${body.lokasi_kegiatan}\n\n` : ""}${
                body.deskripsi_kegiatan.length > 150
                  ? `📄 *Deskripsi Singkat*\n${body.deskripsi_kegiatan.substring(
                      0,
                      150
                    )}...\n\n`
                  : `📄 *Deskripsi*\n${body.deskripsi_kegiatan}\n\n`
              }🔔 *Tindakan Diperlukan*
Silakan login ke sistem SILAKAN untuk mereview dan menyetujui laporan ini.

_ID Laporan: #${laporanId}_

_Pesan otomatis dari Sistem SILAKAN_`;

              // Kirim WhatsApp di background (tidak menunggu hasil)
              sendWhatsAppInBackground(
                atasan.atasan_no_hp,
                whatsappMessage,
                atasan.atasan_id
              );

              console.log(
                `📋 WhatsApp job queued for atasan: ${atasan.atasan_nama} (${atasan.atasan_no_hp})`
              );
            } else {
              console.log(
                `⚠️ Atasan ${atasan.atasan_nama} tidak memiliki nomor HP`
              );
            }
          }
        }
      } catch (notifError: any) {
        // Log error tapi jangan gagalkan request utama
        console.error(
          "❌ Error mengirim notifikasi/WhatsApp ke atasan:",
          notifError
        );
        // Tidak throw error karena laporan sudah berhasil dibuat
      }
    }

    // Return response segera tanpa menunggu WhatsApp
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

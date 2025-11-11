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
import {
  sendWhatsAppMessage,
  formatReminderMessage,
} from "@/lib/helpers/whatsapp-helper";
import { getPegawaiById } from "@/lib/models/pegawai.model";
import { createNotifikasi } from "@/lib/models/notifikasi.model";

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

/**
 * Kirim notifikasi WhatsApp untuk reminder
 */
async function sendReminderWhatsApp(
  reminder: any,
  scheduledAt: Date
): Promise<void> {
  try {
    const noHp = reminder.pegawai_telp;

    if (!noHp) {
      console.log(
        `Reminder ${reminder.reminder_id}: Tidak ada nomor WhatsApp untuk pegawai ${reminder.pegawai_nama}`
      );
      return;
    }

    const message = formatReminderMessage({
      title: reminder.judul_reminder,
      message: reminder.pesan_reminder,
      tipe: reminder.tipe_reminder,
      scheduledAt: scheduledAt.toISOString(),
      pegawaiName: reminder.pegawai_nama ?? undefined,
    });

    const result = await sendWhatsAppMessage({
      phone: noHp,
      message: message,
      duration: 3600,
    });

    if (result.success) {
      console.log(
        `✅ WhatsApp sent for reminder ${reminder.reminder_id} to ${noHp}`
      );
    } else {
      console.error(
        `❌ Failed to send WhatsApp for reminder ${reminder.reminder_id}:`,
        result.error
      );
    }
  } catch (error) {
    console.error(
      `Error sending WhatsApp for reminder ${reminder.reminder_id}:`,
      error
    );
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
          message: "Anda bukan atasan dari pegawai tersebut",
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
    const status_verifikasi = (payload?.status_laporan ?? "") as AllowedStatus;

    if (!ALLOWED_STATUSES.includes(status_verifikasi)) {
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
      status_laporan: status_verifikasi,
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

    // --- WhatsApp Integration ---
    // Kirim notifikasi WhatsApp setelah semua proses DB berhasil
    try {
      // 1. Ambil data pegawai pembuat laporan untuk dapatkan nomor HP
      const pegawaiAuthor = await getPegawaiById(laporan.pegawai_id);

      // 2. Periksa apakah data pegawai DAN nomor telepon ADA
      //    Ini adalah kunci untuk mengatasi error TypeScript.
      if (pegawaiAuthor && pegawaiAuthor.pegawai_telp) {
        // 3. Jika ada, buat pesan yang akan dikirim
        const waMessage = `Halo, ${
          pegawaiAuthor.pegawai_nama
        }!\n\nLaporan kegiatan Anda dengan detail:\n- Kegiatan: ${
          laporan.nama_kegiatan
        }\n- Tanggal: ${new Date(laporan.tanggal_kegiatan).toLocaleString(
          "id-ID",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit", // TAMBAHKAN INI
            minute: "2-digit", // TAMBAHKAN INI
            hour12: false, // TAMBAHKAN INI (gunakan format 24 jam, contoh: 14:30)
          }
        )}
        )}\n\nTelah diverifikasi oleh ${
          user.nama
        } dengan status: *${status.toUpperCase()}*.\n\n${
          catatan ? `Catatan: ${catatan}` : ""
        }\n${rating ? `Rating: ${rating}/5` : ""}`;

        // 4. Panggil fungsi helper untuk mengirim pesan
        //    Di dalam blok 'if' ini, TypeScript TAHU bahwa 'pegawaiAuthor.pegawai_telp' pasti sebuah 'string'.
        // Kirim WhatsApp dan simpan hasilnya
        const waResult = await sendWhatsAppMessage({
          phone: pegawaiAuthor.pegawai_telp,
          message: waMessage,
        });

        if (waResult.success) {
          try {
            await createNotifikasi({
              pegawai_id: laporan.pegawai_id, // Notifikasi untuk pembuat laporan
              judul:
                status_verifikasi === "Diverifikasi"
                  ? "Laporan Diverifikasi"
                  : status_verifikasi === "Revisi"
                  ? "Laporan Revisi"
                  : "Laporan Ditolak",
              pesan: waMessage, // Gunakan pesan yang sama
              tipe_notifikasi: "verifikasi",
              laporan_id: laporanId,
              link_tujuan: `/laporan-kegiatan/${laporanId}`, // Link ke detail laporan (sesuaikan dengan route Anda)
              action_required: false,
            });
            console.log(
              `✅ Notification created for pegawai ID ${laporan.pegawai_id}`
            );
          } catch (notifError: any) {
            // Jangan gagalkan proses, tapi log errornya
            console.error(
              "❌ Failed to create notification after WhatsApp success:",
              notifError.message
            );
          }
        }

        console.log(
          `✅ WhatsApp notification sent to ${pegawaiAuthor.pegawai_telp} for report ID ${laporanId}`
        );
      } else {
        // 5. (Opsional, tapi sangat direkomendasikan) Log jika data tidak lengkap
        console.warn(
          `⚠️ Tidak dapat mengirim WhatsApp. Pegawai ID ${laporan.pegawai_id} tidak ditemukan atau tidak memiliki nomor telepon.`
        );
      }
    } catch (waError: any) {
      // Jangan gagalkan proses utama jika WhatsApp error, cukup log di console
      console.error("❌ Gagal mengirim notifikasi WhatsApp:", waError.message);
    }
    // --- End
    // --- End of WhatsApp Integration --

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
      message: buildStatusMessage(status_verifikasi),
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

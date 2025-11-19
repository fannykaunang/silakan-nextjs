// app/api/reminder/route.ts

import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

import {
  requireAuth,
  getClientInfoWithEndpoint,
} from "@/lib/helpers/auth-helper";
import {
  countReminders,
  createReminder,
  fetchPegawaiOptionsForReminder,
  getReminderById,
  getReminderStats,
  listReminders,
} from "@/lib/models/reminder.model";
import { getPegawaiById } from "@/lib/models/pegawai.model";
import { createLogWithData } from "@/lib/models/log.model";
import type { ReminderDay, ReminderType } from "@/lib/types";

const REMINDER_TYPES: ReminderType[] = [
  "Harian",
  "Mingguan",
  "Bulanan",
  "Sekali",
];

const REMINDER_DAYS: ReminderDay[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const DEFAULT_LIMIT = 10;

type PegawaiOption = { pegawai_id: number; pegawai_nama: string | null };

const ReminderBodySchema = z.object({
  pegawai_id: z.number().int().positive().optional(),
  judul_reminder: z.string().trim().min(3),
  pesan_reminder: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .or(z.literal(""))
    .or(z.null()),
  tipe_reminder: z.enum(REMINDER_TYPES),
  waktu_reminder: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d(?:\:[0-5]\d)?$/, {
      message: "Format waktu harus HH:MM",
    }),
  hari_dalam_minggu: z.array(z.enum(REMINDER_DAYS)).optional().default([]),
  tanggal_spesifik: z.string().trim().optional().or(z.literal("")).or(z.null()),
  is_active: z.boolean().optional(),
});

function normaliseTime(value: string): string {
  if (!value.includes(":")) {
    return value;
  }
  const [hour, minute] = value.split(":");
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function normalizeDate(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);

    const page = Math.max(
      1,
      Number.parseInt(url.searchParams.get("page") || "1", 10)
    );
    const limit = Math.max(
      1,
      Number.parseInt(url.searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10)
    );
    const search = url.searchParams.get("search")?.trim() || "";
    const tipeParam = url.searchParams.get("tipe") as
      | ReminderType
      | "all"
      | null;
    const hariParam = url.searchParams.get("day") as ReminderDay | "all" | null;

    const tipeFilter = REMINDER_TYPES.includes(tipeParam as ReminderType)
      ? (tipeParam as ReminderType)
      : tipeParam === "all"
      ? "all"
      : "all";

    const hariFilter = REMINDER_DAYS.includes(hariParam as ReminderDay)
      ? (hariParam as ReminderDay)
      : hariParam === "all"
      ? "all"
      : "all";

    const isAdmin = user.level === 3;
    const currentPegawaiId = user.pegawai_id ?? null;

    if (!isAdmin && !currentPegawaiId) {
      return NextResponse.json(
        { success: false, message: "Pegawai tidak ditemukan pada sesi aktif" },
        { status: 400 }
      );
    }

    const allowedPegawaiIds = isAdmin ? undefined : [currentPegawaiId!];

    const reminders = await listReminders({
      search,
      tipe: tipeFilter,
      day: hariFilter,
      limit,
      offset: (page - 1) * limit,
      allowedPegawaiIds,
    });

    const total = await countReminders({
      search,
      tipe: tipeFilter,
      day: hariFilter,
      allowedPegawaiIds,
    });

    const stats = await getReminderStats({ allowedPegawaiIds });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    let pegawaiOptions: PegawaiOption[] = await fetchPegawaiOptionsForReminder(
      isAdmin ? undefined : allowedPegawaiIds
    );

    let currentPegawaiName: string | null = null;
    if (currentPegawaiId) {
      const pegawai = await getPegawaiById(currentPegawaiId);
      currentPegawaiName = pegawai?.pegawai_nama ?? null;
      if (!isAdmin && pegawaiOptions.length === 0 && currentPegawaiName) {
        pegawaiOptions = [
          {
            pegawai_id: currentPegawaiId,
            pegawai_nama: currentPegawaiName,
          },
        ];
      }
    }

    return NextResponse.json({
      success: true,
      data: reminders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats,
      meta: {
        isAdmin,
        currentPegawaiId,
        currentPegawaiName,
      },
      pegawaiOptions,
    });
  } catch (error: any) {
    console.error("Failed to load reminders:", error);
    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal memuat data reminder" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = ReminderBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Data reminder tidak valid" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const isAdmin = user.level === 3;
    const currentPegawaiId = user.pegawai_id ?? null;

    const targetPegawaiId = isAdmin
      ? data.pegawai_id ?? currentPegawaiId
      : currentPegawaiId;

    if (!targetPegawaiId) {
      return NextResponse.json(
        {
          success: false,
          message: "Pegawai tujuan reminder tidak ditemukan",
        },
        { status: 400 }
      );
    }

    if (!isAdmin && targetPegawaiId !== currentPegawaiId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses" },
        { status: 403 }
      );
    }

    if (
      data.tipe_reminder === "Mingguan" &&
      (!data.hari_dalam_minggu || data.hari_dalam_minggu.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Pilih minimal satu hari untuk reminder mingguan",
        },
        { status: 400 }
      );
    }

    if (data.tipe_reminder === "Sekali") {
      const tanggal = normalizeDate(data.tanggal_spesifik);
      if (!tanggal) {
        return NextResponse.json(
          {
            success: false,
            message: "Tanggal wajib diisi untuk reminder sekali",
          },
          { status: 400 }
        );
      }
      data.tanggal_spesifik = tanggal;
    } else {
      data.tanggal_spesifik = null;
    }

    if (data.tipe_reminder !== "Mingguan") {
      data.hari_dalam_minggu = [];
    }

    const waktuNormalised = normaliseTime(data.waktu_reminder);

    const reminderId = await createReminder({
      pegawai_id: targetPegawaiId,
      judul_reminder: data.judul_reminder,
      pesan_reminder: data.pesan_reminder || null,
      tipe_reminder: data.tipe_reminder,
      waktu_reminder: `${waktuNormalised}:00`.slice(0, 8),
      hari_dalam_minggu: data.hari_dalam_minggu,
      tanggal_spesifik: data.tanggal_spesifik,
      is_active: data.is_active ?? true,
    });

    const createdReminder = await getReminderById(reminderId);

    const clientInfo = getClientInfoWithEndpoint(request);
    await createLogWithData({
      pegawai_id: user.pegawai_id ?? 0,
      aksi: "Create",
      modul: "Reminder",
      detail_aksi: `Menambahkan reminder ${data.judul_reminder}`,
      data_sebelum: null,
      data_sesudah: createdReminder,
      ...clientInfo,
    });

    return NextResponse.json(
      { success: true, data: createdReminder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create reminder:", error);

    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal membuat reminder" },
      { status: 500 }
    );
  }
}

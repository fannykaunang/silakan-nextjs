// app/api/settings/app/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/helpers/auth-helper";
import {
  getAppSettings,
  updateAppSettings,
  initializeAppSettings,
  AppSettingsUpdate,
} from "@/lib/models/app-settings-model";
import { z } from "zod";

// Validation schema for settings update (removed auto_approve_laporan and reminder_time)
const settingsUpdateSchema = z.object({
  // Aplikasi Info
  nama_aplikasi: z.string().min(1).max(100).optional(),
  alias_aplikasi: z.string().min(1).max(50).optional(),
  deskripsi: z.string().optional(),
  versi: z.string().max(20).optional(),
  copyright: z.string().max(100).optional(),
  tahun: z.number().int().min(2000).max(2100).optional(),
  logo: z.string().nullable().optional(),
  favicon: z.string().nullable().optional(),

  // Kontak
  email: z.string().email().optional(),
  no_telepon: z.string().max(20).optional(),
  whatsapp: z.string().max(20).nullable().optional(),
  alamat: z.string().optional(),
  domain: z.string().max(100).optional(),

  // Mode & Status
  mode: z.enum(["online", "offline", "maintenance"]).optional(),
  maintenance_message: z.string().nullable().optional(),

  // Integrasi eAbsen
  eabsen_api_url: z.string().url().optional(),
  eabsen_sync_interval: z.number().int().min(1).optional(),
  eabsen_active: z.boolean().optional(),

  // Konfigurasi Teknis
  timezone: z.string().optional(),
  bahasa_default: z.string().max(5).optional(),
  database_version: z.string().nullable().optional(),
  max_upload_size: z.number().int().min(1).max(100).optional(),
  allowed_extensions: z.array(z.string()).nullable().optional(),

  // SEO
  meta_keywords: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  og_image: z.string().nullable().optional(),

  // Sosial Media
  facebook_url: z.string().url().nullable().optional(),
  instagram_url: z.string().url().nullable().optional(),
  twitter_url: z.string().url().nullable().optional(),
  youtube_url: z.string().url().nullable().optional(),

  // Email & SMTP
  smtp_host: z.string().nullable().optional(),
  smtp_port: z.number().int().min(1).max(65535).nullable().optional(),
  smtp_user: z.string().nullable().optional(),
  smtp_from_name: z.string().nullable().optional(),
  notifikasi_email: z.string().email().nullable().optional(),

  // Keamanan
  session_timeout: z.number().int().min(5).max(1440).optional(),
  password_min_length: z.number().int().min(6).max(32).optional(),
  max_login_attempts: z.number().int().min(1).max(10).optional(),
  lockout_duration: z.number().int().min(1).max(60).optional(),
  enable_2fa: z.boolean().optional(),

  // Laporan Settings (only max_edit_days and working_days)
  max_edit_days: z.number().int().min(0).max(30).optional(),
  working_days: z.array(z.number().int().min(0).max(6)).nullable().optional(),

  // UI Settings
  theme_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  sidebar_collapsed: z.boolean().optional(),
  items_per_page: z.number().int().min(5).max(100).optional(),
  date_format: z.string().optional(),
  time_format: z.string().optional(),

  // Organisasi
  instansi_nama: z.string().nullable().optional(),
  kepala_dinas: z.string().nullable().optional(),
  nip_kepala_dinas: z.string().nullable().optional(),
  pimpinan_wilayah: z.string().nullable().optional(),
  logo_pemda: z.string().nullable().optional(),

  // Backup & Maintenance
  backup_auto: z.boolean().optional(),
  backup_interval: z.number().int().min(1).max(365).optional(),

  // Logging
  log_activity: z.boolean().optional(),
  log_retention_days: z.number().int().min(1).max(365).optional(),
});

/**
 * GET /api/settings/app - Get app settings
 */
export async function GET(request: NextRequest) {
  try {
    const settings = await getAppSettings();

    if (!settings) {
      // Initialize default settings if not exists
      await initializeAppSettings();
      const newSettings = await getAppSettings();

      return NextResponse.json({
        success: true,
        data: newSettings,
        message: "Settings initialized",
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/app - Update app settings
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.level !== 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya admin yang dapat mengakses pengaturan",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = settingsUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data as AppSettingsUpdate;

    // Update settings
    if (!user.pegawai_id) {
      return NextResponse.json(
        {
          error: "Session tidak valid atau pegawai_id tidak tersedia",
        },
        { status: 401 }
      );
    }

    const success = await updateAppSettings(data, user.pegawai_id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    // Get updated settings
    const updatedSettings = await getAppSettings();

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

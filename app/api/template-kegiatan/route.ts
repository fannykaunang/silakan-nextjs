// app/api/template-kegiatan/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getAllTemplateKegiatan,
  createTemplateKegiatan,
  getTemplateKegiatanByKategori,
  getPublicTemplateKegiatan,
  getTemplateKegiatanByUnitKerja,
  isTemplateNameExistsInKategori,
} from "@/lib/models/template-kegiatan.model";
import { createLog } from "@/lib/models/log.model";
import {
  requireAuth,
  getClientInfoWithEndpoint,
} from "@/lib/helpers/auth-helper";

/**
 * GET /api/template-kegiatan
 * Get all templates or filtered by query params
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const kategoriId = searchParams.get("kategori_id");
    const isPublic = searchParams.get("is_public");
    const unitKerja = searchParams.get("unit_kerja");

    let templates;

    if (kategoriId) {
      templates = await getTemplateKegiatanByKategori(parseInt(kategoriId));
    } else if (isPublic === "1") {
      templates = await getPublicTemplateKegiatan();
    } else if (unitKerja) {
      templates = await getTemplateKegiatanByUnitKerja(unitKerja);
    } else {
      templates = await getAllTemplateKegiatan();
    }

    return NextResponse.json({
      success: true,
      data: templates,
      message: "Template kegiatan berhasil dimuat",
    });
  } catch (error: any) {
    console.error("Error fetching templates:", error);

    // Handle auth error
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal memuat template kegiatan",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/template-kegiatan
 * Create new template
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.pegawai_id) {
      return NextResponse.json(
        { success: false, message: "Pegawai ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.nama_template || !body.kategori_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama template dan kategori harus diisi",
        },
        { status: 400 }
      );
    }

    // Check if template name already exists in the same kategori
    const exists = await isTemplateNameExistsInKategori(
      body.nama_template,
      body.kategori_id
    );

    if (exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Template dengan nama ini sudah ada di kategori yang sama",
        },
        { status: 400 }
      );
    }

    const templateId = await createTemplateKegiatan(user.pegawai_id, {
      nama_template: body.nama_template,
      kategori_id: body.kategori_id,
      deskripsi_template: body.deskripsi_template || null,
      target_output_default: body.target_output_default || null,
      lokasi_default: body.lokasi_default || null,
      durasi_estimasi_menit: body.durasi_estimasi_menit || 60,
      is_public: body.is_public ?? 0,
      unit_kerja_akses: body.unit_kerja_akses || null,
      is_active: body.is_active ?? 1,
    });

    // Get client info for logging
    const clientInfo = getClientInfoWithEndpoint(
      request,
      "/api/template-kegiatan",
      "POST"
    );

    // Log activity
    await createLog({
      pegawai_id: user.pegawai_id,
      aksi: "Create",
      modul: "Template Kegiatan",
      detail_aksi: `Membuat template: ${body.nama_template}`,
      data_sebelum: null,
      data_sesudah: JSON.stringify({ template_id: templateId, ...body }),
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      endpoint: clientInfo.endpoint,
      method: clientInfo.method,
    });

    return NextResponse.json(
      {
        success: true,
        data: { template_id: templateId },
        message: "Template kegiatan berhasil ditambahkan",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating template:", error);

    // Handle auth error
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal menambah template kegiatan",
      },
      { status: 500 }
    );
  }
}

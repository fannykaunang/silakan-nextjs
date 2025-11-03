// app/api/template-kegiatan/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getTemplateKegiatanById,
  updateTemplateKegiatan,
  hardDeleteTemplateKegiatan,
  incrementUsageTemplateKegiatan,
  isTemplateNameExistsInKategori,
} from "@/lib/models/template-kegiatan.model";
import { createLog } from "@/lib/models/log.model";
import {
  requireAuth,
  getClientInfoWithEndpoint,
} from "@/lib/helpers/auth-helper";

/**
 * GET /api/template-kegiatan/[id]
 * Get template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    // Await params di Next.js 15
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { success: false, message: "Invalid template ID" },
        { status: 400 }
      );
    }

    const template = await getTemplateKegiatanById(templateId);

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
      message: "Template berhasil dimuat",
    });
  } catch (error: any) {
    console.error("Error fetching template:", error);

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
        message: error?.message || "Gagal memuat template",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/template-kegiatan/[id]
 * Update template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (!user.pegawai_id) {
      return NextResponse.json(
        { success: false, message: "Pegawai ID tidak ditemukan" },
        { status: 400 }
      );
    }

    // Await params di Next.js 15
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { success: false, message: "Invalid template ID" },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await getTemplateKegiatanById(templateId);

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, message: "Template tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Check if name already exists in kategori (if name or kategori is being changed)
    if (body.nama_template && body.kategori_id) {
      const exists = await isTemplateNameExistsInKategori(
        body.nama_template,
        body.kategori_id,
        templateId
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
    }

    const affectedRows = await updateTemplateKegiatan(templateId, body);

    if (affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada perubahan data" },
        { status: 400 }
      );
    }

    // Get client info for logging
    const clientInfo = getClientInfoWithEndpoint(
      request,
      `/api/template-kegiatan/${templateId}`,
      "PUT"
    );

    // Log activity
    await createLog({
      pegawai_id: user.pegawai_id,
      aksi: "Update",
      modul: "Template Kegiatan",
      detail_aksi: `Mengubah template: ${
        body.nama_template || existingTemplate.nama_template
      }`,
      data_sebelum: JSON.stringify(existingTemplate),
      data_sesudah: JSON.stringify({ ...existingTemplate, ...body }),
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      endpoint: clientInfo.endpoint,
      method: clientInfo.method,
    });

    return NextResponse.json({
      success: true,
      message: "Template berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Error updating template:", error);

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
        message: error?.message || "Gagal mengubah template",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/template-kegiatan/[id]
 * Delete template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (!user.pegawai_id) {
      return NextResponse.json(
        { success: false, message: "Pegawai ID tidak ditemukan" },
        { status: 400 }
      );
    }

    // Await params di Next.js 15
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { success: false, message: "Invalid template ID" },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await getTemplateKegiatanById(templateId);

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, message: "Template tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hard delete the template
    const affectedRows = await hardDeleteTemplateKegiatan(templateId);

    if (affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus template" },
        { status: 500 }
      );
    }

    // Get client info for logging
    const clientInfo = getClientInfoWithEndpoint(
      request,
      `/api/template-kegiatan/${templateId}`,
      "DELETE"
    );

    // Log activity
    await createLog({
      pegawai_id: user.pegawai_id,
      aksi: "Delete",
      modul: "Template Kegiatan",
      detail_aksi: `Menghapus template: ${existingTemplate.nama_template}`,
      data_sebelum: JSON.stringify(existingTemplate),
      data_sesudah: null,
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      endpoint: clientInfo.endpoint,
      method: clientInfo.method,
    });

    return NextResponse.json({
      success: true,
      message: "Template berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Error deleting template:", error);

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
        message: error?.message || "Gagal menghapus template",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/template-kegiatan/[id]
 * Increment usage count
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    // Await params di Next.js 15
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { success: false, message: "Invalid template ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if this is a usage increment request
    if (body.action === "increment_usage") {
      const affectedRows = await incrementUsageTemplateKegiatan(templateId);

      if (affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: "Gagal menambah jumlah penggunaan" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Jumlah penggunaan berhasil ditambah",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error patching template:", error);

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
        message: error?.message || "Gagal memperbarui template",
      },
      { status: 500 }
    );
  }
}

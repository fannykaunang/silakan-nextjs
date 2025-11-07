import { NextResponse } from "next/server";
import {
  requireAuth,
  getClientInfoWithEndpoint,
} from "@/lib/helpers/auth-helper";
import {
  deleteJabatan,
  getJabatanById,
  updateJabatan,
} from "@/lib/models/jabatan.model";
import { createLogWithData } from "@/lib/models/log.model";

const ALLOWED_JENIS = ["ASN", "Honorer"] as const;

type AllowedJenis = (typeof ALLOWED_JENIS)[number];

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.level !== 3) {
      return NextResponse.json(
        { success: false, message: "Hanya admin yang dapat mengubah jabatan" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const jabatanId = Number(id);

    if (!jabatanId || Number.isNaN(jabatanId)) {
      return NextResponse.json(
        { success: false, message: "ID jabatan tidak valid" },
        { status: 400 }
      );
    }

    const existing = await getJabatanById(jabatanId);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data jabatan tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const nama = body?.nama_jabatan?.trim();
    const jenis = body?.jenis_jabatan?.trim();

    if (!nama) {
      return NextResponse.json(
        { success: false, message: "Nama jabatan wajib diisi" },
        { status: 400 }
      );
    }

    if (!ALLOWED_JENIS.includes(jenis)) {
      return NextResponse.json(
        { success: false, message: "Jenis jabatan tidak valid" },
        { status: 400 }
      );
    }

    await updateJabatan(jabatanId, {
      nama_jabatan: nama,
      jenis_jabatan: jenis as AllowedJenis,
    });

    const previousData = {
      jabatan_id: existing.jabatan_id,
      nama_jabatan: existing.nama_jabatan,
      jenis_jabatan: existing.jenis_jabatan,
    };

    const updatedData = {
      ...previousData,
      nama_jabatan: nama,
      jenis_jabatan: jenis,
    };

    try {
      const clientInfo = getClientInfoWithEndpoint(
        req,
        `/api/jabatan/${jabatanId}`,
        "PUT"
      );

      const detail = existing.nama_jabatan
        ? `Memperbarui jabatan ${existing.nama_jabatan} menjadi ${nama}`
        : `Memperbarui jabatan dengan ID ${jabatanId}`;

      await createLogWithData({
        pegawai_id: user.pegawai_id ?? 0,
        aksi: "Update",
        modul: "Jabatan",
        detail_aksi: detail,
        data_sebelum: previousData,
        data_sesudah: updatedData,
        ...clientInfo,
      });
    } catch (logError) {
      console.error("Failed to write jabatan update log:", logError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Jabatan berhasil diperbarui",
        data: {
          jabatan_id: jabatanId,
          nama_jabatan: nama,
          jenis_jabatan: jenis,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (
      error?.message?.includes("Unauthorized") ||
      error?.message?.includes("login")
    ) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    if (
      error?.message?.includes("Forbidden") ||
      error?.message?.includes("privilege")
    ) {
      return NextResponse.json(
        { success: false, message: "Hanya admin yang dapat mengubah jabatan" },
        { status: 403 }
      );
    }

    console.error("Failed to update jabatan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui jabatan",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    if (user.level !== 3) {
      return NextResponse.json(
        { success: false, message: "Hanya admin yang dapat menghapus jabatan" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const jabatanId = Number(id);

    if (!jabatanId || Number.isNaN(jabatanId)) {
      return NextResponse.json(
        { success: false, message: "ID jabatan tidak valid" },
        { status: 400 }
      );
    }

    const existing = await getJabatanById(jabatanId);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data jabatan tidak ditemukan" },
        { status: 404 }
      );
    }

    const previousData = {
      jabatan_id: existing.jabatan_id,
      nama_jabatan: existing.nama_jabatan,
      jenis_jabatan: existing.jenis_jabatan,
    };

    await deleteJabatan(jabatanId);

    try {
      const clientInfo = getClientInfoWithEndpoint(
        _req,
        `/api/jabatan/${jabatanId}`,
        "DELETE"
      );

      const detail = existing.nama_jabatan
        ? `Menghapus jabatan ${existing.nama_jabatan}`
        : `Menghapus jabatan dengan ID ${jabatanId}`;

      await createLogWithData({
        pegawai_id: user.pegawai_id ?? 0,
        aksi: "Delete",
        modul: "Jabatan",
        detail_aksi: detail,
        data_sebelum: previousData,
        data_sesudah: null,
        ...clientInfo,
      });
    } catch (logError) {
      console.error("Failed to write jabatan delete log:", logError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Jabatan berhasil dihapus",
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (
      error?.message?.includes("Unauthorized") ||
      error?.message?.includes("login")
    ) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    if (
      error?.message?.includes("Forbidden") ||
      error?.message?.includes("privilege")
    ) {
      return NextResponse.json(
        { success: false, message: "Hanya admin yang dapat menghapus jabatan" },
        { status: 403 }
      );
    }

    console.error("Failed to delete jabatan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menghapus jabatan",
      },
      { status: 500 }
    );
  }
}

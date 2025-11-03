// app/api/kategori/[id]/route.ts
import { NextResponse } from "next/server";
import {
  requireAdmin,
  getClientInfo,
  getUserFromCookie,
} from "@/lib/helpers/auth-helper";
import {
  getKategoriById,
  updateKategori,
  deleteKategori,
} from "@/lib/models/kategori.model";
import { getPegawaiByPin } from "@/lib/models/pegawai.model";
import { createLog } from "@/lib/models/log.model";

// PUT: Update kategori (Admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin access
    await requireAdmin();

    // Await params (Next.js 15+)
    const { id } = await params;
    const kategoriId = parseInt(id);
    const body = await req.json();

    console.log("✏️ Updating kategori:", kategoriId);

    // Get data lama untuk logging
    const oldData = await getKategoriById(kategoriId);
    if (!oldData) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Update kategori
    const affectedRows = await updateKategori(kategoriId, body);

    if (affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori tidak ditemukan atau tidak ada perubahan",
        },
        { status: 404 }
      );
    }

    // Get data baru
    const newData = await getKategoriById(kategoriId);

    // Log aktivitas
    try {
      const user = await getUserFromCookie();
      if (user && user.pin) {
        const pegawaiData = await getPegawaiByPin(user.pin);
        const clientInfo = getClientInfo(req);

        await createLog({
          pegawai_id: pegawaiData?.pegawai_id || null,
          aksi: "Update",
          modul: "Kategori Kegiatan",
          detail_aksi: `Mengubah kategori kegiatan: ${
            newData?.nama_kategori || oldData.nama_kategori
          }`,
          data_sebelum: JSON.stringify(oldData),
          data_sesudah: JSON.stringify(newData),
          ip_address: clientInfo.ip_address,
          user_agent: clientInfo.user_agent,
          endpoint: `/api/kategori/${kategoriId}`,
          method: "PUT",
        });
      }
    } catch (logError) {
      console.error("⚠️ Failed to log activity:", logError);
    }

    console.log("✅ Kategori updated successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Kategori berhasil diperbarui",
        data: newData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error updating kategori:", error);

    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("login")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu",
        },
        { status: 401 }
      );
    }

    if (
      error.message?.includes("Forbidden") ||
      error.message?.includes("privilege")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya admin yang dapat mengubah kategori",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui kategori",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete kategori (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin access
    await requireAdmin();

    // Await params (Next.js 15+)
    const { id } = await params;
    const kategoriId = parseInt(id);

    console.log("🗑️ Soft deleting kategori:", kategoriId);

    // Get data untuk logging
    const oldData = await getKategoriById(kategoriId);
    if (!oldData) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Soft delete
    const affectedRows = await deleteKategori(kategoriId);

    if (affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Log aktivitas
    try {
      const user = await getUserFromCookie();
      if (user && user.pin) {
        const pegawaiData = await getPegawaiByPin(user.pin);
        const clientInfo = getClientInfo(req);

        await createLog({
          pegawai_id: pegawaiData?.pegawai_id || null,
          aksi: "Delete",
          modul: "Kategori Kegiatan",
          detail_aksi: `Menonaktifkan kategori kegiatan: ${oldData.nama_kategori} (${oldData.kode_kategori})`,
          data_sebelum: JSON.stringify(oldData),
          data_sesudah: JSON.stringify({ ...oldData, is_active: 0 }),
          ip_address: clientInfo.ip_address,
          user_agent: clientInfo.user_agent,
          endpoint: `/api/kategori/${kategoriId}`,
          method: "DELETE",
        });
      }
    } catch (logError) {
      console.error("⚠️ Failed to log activity:", logError);
    }

    console.log("✅ Kategori soft deleted successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Kategori berhasil dinonaktifkan",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error deleting kategori:", error);

    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("login")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu",
        },
        { status: 401 }
      );
    }

    if (
      error.message?.includes("Forbidden") ||
      error.message?.includes("privilege")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya admin yang dapat menghapus kategori",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus kategori",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

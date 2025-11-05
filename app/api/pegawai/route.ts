// app/api/pegawai/route.ts
import { NextResponse } from "next/server";
import { executeQuery, executeUpdate } from "@/lib/helpers/db-helpers";
import {
  requireAuth,
  requireAdmin,
  getClientInfoWithEndpoint,
} from "@/lib/helpers/auth-helper";
import { getPegawaiById, deletePegawai } from "@/lib/models/pegawai.model";
import { createLog } from "@/lib/models/log.model";

// GET: Fetch semua pegawai
export async function GET() {
  try {
    const user = await requireAuth();
    const isAdmin = user.level >= 3;
    const isSubAdmin = user.level === 2;

    console.log(
      `🔍 Fetching pegawai for user level ${user.level} (pegawai_id: ${user.pegawai_id}, skpdid: ${user.skpdid})`
    );

    const params: (string | number)[] = [];
    let whereClause = "";

    if (isAdmin) {
      whereClause = "";
    } else if (isSubAdmin) {
      if (typeof user.skpdid !== "number") {
        return NextResponse.json(
          {
            success: false,
            message: "Data SKPD pengguna tidak tersedia",
          },
          { status: 400 }
        );
      }

      whereClause = " WHERE skpdid = ?";
      params.push(user.skpdid);
    } else if (typeof user.pegawai_id === "number") {
      whereClause = " WHERE pegawai_id = ?";
      params.push(user.pegawai_id);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Data pegawai tidak ditemukan untuk pengguna ini",
        },
        { status: 400 }
      );
    }

    const pegawaiList = await executeQuery<any>(
      `SELECT
        pegawai_id,
        pegawai_pin,
        pegawai_nip,
        pegawai_nama,
        tempat_lahir,
        tgl_lahir,
        gender,
        pegawai_telp,
        pegawai_privilege,
        pegawai_status,
        jabatan,
        skpd,
        skpdid,
        sotk,
        photo_path
         FROM pegawai_cache${whereClause}
      ORDER BY pegawai_nama ASC`,
      params
    );

    console.log(`✅ Found ${pegawaiList.length} pegawai`);

    return NextResponse.json(
      {
        success: true,
        data: pegawaiList,
        count: pegawaiList.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
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

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data pegawai",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT: Update data pegawai
export async function PUT(req: Request) {
  try {
    // Require authentication
    const user = await requireAuth();

    const body = await req.json();
    const {
      pegawai_id,
      pegawai_nama,
      tempat_lahir,
      tgl_lahir,
      gender,
      pegawai_telp,
      pegawai_status,
    } = body;

    console.log("📝 Updating pegawai:", pegawai_id);

    // Check if Pegawai exists
    const existingPegawai = await getPegawaiById(pegawai_id);

    if (!existingPegawai) {
      return NextResponse.json(
        { success: false, message: "Pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validasi
    if (!pegawai_id) {
      return NextResponse.json(
        { success: false, message: "ID pegawai wajib diisi" },
        { status: 400 }
      );
    }

    const affectedRows = await executeUpdate(
      `UPDATE pegawai_cache 
       SET 
         pegawai_nama = ?,
         tempat_lahir = ?,
         tgl_lahir = ?,
         gender = ?,
         pegawai_telp = ?,
         pegawai_status = ?
       WHERE pegawai_id = ?`,
      [
        pegawai_nama,
        tempat_lahir,
        tgl_lahir,
        gender,
        pegawai_telp,
        pegawai_status,
        pegawai_id,
      ]
    );

    if (affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    // Fetch updated data
    const updatedPegawai = await executeQuery<any>(
      `SELECT * FROM pegawai_cache WHERE pegawai_id = ?`,
      [pegawai_id]
    );

    console.log("✅ Pegawai updated successfully");

    // Get client info for logging
    const clientInfo = getClientInfoWithEndpoint(
      req,
      `/api/pegawai/${pegawai_id}`,
      "PUT"
    );

    // Log activity
    await createLog({
      pegawai_id: user?.pegawai_id || null,
      aksi: "Update",
      modul: "Pegawai",
      detail_aksi: `Mengubah Pegawai: ${
        body.pegawai_nama || existingPegawai.pegawai_nama
      }`,
      data_sebelum: JSON.stringify(existingPegawai),
      data_sesudah: JSON.stringify({ ...existingPegawai, ...body }),
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      endpoint: clientInfo.endpoint,
      method: clientInfo.method,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Data pegawai berhasil diperbarui",
        data: updatedPegawai[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error updating pegawai:", error);

    // Handle authentication errors
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
          message: "Anda tidak memiliki akses untuk melakukan ini",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui data pegawai",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE: Hapus pegawai
export async function DELETE(req: Request) {
  try {
    // Require admin access (level 3)
    await requireAdmin();
    const user = await requireAuth();

    if (!user.pegawai_id) {
      return NextResponse.json(
        { success: false, message: "Pegawai ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const pegawai_id = searchParams.get("id");

    if (!pegawai_id) {
      return NextResponse.json(
        { success: false, message: "ID pegawai wajib diisi" },
        { status: 400 }
      );
    }

    // Check if Pegawai exists
    const existingPegawai = await getPegawaiById(
      pegawai_id as unknown as number
    );

    if (!existingPegawai) {
      return NextResponse.json(
        { success: false, message: "Pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("🗑️ Deleting pegawai:", pegawai_id);

    const affectedRows = await deletePegawai(pegawai_id as unknown as number);

    if (affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("✅ Pegawai deleted successfully");

    // Get client info for logging
    const clientInfo = getClientInfoWithEndpoint(
      req,
      `/api/pegawai/${pegawai_id}`,
      "PUT"
    );

    // Log activity
    await createLog({
      pegawai_id: user?.pegawai_id || null,
      aksi: "Update",
      modul: "Pegawai",
      detail_aksi: `Menghapus template: ${existingPegawai.pegawai_nama}`,
      data_sebelum: JSON.stringify(existingPegawai),
      data_sesudah: null,
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      endpoint: clientInfo.endpoint,
      method: clientInfo.method,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Data pegawai berhasil dihapus",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error deleting pegawai:", error);

    // Handle authentication errors
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
          message: "Hanya admin yang dapat menghapus pegawai",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus data pegawai",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// app/api/pegawai/[id]/route.ts
import { NextResponse } from "next/server";
import {
  requireAuth,
  getClientInfoWithEndpoint,
} from "@/lib/helpers/auth-helper";
import { getPegawaiById, updatePegawai } from "@/lib/models/pegawai.model";
import { createLogWithData } from "@/lib/models/log.model";

// GET - Mengambil detail pegawai by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autentikasi
    const user = await requireAuth();

    const { id } = await params;
    const pegawaiId = parseInt(id);

    if (isNaN(pegawaiId)) {
      return NextResponse.json(
        { error: "ID pegawai tidak valid" },
        { status: 400 }
      );
    }

    // Ambil data pegawai
    const pegawai = await getPegawaiById(pegawaiId);

    if (!pegawai) {
      return NextResponse.json(
        { error: "Pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    // Log aktivitas
    const clientInfo = await getClientInfoWithEndpoint(
      req,
      `/api/pegawai/${id}`
    );

    return NextResponse.json(pegawai);
  } catch (error: any) {
    console.error("Error fetching pegawai:", error);

    // Handle unauthorized error
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data pegawai" },
      { status: 500 }
    );
  }
}

// PUT - Update data pegawai
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autentikasi
    const user = await requireAuth();

    const { id } = await params;
    const pegawaiId = parseInt(id);

    if (isNaN(pegawaiId)) {
      return NextResponse.json(
        { error: "ID pegawai tidak valid" },
        { status: 400 }
      );
    }

    // Ambil data lama
    const oldData = await getPegawaiById(pegawaiId);
    if (!oldData) {
      return NextResponse.json(
        { error: "Pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    // Parse body
    const body = await req.json();

    // Validasi input
    if (!body.pegawai_nama?.trim()) {
      return NextResponse.json(
        { error: "Nama pegawai tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Update pegawai
    const updatedData = {
      pegawai_nama: body.pegawai_nama.trim(),
      tempat_lahir: body.tempat_lahir?.trim() || null,
      tgl_lahir: body.tgl_lahir || null,
      gender: parseInt(body.gender) || 1,
      pegawai_telp: body.pegawai_telp?.trim() || null,
      pegawai_status: parseInt(body.pegawai_status) || 1,
      jabatan: body.jabatan?.trim() || null,
      skpd: body.skpd?.trim() || null,
      sotk: body.sotk?.trim() || null,
      tgl_mulai_kerja: body.tgl_mulai_kerja || null,
    };

    await updatePegawai(pegawaiId, updatedData);

    // Log aktivitas dengan data sebelum dan sesudah
    const clientInfo = await getClientInfoWithEndpoint(
      req,
      `/api/pegawai/${id}`
    );
    await createLogWithData({
      pegawai_id: user.pegawai_id!,
      aksi: "Update",
      modul: "Pegawai",
      detail_aksi: `Mengubah Pegawai: ${updatedData.pegawai_nama}`,
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      endpoint: clientInfo.endpoint,
      method: clientInfo.method,
      data_sebelum: oldData,
      data_sesudah: { ...oldData, ...updatedData },
    });

    return NextResponse.json({
      success: true,
      message: "Data pegawai berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Error updating pegawai:", error);

    // Handle unauthorized error
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui data pegawai" },
      { status: 500 }
    );
  }
}

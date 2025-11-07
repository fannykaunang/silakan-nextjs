import { NextResponse, NextRequest } from "next/server";
import {
  requireAuth,
  getClientInfoWithEndpoint,
} from "@/lib/helpers/auth-helper";
import {
  countJabatan,
  createJabatan,
  fetchJabatanList,
} from "@/lib/models/jabatan.model";
import { createLogWithData } from "@/lib/models/log.model";

const ALLOWED_JENIS = ["ASN", "Honorer"] as const;

type AllowedJenis = (typeof ALLOWED_JENIS)[number];

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.level !== 3) {
      return NextResponse.json(
        { success: false, message: "Hanya admin yang dapat mengakses jabatan" },
        { status: 403 }
      );
    }

    const { searchParams } = req.nextUrl;

    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || "10"), 1),
      100
    );
    const search = searchParams.get("search")?.trim() || undefined;
    const jenisParam = searchParams.get("jenis");

    const jenis = ALLOWED_JENIS.includes(jenisParam as AllowedJenis)
      ? (jenisParam as AllowedJenis)
      : undefined;

    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      fetchJabatanList({
        search,
        jenis: jenis ?? null,
        limit,
        offset,
      }),
      countJabatan({
        search,
        jenis: jenis ?? null,
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(Math.ceil(total / limit), 1),
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

    console.error("Failed to fetch jabatan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data jabatan",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    if (user.level !== 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya admin yang dapat menambah jabatan",
        },
        { status: 403 }
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

    const insertId = await createJabatan({
      nama_jabatan: nama,
      jenis_jabatan: jenis as AllowedJenis,
    });

    const createdData = {
      jabatan_id: insertId,
      nama_jabatan: nama,
      jenis_jabatan: jenis,
    };

    try {
      const clientInfo = getClientInfoWithEndpoint(req, "/api/jabatan", "POST");

      await createLogWithData({
        pegawai_id: user.pegawai_id ?? 0,
        aksi: "Create",
        modul: "Jabatan",
        detail_aksi: `Menambahkan jabatan ${nama}`,
        data_sebelum: null,
        data_sesudah: createdData,
        ...clientInfo,
      });
    } catch (logError) {
      console.error("Failed to write jabatan create log:", logError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Jabatan berhasil ditambahkan",
        data: createdData,
      },
      { status: 201 }
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
        { success: false, message: "Hanya admin yang dapat menambah jabatan" },
        { status: 403 }
      );
    }

    console.error("Failed to create jabatan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menambah jabatan",
      },
      { status: 500 }
    );
  }
}

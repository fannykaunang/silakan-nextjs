// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/helpers/auth-helper";

// Type untuk data pegawai
interface PegawaiData {
  pegawai_id: number;
  pegawai_pin: string;
  pegawai_nip: string;
  pegawai_nama: string;
  tempat_lahir: string;
  pegawai_privilege: string;
  pegawai_telp: string;
  pegawai_status: number;
  tgl_lahir: string;
  jabatan: string;
  skpd: string;
  sotk: string;
  tgl_mulai_kerja: string;
  gender: number;
  photo_path: string;
}

// API Configuration
const API_BASE_URL = process.env.EABSEN_API_URL || "api_url_not_set";
const API_KEY = process.env.EABSEN_API_KEY || "api_key_not_set";

// Helper function untuk get user dari cookie
async function getUserFromCookie() {
  const store = await cookies();
  const authCookie = store.get("auth")?.value;

  if (!authCookie) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(authCookie, "base64").toString());
    return decoded;
  } catch (error) {
    return null;
  }
}

// Helper function untuk fetch data dari API eksternal
async function fetchPegawaiData(
  pegawaiPin: string
): Promise<PegawaiData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pegawai/${pegawaiPin}`, {
      method: "GET",
      headers: {
        EabsenApiKey: API_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pegawai data:", error);
    return null;
  }
}

// Helper function untuk update data ke API eksternal
async function updatePegawaiData(
  pegawaiPin: string,
  updatedData: Partial<PegawaiData>
): Promise<{ success: boolean; data?: PegawaiData; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/pegawai/${pegawaiPin}`, {
      method: "PUT",
      headers: {
        EabsenApiKey: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Gagal memperbarui data",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error updating pegawai data:", error);
    return { success: false, message: "Terjadi kesalahan saat update data" };
  }
}

// GET - Ambil data profil
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    //const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "User tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Ambil pegawai_pin dari query parameter atau dari user session
    const { searchParams } = new URL(request.url);

    const pegawaiPin = searchParams.get("pin") || user.pin; // PERBAIKAN: gunakan user.pin

    if (!pegawaiPin) {
      return NextResponse.json(
        { error: "Bad Request", message: "PIN pegawai tidak ditemukan" },
        { status: 400 }
      );
    }

    // Fetch data dari API eksternal
    const pegawaiData = await fetchPegawaiData(pegawaiPin);

    if (!pegawaiData) {
      return NextResponse.json(
        { error: "Not Found", message: "Data pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    // Return data profil
    return NextResponse.json(
      {
        success: true,
        data: pegawaiData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Gagal mengambil data profil",
      },
      { status: 500 }
    );
  }
}

// PUT - Update data profil
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "User tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Parse body request
    const body: Partial<PegawaiData> = await request.json();

    // Validasi field yang boleh diupdate
    const allowedFields = [
      "pegawai_nama",
      "tempat_lahir",
      "tgl_lahir",
      "pegawai_telp",
      "gender",
    ];

    const updatedData: Partial<PegawaiData> = {};
    for (const field of allowedFields) {
      if (body[field as keyof PegawaiData] !== undefined) {
        updatedData[field as keyof PegawaiData] = body[
          field as keyof PegawaiData
        ] as any;
      }
    }

    // Validasi data
    if (Object.keys(updatedData).length === 0) {
      return NextResponse.json(
        { error: "Bad Request", message: "Tidak ada data yang diupdate" },
        { status: 400 }
      );
    }

    // Validasi nomor telepon
    if (updatedData.pegawai_telp) {
      const phoneRegex = /^[0-9]{10,13}$/;
      if (!phoneRegex.test(updatedData.pegawai_telp)) {
        return NextResponse.json(
          { error: "Bad Request", message: "Format nomor telepon tidak valid" },
          { status: 400 }
        );
      }
    }

    // Validasi gender
    if (updatedData.gender && ![1, 2].includes(updatedData.gender)) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Nilai gender tidak valid (1=Laki-laki, 2=Perempuan)",
        },
        { status: 400 }
      );
    }

    // Ambil pegawai_pin dari user session
    const pegawaiPin = user.pin; // PERBAIKAN: gunakan user.pin

    if (!pegawaiPin) {
      return NextResponse.json(
        { error: "Bad Request", message: "PIN pegawai tidak ditemukan" },
        { status: 400 }
      );
    }

    // Update data ke API eksternal
    const result = await updatePegawaiData(pegawaiPin, updatedData);

    if (!result.success) {
      return NextResponse.json(
        { error: "Bad Request", message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profil berhasil diperbarui",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Gagal memperbarui profil",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus foto profil
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "User tidak terautentikasi" },
        { status: 401 }
      );
    }

    const pegawaiPin = user.pin; // PERBAIKAN: gunakan user.pin
    console.log("Deleting photo for pegawaiPin:", user.pin);

    if (!pegawaiPin) {
      return NextResponse.json(
        { error: "Bad Request", message: "PIN pegawai tidak ditemukan" },
        { status: 400 }
      );
    }

    // Update photo_path menjadi default/kosong
    const result = await updatePegawaiData(pegawaiPin, {
      photo_path: "",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Bad Request", message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Foto profil berhasil dihapus",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Gagal menghapus foto profil",
      },
      { status: 500 }
    );
  }
}

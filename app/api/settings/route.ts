// app/api/settings/route.ts

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/helpers/auth-helper";
import { fetchAllSettings } from "@/lib/models/settings.model";

export async function GET() {
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

    const settings = await fetchAllSettings();

    return NextResponse.json(
      { success: true, data: settings },
      { status: 200 }
    );
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memuat pengaturan",
      },
      { status: 500 }
    );
  }
}

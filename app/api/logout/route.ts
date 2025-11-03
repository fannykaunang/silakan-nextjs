// app/api/logout/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { verifyCsrfToken, rotateCsrfToken } from "@/lib/csrf"; // ✅ Import rotateCsrfToken
import { getUserFromCookie, getClientInfo } from "@/lib/helpers/auth-helper";
import { createLog } from "@/lib/models/log.model";
import { getPegawaiByPin } from "@/lib/models/pegawai.model";
import { getIp, isRateLimited } from "@/lib/rate-limit";

const isDev = process.env.NODE_ENV === "development";

export async function POST(req: Request) {
  try {
    // 1. CSRF Protection
    const csrfToken = req.headers.get("x-csrf-token");

    if (isDev) {
      console.log("🔐 Logout CSRF Token:", csrfToken?.substring(0, 10) + "...");
    }

    const isValidCsrf = await verifyCsrfToken(csrfToken);

    if (!isValidCsrf) {
      if (isDev) console.warn("⚠️ Invalid CSRF token on logout");
      return NextResponse.json(
        { result: 0, response: "Token keamanan tidak valid" },
        { status: 403 }
      );
    }

    // 2. Rate Limiting
    const ip = getIp(req);
    const rl = await isRateLimited(ip, "logout");

    if (rl.blocked) {
      if (isDev) console.warn("⚠️ Rate limit exceeded for logout");
      return NextResponse.json(
        { result: 0, response: "Terlalu banyak permintaan, coba lagi nanti" },
        { status: 429 }
      );
    }

    if (isDev) console.log("🚪 Logout attempt from IP:", ip);

    // 3. Ambil data user dari cookie sebelum dihapus
    const user = await getUserFromCookie();

    if (!user) {
      if (isDev) console.log("⚠️ No active session found");
      return clearAuthAndRespond({
        result: 1,
        response: "Logout berhasil",
      });
    }

    if (isDev) {
      const maskedEmail =
        user.email?.replace(/(.{3}).+(@.+)/, "$1***$2") || "unknown";
      console.log("✅ User session found:", maskedEmail, "PIN:", user.pin);
    }

    // 4. Ambil data pegawai lengkap untuk logging
    let pegawaiId = user.pegawai_id;
    let pegawaiNama = user.nama || user.email || "Unknown";

    if (user.pin) {
      try {
        const pegawaiData = await getPegawaiByPin(user.pin);
        if (pegawaiData) {
          pegawaiId = pegawaiData.pegawai_id;
          pegawaiNama = pegawaiData.pegawai_nama;
        }
      } catch (error) {
        if (isDev) console.warn("⚠️ Failed to fetch pegawai data");
      }
    }

    // 5. Log aktivitas logout SEBELUM clear cookie
    try {
      const clientInfo = getClientInfo(req);

      await createLog({
        pegawai_id: pegawaiId || null,
        aksi: "Logout",
        modul: "Auth",
        detail_aksi: `User ${pegawaiNama} berhasil logout`,
        data_sebelum: null,
        data_sesudah: null,
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        endpoint: "/api/logout",
        method: "POST",
      });

      if (isDev) console.log("✅ Logout activity logged");
    } catch (logError) {
      console.error("Failed to log logout activity");
    }

    // ✅ 6. Rotate CSRF token setelah logout (security best practice)
    await rotateCsrfToken();

    // 7. Clear semua auth cookies dan return success
    if (isDev) console.log("✅ Clearing session cookies");

    return clearAuthAndRespond({
      result: 1,
      response: "Logout berhasil",
    });
  } catch (error) {
    console.error("Logout error occurred");

    return clearAuthAndRespond(
      {
        result: 0,
        response: "Terjadi kesalahan saat logout",
      },
      500
    );
  }
}

function clearAuthAndRespond(
  data: { result: number; response: string },
  status: number = 200
) {
  const res = NextResponse.json(data, { status });

  // Clear auth cookie
  res.cookies.set("auth", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  // ⚠️ JANGAN hapus CSRF cookie di sini, biarkan rotate di atas
  // User akan dapat token baru setelah redirect ke login

  return res;
}

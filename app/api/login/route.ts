// app/api/login/route.ts
// OPTIMIZED VERSION - Non-blocking Database Operations

import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCsrfToken } from "@/lib/csrf";

import {
  loginToEabsen,
  fetchPegawaiFromEabsen,
} from "@/lib/helpers/entago-helper";
import { upsertPegawai } from "@/lib/models/pegawai.model";
import { createLog } from "@/lib/models/log.model";
import { setAuthCookie, getClientInfo } from "@/lib/helpers/auth-helper";

import {
  getIp,
  isRateLimited,
  markFailedAttempt,
  resetFailedAttempts,
  markDuplicate,
  clearDuplicate,
} from "@/lib/rate-limit";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    // 0) CSRF Protection - CEK PALING AWAL! ✅
    const csrfToken = req.headers.get("x-csrf-token");
    const isValidCsrf = await verifyCsrfToken(csrfToken);

    if (!isValidCsrf) {
      return NextResponse.json(
        { result: 0, response: "Token keamanan tidak valid" },
        { status: 403 }
      );
    }

    // 1) Basic checks
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { result: 0, response: "Content-Type harus application/json" },
        { status: 415 }
      );
    }

    // 2) Validate body
    const BodySchema = z.object({
      email: z.string().email(),
      pwd: z.string().min(1),
    });
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { result: 0, response: "Request tidak valid" },
        { status: 400 }
      );
    }
    const { email, pwd } = parsed.data;
    const maskedEmail = email.replace(/(.{3}).+(@.+)/, "$1***$2");
    console.info("Login attempt:", maskedEmail);

    // 3) Rate limit & dedupe
    const ip = getIp(req);
    const dedupOk = await markDuplicate(email);
    if (!dedupOk) {
      return NextResponse.json(
        {
          result: 0,
          response: "Request sedang diproses, mohon tunggu sebentar",
        },
        { status: 429, headers: { "X-App-Rate-Limit-Reason": "dup" } }
      );
    }

    const rl = await isRateLimited(ip, email);
    if (rl.blocked) {
      await clearDuplicate(email);
      return NextResponse.json(
        { result: 0, response: "Terlalu banyak permintaan, coba lagi nanti" },
        { status: 429, headers: { "X-App-Rate-Limit-Reason": rl.reason } }
      );
    }

    // 4) Persistent lockout check
    const lockKey = `lock:email:${email}`;
    const isLocked = await redis.get(lockKey);
    if (isLocked) {
      await clearDuplicate(email);
      return NextResponse.json(
        {
          result: 0,
          response:
            "Akun terkunci sementara karena terlalu banyak percobaan gagal",
        },
        { status: 429, headers: { "X-App-Rate-Limit-Reason": "locked" } }
      );
    }

    // 5) Auth ke eAbsen
    const loginResult = await loginToEabsen(email, pwd);
    if (!loginResult.success) {
      await markFailedAttempt(email);
      await clearDuplicate(email);
      return NextResponse.json(
        { result: 0, response: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 6) Sukses: reset fail counter
    await resetFailedAttempts(email);

    const { data } = loginResult;
    const { pin, email: userEmail, level, skpdid } = data!;
    const maskedUserEmail = userEmail.replace(/(.{3}).+(@.+)/, "$1***$2");
    console.info("Login success:", maskedUserEmail);

    // 7) ✅ CRITICAL: Set session cookie IMMEDIATELY (sebelum operasi DB)
    // Ini yang paling penting untuk user experience
    await setAuthCookie({ email: userEmail, pin, level, skpdid });

    // 8) ✅ OPTIMASI: Jalankan operasi DB secara NON-BLOCKING
    // Fire-and-forget pattern: jangan gunakan await
    const pegawaiData = await fetchPegawaiFromEabsen(pin);

    if (pegawaiData) {
      // Jalankan di background tanpa menunggu selesai
      Promise.allSettled([
        upsertPegawai(pegawaiData),
        createLog({
          pegawai_id: pegawaiData.pegawai_id,
          aksi: "Login",
          modul: "Auth",
          detail_aksi: `User ${pegawaiData.pegawai_nama} berhasil login`,
          data_sebelum: null,
          data_sesudah: null,
          ip_address: getClientInfo(req).ip_address,
          user_agent: getClientInfo(req).user_agent,
          endpoint: "/api/login",
          method: "POST",
        }),
      ]).catch((err) => {
        // Log error tapi jangan ganggu response ke client
        console.error("Background DB operations failed:", err);
      });
    } else {
      console.warn("Could not fetch pegawai data for PIN (masked).");
    }

    // 9) Bersihkan marker duplikat
    await clearDuplicate(email);

    // 10) ✅ Response SEGERA - tidak menunggu operasi DB selesai
    return NextResponse.json(
      {
        result: 1,
        response: "Login berhasil!",
        email: maskedUserEmail,
        level,
        skpdid,
      },
      {
        status: 200,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'self'",
          "X-Frame-Options": "DENY",
        },
      }
    );
  } catch (error) {
    console.error("Server error during login:", error);
    return NextResponse.json(
      { result: 0, response: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

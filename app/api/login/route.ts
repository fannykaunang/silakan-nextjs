// app/api/login/route.ts
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
  RATE_LIMITS,
  getIp,
  isRateLimited,
  markFailedAttempt,
  resetFailedAttempts,
  markDuplicate,
  clearDuplicate,
} from "@/lib/rate-limit";
import { redis } from "@/lib/redis"; // optional: dipakai untuk get lockKey langsung

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
      email: z.email(),
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

    // 4) Persistent lockout check (defensif; sebenarnya sudah di isRateLimited)
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
      await clearDuplicate(email); // agar user bisa coba lagi setelah jeda singkat
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

    // 7) Fetch & cache pegawai, lalu logging aktivitas
    const pegawaiData = await fetchPegawaiFromEabsen(pin);
    if (pegawaiData) {
      try {
        await upsertPegawai(pegawaiData);

        const clientInfo = getClientInfo(req);
        await createLog({
          pegawai_id: pegawaiData.pegawai_id,
          aksi: "Login",
          modul: "Auth",
          detail_aksi: `User ${pegawaiData.pegawai_nama} berhasil login`,
          data_sebelum: null,
          data_sesudah: null,
          ip_address: clientInfo.ip_address,
          user_agent: clientInfo.user_agent,
          endpoint: "/api/login",
          method: "POST",
        });
      } catch {
        console.warn("Login succeeded but cache/logging failed");
      }
    } else {
      console.warn("Could not fetch pegawai data for PIN (masked).");
    }

    // 8) Set session cookie (HttpOnly, Secure, SameSite, dsb. ditangani helper)
    await setAuthCookie({ email: userEmail, pin, level, skpdid });

    // 9) Bersihkan marker duplikat (TTL juga akan beres sendiri)
    await clearDuplicate(email);

    // 10) Response aman (jangan bocorkan rahasia)
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
          // Tambahkan header keamanan
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'self'", // Aturan CSP spesifik
          "X-Frame-Options": "DENY", // Mencegah Clickjacking
        },
      }
    );
  } catch {
    console.error("Server error during login");
    return NextResponse.json(
      { result: 0, response: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// app/api/login/route.ts
import { NextResponse } from "next/server";
import {
  loginToEabsen,
  fetchPegawaiFromEabsen,
} from "@/lib/helpers/entago-helper";
import { upsertPegawai } from "@/lib/models/pegawai.model";
import { createLog } from "@/lib/models/log.model";
import { setAuthCookie, getClientInfo } from "@/lib/helpers/auth-helper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, pwd } = body;

    // Validasi input
    if (!email || !pwd) {
      return NextResponse.json(
        { result: 0, response: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    console.log("🔐 Login attempt for:", email);

    // 1. Login ke API eAbsen
    const loginResult = await loginToEabsen(email, pwd);

    if (!loginResult.success) {
      console.error("❌ Login failed:", loginResult.error);
      return NextResponse.json(
        { result: 0, response: loginResult.error || "Login gagal" },
        { status: 401 }
      );
    }

    const { data } = loginResult;
    const { pin, email: userEmail, level, skpdid } = data!;

    console.log("✅ Login success - PIN:", pin);

    // 2. Fetch data pegawai lengkap dari API eAbsen
    console.log("📡 Fetching pegawai data for PIN:", pin);
    const pegawaiData = await fetchPegawaiFromEabsen(pin);

    if (pegawaiData) {
      console.log("✅ Pegawai data fetched:", pegawaiData.pegawai_nama);

      try {
        // 3. Upsert ke pegawai_cache menggunakan model
        console.log("💾 Syncing to pegawai_cache...");
        await upsertPegawai(pegawaiData);
        console.log("✅ Pegawai cache synced successfully");

        // 4. Log aktivitas login
        const clientInfo = getClientInfo(req);
        await createLog({
          pegawai_id: pegawaiData.pegawai_id,
          aksi: "Login",
          modul: "Auth",
          detail_aksi: `User ${pegawaiData.pegawai_nama} berhasil login`,
          data_sebelum: null, // ← PERBAIKAN: Explicit null
          data_sesudah: null, // ← PERBAIKAN: Explicit null
          ip_address: clientInfo.ip_address,
          user_agent: clientInfo.user_agent,
          endpoint: "/api/login",
          method: "POST",
        });
        console.log("✅ Login activity logged");
      } catch (dbError: any) {
        console.error("❌ Database error:", dbError.message);
        // Login tetap berhasil meskipun sync gagal
        console.warn("⚠️ Login successful but sync to cache failed");
      }
    } else {
      console.warn("⚠️ Failed to fetch pegawai data from eAbsen");
      // Login tetap berhasil
    }

    // 5. Set cookie session menggunakan helper
    await setAuthCookie({
      email: userEmail,
      pin: pin,
      level: level,
      skpdid: skpdid,
    });

    console.log("✅ Session cookie set");

    // 6. Return success response
    const response = NextResponse.json(
      {
        result: 1,
        response: "Login berhasil!",
        email: userEmail,
        pin: pin,
        level: level,
        skpdid: skpdid,
      },
      { status: 200 }
    );

    return response;
  } catch (e: any) {
    console.error("❌ Server error:", e);
    return NextResponse.json(
      {
        result: 0,
        response: "Terjadi kesalahan pada server",
        message: e.message,
      },
      { status: 500 }
    );
  }
}

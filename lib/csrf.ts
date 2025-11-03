// // lib/csrf.ts
// import "server-only";
// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { randomBytes, timingSafeEqual } from "crypto";

// const CSRF_TOKEN_LENGTH = 32;
// const CSRF_COOKIE_NAME = "csrf_token";

// export async function generateCsrfToken(): Promise<string> {
//   const token = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");

//   (await cookies()).set(CSRF_COOKIE_NAME, token, {
//     httpOnly: true, // ⚠️ Harus false agar client bisa baca!
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 60 * 60, // 1 jam
//     path: "/",
//   });

//   return token; //NextResponse.json({ token }, { status: 200 });
// }

// // export async function generateCsrfToken() {
// //   const jar = await cookies();
// //   let token = jar.get(CSRF_COOKIE_NAME)?.value;

// //   // Jika belum ada, generate dan set cookie
// //   if (!token) {
// //     token = randomBytes(32).toString("hex");
// //     const res = NextResponse.json({ token }, { status: 200 });
// //     res.cookies.set(CSRF_COOKIE_NAME, token, {
// //       httpOnly: true, // aman untuk double-submit (client dapat token via JSON)
// //       sameSite: "strict",
// //       secure: process.env.NODE_ENV === "production",
// //       path: "/",
// //       maxAge: 60 * 60, // 1 jam
// //     });
// //     return res;
// //   }

// //   // Jika sudah ada, kembalikan token yang sama tanpa set cookie baru
// //   return NextResponse.json({ token }, { status: 200 });
// // }

// export async function verifyCsrfToken(token: string | null): Promise<boolean> {
//   if (!token) return false;

//   const cookieStore = await cookies();
//   const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

//   if (!cookieToken || cookieToken.length !== token.length) {
//     return false;
//   }

//   try {
//     // Timing-safe comparison
//     return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(token));
//   } catch {
//     return false;
//   }
// }

// lib/csrf.ts
import "server-only";
import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf_token";

export async function generateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();

  // ✅ Cek apakah sudah ada token yang valid
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existingToken && existingToken.length === CSRF_TOKEN_LENGTH * 2) {
    // Token masih ada dan valid, return yang existing
    console.log("✅ Using existing CSRF token");
    return existingToken;
  }

  // Generate token baru hanya jika belum ada
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // ⚠️ PENTING: false agar JS bisa baca
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1 jam
    path: "/",
  });

  console.log("✅ New CSRF token generated");
  return token;
}

export async function verifyCsrfToken(token: string | null): Promise<boolean> {
  if (!token) {
    console.warn("⚠️ No CSRF token provided");
    return false;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!cookieToken) {
    console.warn("⚠️ No CSRF token in cookie");
    return false;
  }

  if (cookieToken.length !== token.length) {
    console.warn("⚠️ Token length mismatch");
    return false;
  }

  try {
    const isValid = timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(token)
    );

    if (isValid) {
      console.log("✅ CSRF token valid");
    } else {
      console.warn("⚠️ CSRF token mismatch");
    }

    return isValid;
  } catch (error) {
    console.error("❌ CSRF verification error:", error);
    return false;
  }
}

// ✅ Helper untuk rotate token setelah operasi sensitif
export async function rotateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();

  // Hapus token lama
  cookieStore.delete(CSRF_COOKIE_NAME);

  // Generate token baru
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });

  console.log("🔄 CSRF token rotated");
  return token;
}

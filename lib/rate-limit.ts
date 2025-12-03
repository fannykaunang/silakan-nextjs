// lib/rate-limit.ts
import "server-only";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

export const RATE_LIMITS = {
  ipWindowSec: 60,
  ipMax: 60, // req/IP/menit
  emailWindowSec: 60,
  emailMax: 10, // req/email/menit
  dupWindowSec: 3, // cegah dobel klik/submit
  failWindowSec: 15 * 60, // jendela hitung gagal
  failMax: 5, // kunci setelah 5x gagal
  lockoutSec: 15 * 60, // durasi lockout
} as const;

export function getIp(req: Request | NextRequest) {
  // Berurutan: header edge/CDN, lalu Node fallback
  const h = req.headers as Headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = h.get("x-real-ip");
  if (xri) return xri.trim();
  // NextRequest punya .ip; ignore kalau tipe Request biasa
  if (typeof (req as any).ip === "string" && (req as any).ip)
    return (req as any).ip;
  return "unknown";
}

export async function isRateLimited(ip: string, email: string) {
  // IP-based
  const ipKey = `rl:ip:${ip}`;
  const ipCount = await redis.incr(ipKey);
  if (ipCount === 1) await redis.expire(ipKey, RATE_LIMITS.ipWindowSec);
  if (ipCount > RATE_LIMITS.ipMax)
    return { blocked: true as const, reason: "ip" as const };

  // Email/account-based
  const emailKey = `rl:email:${email}`;
  const emailCount = await redis.incr(emailKey);
  if (emailCount === 1)
    await redis.expire(emailKey, RATE_LIMITS.emailWindowSec);
  if (emailCount > RATE_LIMITS.emailMax)
    return { blocked: true as const, reason: "email" as const };

  // Lockout check (persistent failed attempts)
  const lockKey = `lock:email:${email}`;
  const locked = await redis.get(lockKey);
  if (locked) return { blocked: true as const, reason: "locked" as const };

  return { blocked: false as const };
}

export async function markFailedAttempt(email: string) {
  const failKey = `fail:email:${email}`;
  const count = await redis.incr(failKey);
  if (count === 1) await redis.expire(failKey, RATE_LIMITS.failWindowSec);
  if (count >= RATE_LIMITS.failMax) {
    await redis.set(`lock:email:${email}`, "1", { ex: RATE_LIMITS.lockoutSec });
  }
}

export async function resetFailedAttempts(email: string) {
  await redis.del(`fail:email:${email}`);
  await redis.del(`lock:email:${email}`);
}

// Anti-duplicate submit (SET NX + TTL)
export async function markDuplicate(email: string) {
  const key = `dup:email:${email}`;
  const res = await redis.set(key, "1", {
    ex: RATE_LIMITS.dupWindowSec,
    nx: true,
  });
  return res === "OK";
}

export async function clearDuplicate(email: string) {
  await redis.del(`dup:email:${email}`);
}

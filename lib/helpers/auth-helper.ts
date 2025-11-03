// lib/helpers/auth-helper.ts
import { cookies } from "next/headers";
import { getPegawaiByPin } from "@/lib/models/pegawai.model";
import { Pegawai } from "@/lib/types";

// ============================================
// TYPES
// ============================================

export interface UserSession {
  email: string;
  pin: string;
  level: number;
  skpdid: number;
  pegawai_id?: number; // Will be populated from DB
  nama?: string;
}

export interface AuthResult {
  user: UserSession | null;
  error?: string;
}

// ============================================
// COOKIE OPERATIONS
// ============================================

/**
 * Get user session from cookie
 * Returns null if cookie doesn't exist or invalid
 */
export async function getUserFromCookie(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth")?.value;

    if (!authCookie) {
      return null;
    }

    // Decode Base64
    const decoded = Buffer.from(authCookie, "base64").toString("utf-8");
    const user = JSON.parse(decoded) as UserSession;

    // Populate pegawai_id dan nama dari database jika belum ada
    if (!user.pegawai_id && user.pin) {
      const pegawai = await getPegawaiByPin(user.pin);
      if (pegawai) {
        user.pegawai_id = pegawai.pegawai_id;
        user.nama = pegawai.pegawai_nama;
      }
    }

    return user;
  } catch (error) {
    console.error("Error parsing auth cookie:", error);
    return null;
  }
}

/**
 * Get user with full pegawai data
 */
export async function getUserWithPegawaiData(): Promise<{
  session: UserSession | null;
  pegawai: Pegawai | null;
}> {
  const session = await getUserFromCookie();

  if (!session?.pin) {
    return { session: null, pegawai: null };
  }

  const pegawai = await getPegawaiByPin(session.pin);

  return { session, pegawai };
}

/**
 * Set auth cookie
 */
export async function setAuthCookie(data: {
  email: string;
  pin: string;
  level: number;
  skpdid: number;
}): Promise<void> {
  const cookieStore = await cookies();
  const value = Buffer.from(JSON.stringify(data)).toString("base64");

  cookieStore.set("auth", value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Clear auth cookie (logout)
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth");
}

// ============================================
// AUTHORIZATION HELPERS
// ============================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUserFromCookie();
  return user !== null;
}

/**
 * Check if user has specific privilege level
 * -1: Invalid, 0: User, 1: Operator, 2: Sub Admin, 3: Admin
 */
export async function hasPrivilege(minLevel: number): Promise<boolean> {
  const user = await getUserFromCookie();
  if (!user) return false;

  return user.level >= minLevel;
}

/**
 * Check if user is admin (level 3)
 */
export async function isAdmin(): Promise<boolean> {
  return await hasPrivilege(3);
}

/**
 * Check if user is at least operator (level >= 1)
 */
export async function isOperator(): Promise<boolean> {
  return await hasPrivilege(1);
}

/**
 * Require authentication - throw error if not authenticated
 * Use this in API routes
 */
export async function requireAuth(): Promise<UserSession> {
  const user = await getUserFromCookie();

  if (!user) {
    throw new Error("Unauthorized - Please login");
  }

  return user;
}

/**
 * Require specific privilege level
 */
export async function requirePrivilege(minLevel: number): Promise<UserSession> {
  const user = await requireAuth();

  if (user.level < minLevel) {
    throw new Error(`Forbidden - Requires privilege level ${minLevel}`);
  }

  return user;
}

/**
 * Require admin access
 */
export async function requireAdmin(): Promise<UserSession> {
  return await requirePrivilege(3);
}

// ============================================
// REQUEST HELPERS
// ============================================

/**
 * Get IP address from request
 */
export function getIpAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return realIp || "unknown";
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}

/**
 * Get client info (IP + User Agent)
 */
export function getClientInfo(request: Request): {
  ip_address: string;
  user_agent: string;
} {
  return {
    ip_address: getIpAddress(request),
    user_agent: getUserAgent(request),
  };
}

// ============================================
// PERMISSION HELPERS
// ============================================

/**
 * Check if user can access/edit resource owned by another user
 * Returns true if user is owner OR admin
 */
export async function canAccessResource(ownerId: number): Promise<boolean> {
  const user = await getUserFromCookie();

  if (!user?.pegawai_id) return false;

  // User is owner
  if (user.pegawai_id === ownerId) return true;

  // User is admin
  if (user.level >= 3) return true;

  return false;
}

/**
 * Check if user can verify reports (atasan)
 * You'll need to check atasan_pegawai table
 */
export async function canVerifyFor(pegawaiId: number): Promise<boolean> {
  const user = await getUserFromCookie();

  if (!user?.pegawai_id) return false;

  // Admin can verify for anyone
  if (user.level >= 3) return true;

  // TODO: Check atasan_pegawai table
  // const isAtasan = await checkAtasanPegawai(user.pegawai_id, pegawaiId);
  // return isAtasan;

  return false;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get privilege name from level number
 */
export function getPrivilegeName(level: number): string {
  const privileges: { [key: number]: string } = {
    "-1": "Invalid",
    0: "User",
    1: "Operator",
    2: "Sub Admin",
    3: "Admin",
  };
  return privileges[level] || "Unknown";
}

/**
 * Parse auth cookie manually (without async)
 * Use only when you need sync operation
 */
export function parseAuthCookie(cookieValue: string): UserSession | null {
  try {
    const decoded = Buffer.from(cookieValue, "base64").toString("utf-8");
    return JSON.parse(decoded) as UserSession;
  } catch {
    return null;
  }
}

/**
 * Get client info lengkap dengan endpoint & method
 */
export function getClientInfoWithEndpoint(
  request: Request,
  endpoint?: string,
  method?: string
): {
  ip_address: string;
  user_agent: string;
  endpoint: string;
  method: string;
} {
  return {
    ip_address: getIpAddress(request),
    user_agent: getUserAgent(request),
    endpoint: endpoint || new URL(request.url).pathname,
    method: method || request.method,
  };
}

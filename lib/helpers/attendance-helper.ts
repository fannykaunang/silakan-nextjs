// lib/helpers/attendance-helper.ts

interface AttendanceCheckResult {
  success: boolean;
  date: string | null;
  message?: string;
}

/**
 * Check if employee has checked in today via external eAbsen API
 * @param pin - Employee PIN from auth cookie
 * @param scanDate - Date to check (format: YYYY-MM-DD)
 * @returns Promise with attendance check result
 */

type ApiResponse = {
  success: boolean;
  checkin_time?: string | null;
  date?: string | null; // jaga-jaga bila Anda nanti ganti nama field di server
  scan_date?: string | null; // jaga-jaga kalau pakai nama ini
};

const API_BASE_URL = process.env.EABSEN_API_URL || "api_url_not_set";
const API_KEY = process.env.EABSEN_API_KEY || "api_key_not_set";

export async function checkAttendanceToday(
  pin: string,
  scanDate: string
): Promise<AttendanceCheckResult> {
  try {
    const ymd = normalizeYMD(scanDate); // penting: zero-pad agar cocok "yyyy-MM-dd"

    const apiUrl = `${API_BASE_URL}/checkin/morning-checkin?pin=${encodeURIComponent(
      pin
    )}&date=${encodeURIComponent(ymd)}`;

    console.log("Checking attendance with URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        EabsenApiKey: API_KEY || "eabsen_api_key_here",
        "Content-Type": "application/json",
      },
      // cache: "no-store", // opsional: jika ingin selalu fresh
      redirect: "manual",
    });

    if (!response.ok) {
      console.error(
        "Attendance API error:",
        response.status,
        "Checking attendance with URL:" + apiUrl
      );
      return {
        success: false,
        date: null,
        message: "Gagal mengecek kehadiran. Silakan coba lagi.",
      };
    }

    const data: ApiResponse = await response.json();

    // Backend kita kirim "checkin_time". Namun untuk kompatibilitas,
    // fallback ke "date" atau "scan_date" jika Anda mengubah server di masa depan.
    const foundTime = data.checkin_time || data.date || data.scan_date || null;

    if (!data.success || !foundTime) {
      return {
        success: false,
        date: null,
        message:
          "Anda belum absen pada tanggal yang dipilih. Silakan absen terlebih dahulu.",
      };
    }

    return {
      success: true,
      date: foundTime,
      message: "Anda sudah absen hari ini.",
    };
  } catch (error) {
    console.error("Error checking attendance:", error);
    return {
      success: false,
      date: null,
      message: "Terjadi kesalahan saat mengecek kehadiran.",
    };
  }
}

/**
 * Format date to YYYY-MM-DD for API
 */
function normalizeYMD(input: string): string {
  // Pastikan format tepat "YYYY-MM-DD"
  // Hindari timezone offset: jangan pakai toISOString() di sini.
  // Gunakan padding manual agar lolos TryParseExact di server.
  const m = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return input; // biarkan apa adanya; anggap sudah benar
  const [_, y, mo, d] = m;
  const mm = mo.padStart(2, "0");
  const dd = d.padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

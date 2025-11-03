// lib/helpers/attendance-helper.ts

interface AttendanceCheckResult {
  success: boolean;
  scan_date: string | null;
  message?: string;
}

/**
 * Check if employee has checked in today via external eAbsen API
 * @param pin - Employee PIN from auth cookie
 * @param scanDate - Date to check (format: YYYY-MM-DD)
 * @returns Promise with attendance check result
 */
export async function checkAttendanceToday(
  pin: string,
  scanDate: string
): Promise<AttendanceCheckResult> {
  try {
    const apiUrl = `https://dev.api.eabsen.merauke.go.id/api/checkin/today?pin=${pin}&scan_date=${scanDate}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        EabsenApiKey: process.env.EABSEN_API_KEY || "eabsen_api_key_here",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Attendance API error:",
        response.status,
        response.statusText
      );
      return {
        success: false,
        scan_date: null,
        message: "Gagal mengecek kehadiran. Silakan coba lagi.",
      };
    }

    const data: AttendanceCheckResult = await response.json();

    if (!data.success || !data.scan_date) {
      return {
        success: false,
        scan_date: null,
        message: "Anda belum absen hari ini. Silakan absen terlebih dahulu.",
      };
    }

    return {
      success: true,
      scan_date: data.scan_date,
      message: "Anda sudah absen hari ini.",
    };
  } catch (error) {
    console.error("Error checking attendance:", error);
    return {
      success: false,
      scan_date: null,
      message: "Terjadi kesalahan saat mengecek kehadiran.",
    };
  }
}

/**
 * Format date to YYYY-MM-DD for API
 */
export function formatDateForAPI(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date formatted for API
 */
export function getTodayFormatted(): string {
  return formatDateForAPI(new Date());
}

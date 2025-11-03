// lib/helpers/eabsen-helper.ts
const API_BASE_URL = "https://dev.api.eabsen.merauke.go.id/api";
const API_KEY = process.env.EABSEN_API_KEY || "api_key";

// Login response interface
export interface EabsenLoginResponse {
  result: number;
  response: string;
  email: string;
  pin: string;
  level: number;
  skpdid: number;
}

// Login ke eAbsen API
export async function loginToEabsen(
  email: string,
  password: string
): Promise<{ success: boolean; data?: EabsenLoginResponse; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        EabsenApiKey: API_KEY,
      },
      body: JSON.stringify({ email, pwd: password }),
      redirect: "manual",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.result !== 1) {
      return {
        success: false,
        error: data?.response || "Login gagal",
      };
    }

    return {
      success: true,
      data: data as EabsenLoginResponse,
    };
  } catch (error: any) {
    console.error("Error login to eAbsen:", error);
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

// Fetch pegawai data dari API eAbsen
export async function fetchPegawaiFromEabsen(pin: string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pegawai/${pin}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        EabsenApiKey: API_KEY,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Failed to fetch pegawai: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pegawai:", error);
    return null;
  }
}

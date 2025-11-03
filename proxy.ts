// proxy.ts (root proyek)
import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const hasAuth = req.cookies.get("auth")?.value;

  if (isDashboard && !hasAuth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname); // optional
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Hanya jalankan untuk /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};

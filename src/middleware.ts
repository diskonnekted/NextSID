// Middleware NextAuth untuk melindungi seluruh /admin/*.
//
// Aturan:
// - /admin/login & /api/auth/* → bebas (harus diakses tanpa session)
// - /admin/* lain → wajib punya session JWT; kalau tidak, redirect
//   ke /admin/login?from=<path-asli>.

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Whitelist: halaman login & API auth selalu boleh.
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: COOKIE_NAME,
    });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
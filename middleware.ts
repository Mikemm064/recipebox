import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/login"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.[a-zA-Z0-9]+$/)
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const isAuthed = request.cookies.get("recipebox_auth")?.value === "1";
  if (isAuthed) {
    return NextResponse.next();
  }

  const returnTo = encodeURIComponent(`${pathname}${search}`);
  return NextResponse.redirect(new URL(`/login?returnTo=${returnTo}`, request.url));
}

export const config = {
  matcher: ["/:path*"],
};

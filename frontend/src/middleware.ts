import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard, admin and settings routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/settings")) {
    if (!token) {
      // Redirect to login if no token is found
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login/register pages
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      // Since we don't have the user role in the middleware easily without decoding,
      // we can redirect to a generic loading/router page, or just let them go to /
      // But the easiest is to redirect to / and let the client-side landing page handle the role-based routing
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Config to run middleware only on specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/settings/:path*", "/login", "/register"],
};

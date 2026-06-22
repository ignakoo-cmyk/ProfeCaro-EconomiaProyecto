import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirección si no hay token y se intenta acceder a una ruta protegida
  const isProtectedRoute =
    pathname.startsWith("/estudiante") ||
    pathname.startsWith("/negocio") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings");

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Si hay token, validar el rol y redirigir según corresponda
  if (token) {
    try {
      const payloadBase64 = token.split(".")[1];
      if (payloadBase64) {
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const role = decodedPayload.user_type || decodedPayload.role || "STUDENT";

        // Proteger accesos cruzados de estudiantes en rutas de negocio
        if (pathname.startsWith("/negocio") && role !== "PYME" && role !== "ADMIN") {
          return NextResponse.redirect(new URL("/estudiante/trabajos", request.url));
        }

        // Proteger accesos cruzados de negocios en rutas de estudiante
        if (pathname.startsWith("/estudiante") && role !== "STUDENT" && role !== "ADMIN") {
          return NextResponse.redirect(new URL("/negocio/panel", request.url));
        }

        // Evitar que usuarios ya autenticados vuelvan a la pantalla de login/registro
        if (pathname === "/login" || pathname === "/register") {
          if (role === "STUDENT") {
            return NextResponse.redirect(new URL("/estudiante/trabajos", request.url));
          }
          if (role === "PYME") {
            return NextResponse.redirect(new URL("/negocio/panel", request.url));
          }
          if (role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin", request.url));
          }
        }
      }
    } catch (error) {
      console.error("Error decodificando token en middleware:", error);
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/estudiante/:path*",
    "/negocio/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};


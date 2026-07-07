import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const PROTECTED_ROUTES = ["/dashboard", "/survey", "/history", "/admin"];
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => path.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.includes(path);

  const sessionCookie = request.cookies.get("session")?.value;
  const session = sessionCookie ? await decrypt(sessionCookie) : null;

  // 1. Redirect to /login if not authenticated and accessing a protected route
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Redirect to dashboard/admin if authenticated and accessing /login or /register
  if (isAuthRoute && session) {
    const targetPath = session.role === "ADMIN" ? "/admin" : "/dashboard";
    const redirectUrl = new URL(targetPath, request.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Admin dashboard authorization check
  if (path.startsWith("/admin") && session?.role !== "ADMIN") {
    const redirectUrl = new URL("/dashboard", request.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Prevent Admin from accessing standard user check-in/history pages
  const isPatientRoute = ["/dashboard", "/survey", "/history"].some((route) => path.startsWith(route));
  if (isPatientRoute && session?.role === "ADMIN") {
    const redirectUrl = new URL("/admin", request.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

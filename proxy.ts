import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

const PROTECTED_PATHS = [
  "/dashboard",
  "/interview",
  "/profile",
  "/interview-setup",
  "/interview-room",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

function isPublicAuthPath(pathname: string): boolean {
  // Auth pages (login/signup) but NOT callback
  return (
    pathname.startsWith("/auth") &&
    !pathname.startsWith("/auth/callback") &&
    !pathname.startsWith("/auth/verify-email") &&
    !pathname.startsWith("/auth/reset-password")
  );
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  console.log(
    `[Middleware] Path: ${pathname}, Authed: ${accessToken ? "Yes" : "No"}`,
  );

  let isAuthenticated = false;
  let isExpired = false;

  if (accessToken) {
    try {
      await jwtVerify(accessToken, JWT_SECRET);
      isAuthenticated = true;
    } catch (err: any) {
      if (err.code === "ERR_JWT_EXPIRED") {
        isExpired = true;
      }
    }
  }

  // Trigger refresh if token is expired OR missing but we have a refresh token
  const isAuthRoute =
    pathname.startsWith("/api/refresh") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth");

  if (!isAuthenticated && refreshToken && !isAuthRoute) {
    const refreshUrl = new URL("/api/refresh", req.url);
    refreshUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(refreshUrl);
  }

  // Truly unauthenticated on a protected path -> send to login
  if (!isAuthenticated && isProtectedPath(pathname)) {
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Valid token on login/signup page -> send to dashboard (already logged in)
  if (isAuthenticated && isPublicAuthPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Token Bridge: Inject token into REQUEST headers for server components
  const requestHeaders = new Headers(req.headers);
  if (accessToken && isAuthenticated) {
    requestHeaders.set("x-middleware-access-token", accessToken);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

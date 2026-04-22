import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// JWT_ACCESS_SECRET must be set in Environment Variables (Vercel/Local .env)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || "JWT_ACCESS_SECRET");

const PROTECTED_PATHS = [
  "/dashboard",
  "/interview",
  "/profile", 
  "/interview-setup",
  "/interview-room",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(p => pathname.startsWith(p));
}

function isPublicAuthPath(pathname: string): boolean {
  // Auth pages (login/signup) but NOT callback
  return pathname.startsWith("/auth") && !pathname.startsWith("/auth/callback") && !pathname.startsWith("/auth/verify-email") && !pathname.startsWith("/auth/reset-password");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  console.log(`[Middleware] Path: ${pathname}, AccessToken: ${accessToken ? "Present" : "Missing"}, RefreshToken: ${refreshToken ? "Present" : "Missing"}`);

  let isAuthenticated = false;
  let isExpired = false;

  if (accessToken) {
    try {
      await jwtVerify(accessToken, JWT_SECRET);
      isAuthenticated = true;
    } catch (err: any) {
      console.log(`[Middleware] Token Verification Failed: ${err.code || err.message}`);
      // ERR_JWT_EXPIRED means a valid token that just ran out
      if (err.code === "ERR_JWT_EXPIRED") {
        isExpired = true;
      }
    }
  }

  // Trigger refresh if token is expired OR missing but we have a refresh token
  if (!isAuthenticated && refreshToken && isProtectedPath(pathname)) {
    console.log(`[Middleware] Redirecting to refresh API for: ${pathname}`);
    const refreshUrl = new URL("/api/refresh", req.url);
    refreshUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(refreshUrl);
  }

  // Truly unauthenticated (no valid access token and no refresh token) -> send to login
  if (!isAuthenticated && isProtectedPath(pathname)) {
    console.log(`[Middleware] No valid tokens for protected path. Redirecting to signin.`);
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Valid token on login/signup page -> send to dashboard (already logged in)
  if (isAuthenticated && isPublicAuthPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Inject token into headers for server components (Token Bridge)
  const response = NextResponse.next();
  if (accessToken) {
    response.headers.set("x-access-token", accessToken);
  }
  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

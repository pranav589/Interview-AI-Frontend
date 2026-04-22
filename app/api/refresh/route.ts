import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect") || "/dashboard";
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    // No refresh token - full logout/redirect to signin
    const signinUrl = new URL("/auth/signin", req.url);
    signinUrl.searchParams.set("reason", "session_expired");
    return NextResponse.redirect(signinUrl);
  }

  try {
    const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    // Remove trailing slash to prevent double-slash issues
    const backendUrl = rawBackendUrl.replace(/\/$/, "");
    const refreshEndpoint = `${backendUrl}/auth/refresh-token`;

    console.log(`[Refresh API] Attempting refresh at: ${refreshEndpoint}`);

    const res = await fetch(refreshEndpoint, {
      method: "POST",
      headers: {
        "Cookie": `refreshToken=${refreshToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`[Refresh API] Backend returned ${res.status}: ${res.statusText}`);
      const signinUrl = new URL("/auth/signin", req.url);
      signinUrl.searchParams.set("reason", "session_expired");
      return NextResponse.redirect(signinUrl);
    }

    // Forward ALL Set-Cookie headers from backend to the browser
    // (backend sets both accessToken and refreshToken)
    const response = NextResponse.redirect(new URL(redirect, req.url));
    
    // getSetCookie() returns an array of individual cookie strings
    const setCookies = res.headers.getSetCookie();
    setCookies.forEach(cookie => {
      response.headers.append("Set-Cookie", cookie);
    });

    return response;
  } catch (error) {
    console.error("[Refresh API Route] Error:", error);
    const signinUrl = new URL("/auth/signin", req.url);
    signinUrl.searchParams.set("reason", "error");
    return NextResponse.redirect(signinUrl);
  }
}

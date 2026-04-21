import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  // Define route types
  const isAuthPage = pathname.startsWith("/auth");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/interview-setup") ||
    pathname.startsWith("/interview-room") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/interview");

  const isLandingPage = pathname === "/";

  // Logic to handle Auth Probe and Silent Refresh
  let user = null;
  let wasRefreshed = false;
  const responseHeaders = new Headers();
  const requestHeaders = new Headers(request.headers);

  if (!isAuthPage && (accessToken || refreshToken)) {
    try {
      let shouldRefresh = !accessToken;

      if (accessToken) {
        // Check session validity and get user data in one call
        const probeRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}user/me`,
          {
            headers: {
              Cookie: `accessToken=${accessToken}`,
              Accept: "application/json",
            },
          },
        );

        if (probeRes.ok) {
          const data = await probeRes.json();
          user = data.user;
        } else if (probeRes.status === 401 && refreshToken) {
          shouldRefresh = true;
          console.log(
            "[Middleware] Auth probe failed (401). Attempting refresh...",
          );
        }
      }

      if (shouldRefresh && refreshToken) {
        if (!accessToken)
          console.log(
            "[Middleware] Access token missing. Attempting refresh...",
          );

        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}auth/refresh-token`,
          {
            method: "POST",
            headers: {
              Cookie: `refreshToken=${refreshToken}`,
              Accept: "application/json",
            },
          },
        );

        if (refreshRes.ok) {
          const setCookieHeaders = refreshRes.headers.getSetCookie();
          setCookieHeaders.forEach((cookie) => {
            responseHeaders.append("Set-Cookie", cookie);
          });

          // Extract the new access token to perform a second probe
          const newAccessToken = setCookieHeaders
            .find((c) => c.startsWith("accessToken="))
            ?.split(";")[0]
            ?.split("=")[1];

          if (newAccessToken) {
            accessToken = newAccessToken;
            wasRefreshed = true;

            //  Get user data with the NEW token
            const secondProbeRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}user/me`,
              {
                headers: {
                  Cookie: `accessToken=${accessToken}`,
                  Accept: "application/json",
                },
              },
            );
            if (secondProbeRes.ok) {
              const data = await secondProbeRes.json();
              user = data.user;
              console.log("[Middleware] Refresh and probe successful.");
            }
          }
        }
      }
    } catch (err) {
      console.error("[Middleware] Auth probe/refresh error:", err);
    }
  }

  // Data Filtering & Header Injection
  if (user) {
    // Strip heavy fields (like resume) to avoid header size issues
    const { resume, ...lightUser } = user;

    // Use btoa safely for potential unicode in names
    const encodedUser = btoa(encodeURIComponent(JSON.stringify(lightUser)));
    requestHeaders.set("x-user-data", encodedUser);
  }

  const hasSession = accessToken || refreshToken;

  // Redirect logic
  // [DISABLED FOR PRODUCTION CROSS-DOMAIN SUPPORT]
  // In cross-domain setups, the middleware cannot see the accessToken cookie.
  // We move redirect logic to the client-side AuthWrapper.
  /*
  if (isProtectedRoute && !hasSession) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  */

  if ((isAuthPage || isLandingPage) && hasSession) {
    if (
      !pathname.includes("/auth/verify-email") &&
      !pathname.includes("/auth/reset-password")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Final Response Generation
  // If we have an accessToken refreshed or original, update the request's
  // headers so that downstream SSR calls via apiServer see it immediately.
  if (accessToken) {
    // Update standard Cookie header
    const currentCookie = request.headers.get("cookie") || "";
    const cookiesArray = currentCookie
      .split(";")
      .filter((c) => !c.trim().startsWith("accessToken="));
    cookiesArray.push(`accessToken=${accessToken}`);
    requestHeaders.set("cookie", cookiesArray.join("; "));

    //  Provide the dedicated fallback header for apiServer
    requestHeaders.set("x-middleware-access-token", accessToken);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Append any Set-Cookie headers from the refresh call for the browser
  responseHeaders.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      response.headers.append(key, value);
    }
  });

  if (wasRefreshed && accessToken) {
    response.cookies.set("accessToken", accessToken);
  }

  return response;
}

// Specify routes that should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .png, .svg (images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};

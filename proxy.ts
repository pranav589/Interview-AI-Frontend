import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/profile', '/interview', '/interview-setup', '/interview-room'];
const AUTH_ROUTES = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  // 1. Unauthenticated user trying to access protected route
  if (isProtectedRoute && !accessToken && !refreshToken) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // 2. Authenticated user trying to access auth pages (login/signup)
  if (isAuthRoute && (accessToken || refreshToken)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Probing the backend to seed user data if we have a session
  // This avoids a flash of "unauthenticated" on the client during hydration.
  let response = NextResponse.next();

  if (accessToken || refreshToken) {
    try {
        // We make a lightweight call to /user/me to get user info.
        // The browser's cookies are forwarded by apiServer/fetch in the background
        // because they are now same-site.
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1/";
        const userRes = await fetch(`${API_URL}user/me`, {
          headers: {
            'Cookie': request.cookies.toString()
          }
        });

        if (userRes.ok) {
          const { user } = await userRes.json();
          // Inject user data into a header so RootLayout can read it instantly
          const userData = btoa(encodeURIComponent(JSON.stringify(user)));
          response.headers.set('x-user-data', userData);
        }
    } catch (e) {
        // Silently fail, client-side AuthProvider will handle it
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

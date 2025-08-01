import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protected routes - require authentication
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/account')) {
    if (!token) {
      // Store the requested URL for redirect after login
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Auth routes - redirect to dashboard if already logged in
  if (token && (
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname === '/verify' ||
    pathname === '/'
  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/sign-in',
    '/sign-up',
    '/verify',
    '/'
  ]
};
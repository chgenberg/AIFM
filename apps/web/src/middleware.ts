import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const REQUIRED_PASSWORD = 'AIFM';
const GATE_COOKIE_NAME = 'aifm_gate_access';
const GATE_COOKIE_VALUE = 'granted';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip password gate check for password-gate page itself and API routes
  if (pathname.startsWith('/password-gate') || pathname.startsWith('/api/password-gate')) {
    return NextResponse.next();
  }

  // Check if user has passed password gate
  const gateAccess = request.cookies.get(GATE_COOKIE_NAME)?.value;

  if (gateAccess !== GATE_COOKIE_VALUE) {
    // Redirect to password gate
    const gateUrl = new URL('/password-gate', request.url);
    gateUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(gateUrl);
  }

  // Existing auth check for protected routes
  const session = await auth();
  const protectedRoutes = ['/admin', '/coordinator', '/specialist'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)'],
};

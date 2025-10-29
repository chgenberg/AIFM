import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Protected routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/coordinator') || pathname.startsWith('/specialist')) {
      if (!token) {
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const publicRoutes = ['/', '/sign-in', '/api/ai/process', '/api/ai/report'];
        return publicRoutes.includes(req.nextUrl.pathname) || !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

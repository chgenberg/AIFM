import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple route matching function
function matchesPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    const regexPattern = pattern
      .replace(/\(\.\*\)/g, '.*')
      .replace(/\//g, '\\/')
      .replace(/\./g, '\\.');
    const regex = new RegExp(`^${regexPattern}`);
    return regex.test(pathname);
  });
}

const publicRoutes = ['/', '/sign-in', '/sign-up', '/api/webhooks'];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Allow public routes without authentication
  if (matchesPattern(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  // For now, allow all other routes to pass through
  // Clerk authentication is handled at the component level via useAuth()
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/sign-in/[[...sign-in]]',
    '/sign-up/[[...sign-up]]',
    '/api/ai/process',
    '/api/ai/report',
  ],
  ignoredRoutes: ['/api/health'],
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/(api|trpc)(.*)',
  ],
};

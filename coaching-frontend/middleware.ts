import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Public routes - home page is public, no redirect to login
  const isHomePage = path === '/';
  const isLoginPage = path === '/login';
  const isRegisterPage = path === '/register';
  const isPublicRoute = isHomePage || isLoginPage || isRegisterPage;

  // If accessing a protected route without token, redirect to login
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access to login/register pages even with token (user might want to switch accounts)
  // Only redirect if explicitly needed - for now, allow access

  return NextResponse.next();
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


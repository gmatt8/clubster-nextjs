// apps/web-customer/middleware.js

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, origin } = request.nextUrl;

  // Rotte pubbliche accessibili anche da non loggati
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/privacy-policy',
    '/terms-of-service',
    '/support',
    '/basket',
    '/club-details',
  ];

  const isPublicPath = publicPaths.includes(pathname);

  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.css') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);

  if (!session && !isPublicPath && !isStaticAsset) {
    return NextResponse.redirect(`${origin}/login`);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

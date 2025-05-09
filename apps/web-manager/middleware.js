// apps/web-manager/middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, origin } = request.nextUrl;

  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/privacy-policy',
    '/terms-of-service',
  ];

  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|css|js)$/i);

  const isPublicPath = publicPaths.includes(pathname);

  // Se non è loggato e sta cercando di accedere a una pagina privata
  if (!session && !isPublicPath && !isStaticAsset) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // SE è loggato ma NON ha ancora un club
  if (session && !isPublicPath && !isStaticAsset && pathname !== '/verify-club') {
    const {
      data: club,
      error: clubError,
    } = await supabase
      .from('clubs')
      .select('id')
      .eq('manager_id', session.user.id)
      .single();

    // Se non ha club e sta cercando di accedere a qualcosa che NON sia /verify-club
    if (!club && (!pathname.startsWith('/verify-club'))) {
      return NextResponse.redirect(`${origin}/verify-club`);
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

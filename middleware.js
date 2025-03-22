// middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Recupera la sessione
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, origin } = request.nextUrl;

  // Applica la logica solo se siamo in /dashboard/manager
  if (pathname.startsWith('/dashboard/manager')) {
    // Se non c'è sessione, reindirizza al login manager
    if (!session) {
      return NextResponse.redirect(`${origin}/auth/manager/login`);
    }

    // Se l'utente è già su /dashboard/manager/verify-club,
    // NON forzare di nuovo il check del club, così eviti il loop
    if (pathname === '/dashboard/manager/verify-club') {
      // Lasciamo passare
      return res;
    }

    // Per tutte le altre pagine manager, controlla se il club esiste
    const { data: clubData, error: clubError } = await supabase
      .from('clubs')
      .select('id')
      .eq('manager_id', session.user.id)
      .maybeSingle();

    // Se non esiste un record in clubs, reindirizza a verify-club
    if (!clubData) {
      return NextResponse.redirect(`${origin}/dashboard/manager/verify-club`);
    }
  }

  // Se tutto ok, lascia passare la richiesta
  return res;
}

export const config = {
  matcher: ['/dashboard/manager/:path*'],
};

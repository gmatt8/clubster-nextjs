export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  // Crea un client Supabase lato server che legge i cookie di auth
  const supabase = createRouteHandlerClient({ cookies });

  // Recupera l'utente loggato
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // Se non c'è utente loggato, restituisci errore
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // managerId corrisponde a user.id
  const managerId = user.id;

  console.log('STRIPE_CLIENT_ID:', process.env.STRIPE_CLIENT_ID);
  console.log('REDIRECT_URI:', process.env.NEXT_PUBLIC_STRIPE_REDIRECT_URI);
  console.log('STATE (managerId):', managerId);

  // Costruisci i parametri
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.STRIPE_CLIENT_ID,
    scope: 'read_write',
    redirect_uri: process.env.NEXT_PUBLIC_STRIPE_REDIRECT_URI,
    state: managerId, // Passiamo managerId in state
  });

  const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

  // Restituiamo l’URL in formato JSON
  return NextResponse.json({ url: stripeOAuthUrl });
}

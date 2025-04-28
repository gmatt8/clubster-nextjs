// app/api/stripe/onboarding/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createServerSupabase } from "@lib/supabase-server";

export async function GET(request) {
  // Crea un client Supabase lato server che legge i cookie di auth
  const supabase = await createServerSupabase();
  
  // Recupera l'utente loggato
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const managerId = user.id;
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.STRIPE_CLIENT_ID,
    scope: 'read_write',
    redirect_uri: process.env.NEXT_PUBLIC_STRIPE_REDIRECT_URI,
    state: managerId,
  });
  const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
  return NextResponse.json({ url: stripeOAuthUrl });
}

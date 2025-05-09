
// app/api/stripe/callback/route.js
export const dynamic = "force-dynamic";

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabase } from "@lib/supabase-server";

export async function POST(request) {
  // Inizializza il client Supabase nel contesto della richiesta
  const supabaseAdmin = await createServerSupabase();

  try {
    const { code, managerId } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }
    if (!managerId) {
      return NextResponse.json({ error: 'Missing managerId' }, { status: 400 });
    }

    // Parametri per scambiare il code con i token di Stripe
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.STRIPE_CLIENT_ID);
    params.append('client_secret', process.env.STRIPE_SECRET_KEY);
    params.append('code', code);

    const stripeRes = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      body: params,
    });
    const data = await stripeRes.json();
    if (!stripeRes.ok) {
      console.error('Errore Stripe OAuth:', data);
      return NextResponse.json(
        { error: data.error_description || 'OAuth exchange failed' },
        { status: 400 }
      );
    }

    const { stripe_user_id } = data;
    if (!stripe_user_id) {
      return NextResponse.json({ error: 'No stripe_user_id in response' }, { status: 400 });
    }

    // Aggiorna la tabella clubs (dove manager_id = managerId)
    const { error: dbError } = await supabaseAdmin
      .from('clubs')
      .update({
        stripe_account_id: stripe_user_id,
        stripe_status: 'active',
      })
      .eq('manager_id', managerId);

    if (dbError) {
      console.error('DB Update Error:', dbError);
      return NextResponse.json({ error: 'DB update error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, stripe_user_id });
  } catch (err) {
    console.error('CATCH /api/stripe/callback =>', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

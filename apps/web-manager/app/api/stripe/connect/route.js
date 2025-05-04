// app/api/stripe/connect/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  });

  // genera link di onboarding
  return NextResponse.json({ ok: true });
}

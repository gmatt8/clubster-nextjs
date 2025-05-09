// apps/web-manager/app/api/stripe/account-info/route.js

import Stripe from "stripe";
import { createServerSupabase } from "@lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: club, error } = await supabase
    .from("clubs")
    .select("stripe_account_id")
    .eq("manager_id", user.id)
    .single();

  if (error || !club?.stripe_account_id) {
    return NextResponse.json({ error: "No Stripe account found" }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });

  try {
    const account = await stripe.accounts.retrieve(club.stripe_account_id);

    return NextResponse.json({
      email: account.email,
      business_name: account.business_profile?.name || null,
      individual_name: account.individual
        ? `${account.individual.first_name} ${account.individual.last_name}`
        : null,
    });
  } catch (err) {
    console.error("Stripe account fetch error:", err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}

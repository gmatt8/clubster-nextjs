// app/api/checkout/route.js
export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { createServerSupabase } from "@lib/supabase-server";
import { NextResponse } from "next/server";

function generateCustomBookingId(totalLength = 10) {
  const prefix = "B";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const randomPartLength = totalLength - prefix.length;
  for (let i = 0; i < randomPartLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return prefix + result;
}

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });

  try {
    const { eventId, ticketCategoryId, quantity } = await request.json();

    const supabase = await createServerSupabase();

    const { data: ticketCat, error: tcError } = await supabase
      .from("ticket_categories")
      .select("price, event_id, available_tickets")
      .eq("id", ticketCategoryId)
      .single();
    if (tcError || !ticketCat || ticketCat.available_tickets < quantity) {
      return NextResponse.json({ error: "Ticket category not available" }, { status: 400 });
    }

    const { data: eventData, error: evError } = await supabase
      .from("events")
      .select("club_id")
      .eq("id", eventId)
      .single();
    if (evError || !eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 400 });
    }

    const { data: clubData, error: clubError } = await supabase
      .from("clubs")
      .select("stripe_account_id")
      .eq("id", eventData.club_id)
      .single();
    if (clubError || !clubData) {
      return NextResponse.json({ error: "Club not found or not linked to Stripe" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const bookingId = generateCustomBookingId();
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          id: bookingId,
          user_id: user.id,
          event_id: eventId,
          quantity,
          status: "pending",
        },
      ])
      .select()
      .single();
    if (bookingError || !bookingData) {
      return NextResponse.json({ error: "Error creating booking" }, { status: 400 });
    }

    const unitPrice = Math.round(ticketCat.price * 100);
    const totalPrice = unitPrice * quantity;
    const applicationFeeAmount = Math.round(totalPrice * 0.05);

    const session = await stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price_data: {
              currency: "chf",
              product_data: { name: "Event ticket" },
              unit_amount: unitPrice,
            },
            quantity,
          },
        ],
        mode: "payment",
        metadata: {
          user_id: user.id,
          event_id: eventId,
          quantity: quantity.toString(),
          booking_id: bookingData.id,
          ticket_category_id: ticketCategoryId,
        },
        payment_intent_data: {
          metadata: {
            user_id: user.id,
            event_id: eventId,
            quantity: quantity.toString(),
            booking_id: bookingData.id,
            ticket_category_id: ticketCategoryId,
          },
          application_fee_amount: applicationFeeAmount,
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?booking_id=${bookingData.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
        expand: ["payment_intent"],
      },
      {
        stripeAccount: clubData.stripe_account_id,
      }
    );

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

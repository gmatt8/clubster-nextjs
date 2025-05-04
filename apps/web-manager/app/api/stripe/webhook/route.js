// app/api/stripe/webhook/route.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Crea il client admin per bypassare RLS
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateCustomTicketId(totalLength = 10) {
  const prefix = "T";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const randomPartLength = totalLength - prefix.length;
  for (let i = 0; i < randomPartLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return prefix + result;
}

export async function POST(request) {
  console.log("[Webhook] Received POST request");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });

  const sig = request.headers.get("stripe-signature");
  const buf = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("[Webhook] Event verified:", event.id);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency check
  const { data: existingEvent, error: insertError } = await supabaseAdmin
    .from("processed_webhook_events")
    .insert([{ event_id: event.id }])
    .select()
    .single();
  if (insertError) {
    console.log("[Webhook] Event already processed or error:", insertError.message);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Estratti metadati
    let metadata = session.metadata;
    if (session.payment_intent && typeof session.payment_intent === "string") {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent,
          event.account ? { stripeAccount: event.account } : {}
        );
        metadata = paymentIntent.metadata || metadata;
      } catch (err) {
        console.warn("[Webhook] Could not retrieve PaymentIntent:", err.message);
      }
    }

    const userId = metadata?.user_id;
    const eventId = metadata?.event_id;
    const quantity = parseInt(metadata?.quantity || "1", 10);
    const bookingId = metadata?.booking_id;
    const ticketCategoryId = metadata?.ticket_category_id;

    if (!userId || !eventId) {
      return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
    }

    let finalBookingId = bookingId;

    // Se non esiste, creiamo un booking "di emergenza"
    if (!bookingId) {
      finalBookingId = `fallback-${Date.now()}`;
      const { error: bookingError } = await supabaseAdmin
        .from("bookings")
        .insert([
          {
            id: finalBookingId,
            user_id: userId,
            event_id: eventId,
            quantity,
            status: "pending",
          },
        ]);
      if (bookingError) {
        return NextResponse.json({ error: "Failed to insert fallback booking" }, { status: 400 });
      }
    }

    // Evita duplicazione se già esistono ticket per questo booking
    const { data: existingTickets } = await supabaseAdmin
      .from("tickets")
      .select("id")
      .eq("booking_id", finalBookingId);
    if (existingTickets?.length > 0) {
      console.log("[Webhook] Tickets already exist. Skipping.");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Aggiorna booking a "confirmed"
    await supabaseAdmin
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", finalBookingId);

    // Genera ticket
    const tickets = Array.from({ length: quantity }, (_, i) => ({
      id: generateCustomTicketId(),
      booking_id: finalBookingId,
      qr_data: `${finalBookingId}-${i}-${Date.now()}`,
    }));

    const { error: ticketError } = await supabaseAdmin
      .from("tickets")
      .insert(tickets);
    if (ticketError) {
      console.error("[Webhook] Error inserting tickets:", ticketError.message);
    }

    // Decrementa disponibilità
    if (ticketCategoryId) {
      const { data: category } = await supabaseAdmin
        .from("ticket_categories")
        .select("available_tickets")
        .eq("id", ticketCategoryId)
        .single();
      if (category) {
        const newAvailable = category.available_tickets - quantity;
        if (newAvailable >= 0) {
          await supabaseAdmin
            .from("ticket_categories")
            .update({ available_tickets: newAvailable })
            .eq("id", ticketCategoryId);
        }
      }
    }
  } else {
    console.log("[Webhook] Event type unhandled:", event.type);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

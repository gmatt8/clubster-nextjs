// app/api/stripe/webhook/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const api = { bodyParser: false };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Crea il client admin con la SERVICE_ROLE_KEY per bypassare le restrizioni RLS
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
  const sig = request.headers.get("stripe-signature");
  const buf = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log("Stripe event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Full session object:", JSON.stringify(session));

    let metadata = {};
    if (typeof session.payment_intent === "string") {
      const connectedAccountId = event.account;
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent,
          { stripeAccount: connectedAccountId }
        );
        metadata = paymentIntent.metadata;
        console.log("Retrieved PaymentIntent metadata:", JSON.stringify(metadata));
      } catch (err) {
        console.error("Error retrieving PaymentIntent:", err);
      }
    } else {
      metadata = session.payment_intent.metadata;
      console.log("Using embedded metadata:", JSON.stringify(metadata));
    }

    const userId = metadata?.user_id;
    const eventId = metadata?.event_id;
    const quantity = parseInt(metadata?.quantity, 10) || 1;

    if (!userId || !eventId) {
      console.error("Missing required metadata:", JSON.stringify(metadata));
      return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
    }

    let bookingId = metadata.booking_id;
    if (!bookingId) {
      const fallbackBookingId = "fallback-" + Date.now();
      const { data: bookingData, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .insert([
          {
            id: fallbackBookingId,
            user_id: userId,
            event_id: eventId,
            quantity,
            status: "pending"
          }
        ])
        .select()
        .single();
      if (bookingError || !bookingData) {
        console.error("Error inserting fallback booking:", bookingError);
        return NextResponse.json({ error: "Error inserting booking" }, { status: 400 });
      } else {
        bookingId = bookingData.id;
        console.log("Fallback booking created:", JSON.stringify(bookingData));
      }
    } else {
      console.log("Booking ID provided in metadata:", bookingId);
    }

    // Aggiorna lo status del booking a "confirmed"
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId)
      .select();
    if (updateError) {
      console.error("Error updating booking status:", updateError);
    } else {
      console.log("Booking updated to confirmed:", JSON.stringify(updateData));
    }

    // Genera e inserisci i ticket
    const ticketsToInsert = [];
    for (let i = 0; i < quantity; i++) {
      const ticketId = generateCustomTicketId();
      const qrData = `${bookingId}-${i}-${Date.now()}`;
      ticketsToInsert.push({
        id: ticketId,
        booking_id: bookingId,
        qr_data: qrData,
      });
    }
    console.log("Tickets to insert:", ticketsToInsert);

    const { data: ticketsData, error: ticketsError } =
      await supabaseAdmin.from("tickets").insert(ticketsToInsert).select();
    if (ticketsError) {
      console.error("Error inserting tickets:", ticketsError);
    } else {
      console.log("Tickets created:", JSON.stringify(ticketsData));
    }

    // Aggiorna la ticket category decrementando i biglietti disponibili
    const ticketCategoryId = metadata.ticket_category_id;
    if (ticketCategoryId) {
      const { data: tcData, error: tcError } = await supabaseAdmin
        .from("ticket_categories")
        .select("available_tickets")
        .eq("id", ticketCategoryId)
        .single();
      if (tcError || !tcData) {
        console.error("Error fetching ticket category:", tcError);
      } else {
        const newAvailable = tcData.available_tickets - quantity;
        if (newAvailable < 0) {
          console.error("Not enough tickets available. Current available:", tcData.available_tickets);
        } else {
          const { data: updateTCData, error: updateTCError } = await supabaseAdmin
            .from("ticket_categories")
            .update({ available_tickets: newAvailable })
            .eq("id", ticketCategoryId)
            .select();
          if (updateTCError) {
            console.error("Error updating ticket category:", updateTCError);
          } else {
            console.log("Ticket category updated, new available_tickets:", newAvailable);
          }
        }
      }
    } else {
      console.warn("No ticket_category_id found in metadata.");
    }
  } else {
    console.warn(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

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
  const ticketId = prefix + result;
  console.log("[Webhook] Generated Ticket ID:", ticketId);
  return ticketId;
}

export async function POST(request) {
  console.log("[Webhook] Received POST request");
  const sig = request.headers.get("stripe-signature");
  const buf = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("[Webhook] Event constructed successfully.");
  } catch (err) {
    console.error("[Webhook] Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log("[Webhook] Stripe event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("[Webhook] Full session object:", JSON.stringify(session));

    // Estrazione dei metadata
    let metadata;
    if (session.payment_intent) {
      if (typeof session.payment_intent === "string") {
        try {
          // Se si tratta di un Connect event, event.account conterrà l'ID dell'account del manager
          const params = event.account ? { stripeAccount: event.account } : {};
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, params);
          metadata = paymentIntent.metadata;
          console.log("[Webhook] Retrieved metadata from PaymentIntent:", JSON.stringify(metadata));
        } catch (error) {
          console.error("[Webhook] Error retrieving PaymentIntent. Falling back to session.metadata. Error:", error.message);
          metadata = session.metadata;
        }
      } else if (typeof session.payment_intent === "object") {
        metadata = session.payment_intent.metadata;
      }
    } else {
      metadata = session.metadata;
    }

    console.log("[Webhook] Final metadata used:", JSON.stringify(metadata));

    const userId = metadata?.user_id;
    const eventId = metadata?.event_id;
    const quantity = parseInt(metadata?.quantity, 10) || 1;

    console.log("[Webhook] Metadata values:", { userId, eventId, quantity });

    if (!userId || !eventId) {
      console.error("[Webhook] Missing required metadata:", JSON.stringify(metadata));
      return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
    }

    let bookingId = metadata.booking_id;
    console.log("[Webhook] Booking ID from metadata:", bookingId);
    if (!bookingId) {
      // Fallback in caso manchi il booking_id
      const fallbackBookingId = "fallback-" + Date.now();
      console.log("[Webhook] No booking_id provided, using fallback:", fallbackBookingId);
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
        console.error("[Webhook] Error inserting fallback booking:", bookingError);
        return NextResponse.json({ error: "Error inserting booking" }, { status: 400 });
      } else {
        bookingId = bookingData.id;
        console.log("[Webhook] Fallback booking created:", JSON.stringify(bookingData));
      }
    } else {
      console.log("[Webhook] Booking ID provided:", bookingId);
    }

    // Controlla lo stato del booking PRIMA dell'update
    const { data: preUpdateData, error: preUpdateError } = await supabaseAdmin
      .from("bookings")
      .select("id, status")
      .eq("id", bookingId);
    console.log("[Webhook] Booking BEFORE update:", preUpdateData, preUpdateError);
    if (!preUpdateData || preUpdateData.length === 0) {
      console.error("[Webhook] No booking found with id:", bookingId);
      return NextResponse.json({ error: "Booking not found" }, { status: 400 });
    }

    // Aggiorna lo status del booking a "confirmed"
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId)
      .select();
    console.log("[Webhook] updateData:", updateData);
    console.log("[Webhook] updateError:", updateError);

    if (updateError) {
      console.error("[Webhook] Error updating booking status:", updateError);
    } else {
      console.log("[Webhook] Booking updated to confirmed:", JSON.stringify(updateData));
    }

    // Verifica lo stato DOPO l'update
    const { data: postUpdateData, error: postUpdateError } = await supabaseAdmin
      .from("bookings")
      .select("id, status")
      .eq("id", bookingId);
    console.log("[Webhook] Booking AFTER update:", postUpdateData, postUpdateError);

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
    console.log("[Webhook] Tickets to insert:", ticketsToInsert);

    const { data: ticketsData, error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .insert(ticketsToInsert)
      .select();
    if (ticketsError) {
      console.error("[Webhook] Error inserting tickets:", ticketsError);
    } else {
      console.log("[Webhook] Tickets created:", JSON.stringify(ticketsData));
    }

    // Aggiorna la ticket category decrementando i biglietti disponibili
    const ticketCategoryId = metadata.ticket_category_id;
    console.log("[Webhook] ticket_category_id from metadata:", ticketCategoryId);
    if (ticketCategoryId) {
      const { data: tcData, error: tcError } = await supabaseAdmin
        .from("ticket_categories")
        .select("available_tickets")
        .eq("id", ticketCategoryId)
        .single();
      console.log("[Webhook] Ticket category data:", tcData, "Error:", tcError);
      if (tcError || !tcData) {
        console.error("[Webhook] Error fetching ticket category:", tcError);
      } else {
        const newAvailable = tcData.available_tickets - quantity;
        console.log("[Webhook] New available tickets calculated:", newAvailable);
        if (newAvailable < 0) {
          console.error("[Webhook] Not enough tickets available. Current available:", tcData.available_tickets);
        } else {
          const { data: updateTCData, error: updateTCError } = await supabaseAdmin
            .from("ticket_categories")
            .update({ available_tickets: newAvailable })
            .eq("id", ticketCategoryId)
            .select();
          if (updateTCError) {
            console.error("[Webhook] Error updating ticket category:", updateTCError);
          } else {
            console.log("[Webhook] Ticket category updated, new available_tickets:", newAvailable, updateTCData);
          }
        }
      }
    } else {
      console.warn("[Webhook] No ticket_category_id found in metadata.");
    }
  } else {
    console.warn("[Webhook] Unhandled event type:", event.type);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// app/api/stripe/webhook/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Crea il client admin con la SERVICE_ROLE_KEY per bypassare le restrizioni RLS
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    // Recupera i metadati dal PaymentIntent
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
    }

    const userId = metadata?.user_id;
    const eventId = metadata?.event_id;
    const quantity = parseInt(metadata?.quantity, 10) || 1;

    if (!userId || !eventId) {
      console.error(
        "Missing metadata in PaymentIntent metadata",
        JSON.stringify(metadata)
      );
    } else {
      let bookingId;
      // Se esiste già un booking_id nei metadata, lo utilizziamo
      if (metadata.booking_id) {
        bookingId = metadata.booking_id;
        console.log("Using existing booking_id from metadata:", bookingId);
      } else {
        // Fallback: se non c'è booking_id, creiamo un nuovo booking (scenario non ideale)
        const bookingNumber = `BK${Date.now()}`;
        const { data: bookingData, error: bookingError } = await supabaseAdmin
          .from("bookings")
          .insert([
            {
              user_id: userId,
              event_id: eventId,
              quantity,
              booking_number: bookingNumber,
            },
          ])
          .select()
          .single();

        if (bookingError || !bookingData) {
          console.error("Error inserting booking:", JSON.stringify(bookingError));
          return NextResponse.json({ error: "Error inserting booking" }, { status: 400 });
        } else {
          bookingId = bookingData.id;
          console.log("Booking created:", JSON.stringify(bookingData));
        }
      }

      // Crea l'array dei ticket da inserire per il booking corretto
      const ticketsToInsert = [];
      for (let i = 0; i < quantity; i++) {
        const qrData = `${bookingId}-${i}-${Date.now()}`;
        ticketsToInsert.push({
          booking_id: bookingId,
          qr_data: qrData,
        });
      }
      console.log("Tickets to insert:", ticketsToInsert);

      // Inserisci i ticket nel database
      const { data: ticketsData, error: ticketsError } =
        await supabaseAdmin.from("tickets").insert(ticketsToInsert).select();
      if (ticketsError) {
        console.error("Error inserting tickets:", JSON.stringify(ticketsError));
      } else {
        console.log("Tickets created:", JSON.stringify(ticketsData));
      }

      // ** Aggiorna la ticket category decrementando available_tickets **
      const ticketCategoryId = metadata.ticket_category_id;
      if (ticketCategoryId) {
        // Recupera l'attuale quantità disponibile
        const { data: tcData, error: tcError } = await supabaseAdmin
          .from("ticket_categories")
          .select("available_tickets")
          .eq("id", ticketCategoryId)
          .single();
        if (tcError || !tcData) {
          console.error("Error fetching ticket category:", tcError);
        } else {
          const newAvailable = tcData.available_tickets - quantity;
          // Aggiorna solo se newAvailable è >= 0, altrimenti potresti voler gestire lo scenario sold out
          if(newAvailable < 0) {
            console.error("Not enough tickets available in this category");
          } else {
            const { data: updateData, error: updateError } = await supabaseAdmin
              .from("ticket_categories")
              .update({ available_tickets: newAvailable })
              .eq("id", ticketCategoryId);
            if (updateError) {
              console.error("Error updating ticket category:", updateError);
            } else {
              console.log("Ticket category updated, new available_tickets:", newAvailable);
            }
          }
        }
      } else {
        console.warn("No ticket_category_id found in metadata.");
      }
    }
  } else {
    console.warn(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

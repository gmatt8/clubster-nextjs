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

// Crea il client admin con la Service Role Key per bypassare le restrizioni RLS
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const sig = request.headers.get("stripe-signature");
  const buf = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
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
      console.error("Missing metadata in PaymentIntent metadata", JSON.stringify(metadata));
    } else {
      // Genera un booking number
      const bookingNumber = `BK${Date.now()}`;

      // Inserisci la booking nel database
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

      if (bookingError) {
        console.error("Error inserting booking:", JSON.stringify(bookingError));
      } else {
        console.log("Booking created:", JSON.stringify(bookingData));

        // Genera N ticket per la booking
        const ticketsToInsert = [];
        for (let i = 0; i < quantity; i++) {
          // Genera un dato QR univoco, ad esempio combinando booking_id, indice e timestamp
          const qrData = `${bookingData.id}-${i}-${Date.now()}`;
          ticketsToInsert.push({
            booking_id: bookingData.id,
            qr_data: qrData,
          });
        }
        const { data: ticketsData, error: ticketsError } = await supabaseAdmin
          .from("tickets")
          .insert(ticketsToInsert)
          .select();
        if (ticketsError) {
          console.error("Error inserting tickets:", JSON.stringify(ticketsError));
        } else {
          console.log("Tickets created:", JSON.stringify(ticketsData));
        }
      }
    }
  } else {
    console.warn(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

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
    
    // Log completo della sessione per debug
    console.log("Full session object:", JSON.stringify(session));
    
    // Log dei metadata
    console.log("Session metadata:", JSON.stringify(session.metadata));

    // Estrai i metadati dalla sessione
    const userId = session.metadata?.user_id;
    const eventId = session.metadata?.event_id;
    const quantity = parseInt(session.metadata?.quantity, 10) || 1;

    if (!userId || !eventId) {
      console.error("Missing metadata in session", JSON.stringify(session.metadata));
    } else {
      // Genera un booking number
      const bookingNumber = `BK${Date.now()}`;

      // Inserisci il booking nel database
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
      }
    }
  } else {
    console.warn(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// app/api/checkout/route.js
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function generateCustomBookingId(totalLength = 10) {
  const prefix = "B";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const randomPartLength = totalLength - prefix.length;
  for (let i = 0; i < randomPartLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const bookingId = prefix + result;
  console.log("[Checkout] Generated Booking ID:", bookingId);
  return bookingId;
}

export async function POST(request) {
  console.log("[Checkout] Received POST request");
  try {
    const { eventId, ticketCategoryId, quantity } = await request.json();
    console.log("[Checkout] Request payload:", { eventId, ticketCategoryId, quantity });

    const supabase = await createServerSupabase();

    // Recupera ticket category
    const { data: ticketCat, error: tcError } = await supabase
      .from("ticket_categories")
      .select("price, event_id, available_tickets")
      .eq("id", ticketCategoryId)
      .single();
    console.log("[Checkout] Ticket category data:", ticketCat, "Error:", tcError);
    if (tcError || !ticketCat) {
      return NextResponse.json({ error: "Ticket category not found" }, { status: 400 });
    }
    if (ticketCat.available_tickets < quantity) {
      return NextResponse.json({ error: "Not enough available tickets" }, { status: 400 });
    }

    // Recupera i dettagli dell'evento (in particolare il club_id)
    const { data: eventData, error: evError } = await supabase
      .from("events")
      .select("club_id")
      .eq("id", eventId)
      .single();
    console.log("[Checkout] Event data:", eventData, "Error:", evError);
    if (evError || !eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 400 });
    }

    // Recupera il club e il suo Stripe Account
    const { data: clubData, error: clubError } = await supabase
      .from("clubs")
      .select("stripe_account_id")
      .eq("id", eventData.club_id)
      .single();
    console.log("[Checkout] Club data:", clubData, "Error:", clubError);
    if (clubError || !clubData) {
      return NextResponse.json({ error: "Club not found or not linked to Stripe" }, { status: 400 });
    }

    // Recupera l'utente loggato
    const { data: { user } } = await supabase.auth.getUser();
    console.log("[Checkout] Authenticated user:", user);
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Crea record di booking usando esclusivamente il booking ID
    const bookingId = generateCustomBookingId();
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          id: bookingId,
          user_id: user.id,
          event_id: eventId,
          quantity,
          status: "pending"
        }
      ])
      .select()
      .single();
    console.log("[Checkout] Booking creation result:", bookingData, "Error:", bookingError);
    if (bookingError || !bookingData) {
      console.error("[Checkout] Booking creation error:", bookingError);
      return NextResponse.json({ error: "Error creating booking" }, { status: 400 });
    }

    // Calcola il prezzo totale (in centesimi)
    const unitPrice = Math.round(ticketCat.price * 100);
    const totalPrice = unitPrice * quantity;
    console.log("[Checkout] Calculated total price (cents):", totalPrice);

    // Crea sessione Checkout su Stripe
    console.log("[Checkout] Creating Stripe Checkout session...");
    const session = await stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price_data: {
              currency: "chf",
              product_data: {
                name: "Event ticket",
              },
              unit_amount: unitPrice,
            },
            quantity,
          },
        ],
        mode: "payment",
        // Aggiungi metadata a livello di sessione
        metadata: {
          user_id: user.id,
          event_id: eventId,
          quantity: quantity.toString(),
          booking_id: bookingData.id, // Booking ID generato
          ticket_category_id: ticketCategoryId,
        },
        payment_intent_data: {
          application_fee_amount: 200,
          // Puoi omettere i metadata qui se li passi già a livello di sessione
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/customer/checkout/success?booking_id=${bookingData.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/customer/checkout/cancel`,
        expand: ["payment_intent"],
      },
      {
        stripeAccount: clubData.stripe_account_id,
      }
    );
    
    console.log("[Checkout] Stripe session created:", session);

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("[Checkout] Error in /api/checkout:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// app/api/checkout/route.js
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Funzione per generare un Booking ID personalizzato con prefisso "B"
 * (es. "BJK6X78UUN" se totalLength è 10)
 */
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
  try {
    // 1) Recupera i dati dal body
    const { eventId, ticketCategoryId, quantity } = await request.json();

    // 2) Recupera i dettagli dell'evento e della ticket category dal DB
    const supabase = await createServerSupabase();
    const { data: ticketCat, error: tcError } = await supabase
      .from("ticket_categories")
      .select("price, event_id, available_tickets")
      .eq("id", ticketCategoryId)
      .single();

    if (tcError || !ticketCat) {
      return NextResponse.json({ error: "Ticket category not found" }, { status: 400 });
    }

    // Controlla se i biglietti disponibili sono sufficienti
    if (ticketCat.available_tickets < quantity) {
      return NextResponse.json({ error: "Not enough available tickets" }, { status: 400 });
    }

    // Recupera l'ID dello Stripe account del manager tramite l'evento
    const { data: eventData, error: evError } = await supabase
      .from("events")
      .select("club_id")
      .eq("id", eventId)
      .single();
    if (evError || !eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 400 });
    }

    // Ottieni informazioni sul club
    const { data: clubData, error: clubError } = await supabase
      .from("clubs")
      .select("stripe_account_id")
      .eq("id", eventData.club_id)
      .single();
    if (clubError || !clubData) {
      return NextResponse.json({ error: "Club not found or not linked to Stripe" }, { status: 400 });
    }

    // Ottieni l'utente loggato
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // 2.1) Crea un record di booking provvisorio con status "pending"
    // Utilizza solo bookingId come identificatore univoco
    const bookingId = generateCustomBookingId();
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          id: bookingId,
          user_id: user.id,
          event_id: eventId,
          quantity,
          // Rimuovi booking_number
          status: "pending"
        },
      ])
      .select()
      .single();
    if (bookingError || !bookingData) {
      console.error("Booking creation error:", bookingError);
      return NextResponse.json({ error: "Error creating booking" }, { status: 400 });
    }

    // 3) Calcola il prezzo totale in centesimi
    const unitPrice = Math.round(ticketCat.price * 100);
    const totalPrice = unitPrice * quantity;

    // 4) Crea la sessione Checkout su Stripe includendo i metadata utili
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
        payment_intent_data: {
          application_fee_amount: 200,
          metadata: {
            user_id: user.id,
            event_id: eventId,
            quantity: quantity.toString(),
            booking_id: bookingData.id, // Passa il bookingId
            ticket_category_id: ticketCategoryId,
          },
        },
        // Success URL include il booking_id nella query string
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/customer/checkout/success?booking_id=${bookingData.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/customer/checkout/cancel`,
        expand: ["payment_intent"],
      },
      {
        stripeAccount: clubData.stripe_account_id,
      }
    );

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/checkout:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

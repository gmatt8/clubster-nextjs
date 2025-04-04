// app/api/checkout/route.js
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // 1) Recupera i dati dal body
    const { eventId, ticketCategoryId, quantity } = await request.json();

    // 2) Recupera i dettagli dell'evento e la ticket category dal DB
    const supabase = await createServerSupabase();
    const { data: ticketCat, error: tcError } = await supabase
      .from("ticket_categories")
      .select("price, event_id, available_tickets")
      .eq("id", ticketCategoryId)
      .single();
    if (tcError || !ticketCat) {
      return NextResponse.json({ error: "Ticket category not found" }, { status: 400 });
    }

    // (Opzionale: qui potresti controllare che available_tickets sia sufficiente)
    if(ticketCat.available_tickets < quantity) {
      return NextResponse.json({ error: "Not enough available tickets" }, { status: 400 });
    }

    // Recupera l'ID Stripe del manager tramite l'evento
    const { data: eventData, error: evError } = await supabase
      .from("events")
      .select("club_id")
      .eq("id", eventId)
      .single();
    if (evError || !eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 400 });
    }

    // Ottieni info sul club
    const { data: clubData, error: clubError } = await supabase
      .from("clubs")
      .select("stripe_account_id")
      .eq("id", eventData.club_id)
      .single();
    if (clubError || !clubData) {
      return NextResponse.json({ error: "Club not found or not linked to Stripe" }, { status: 400 });
    }

    // Ottieni l'ID dell'utente loggato
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // 2.1) Crea un record di booking provvisorio
    const bookingNumber = `BK${Date.now()}`;
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          user_id: user.id,
          event_id: eventId,
          quantity,
          booking_number: bookingNumber,
        },
      ])
      .select()
      .single();
    if (bookingError || !bookingData) {
      return NextResponse.json({ error: "Error creating booking" }, { status: 400 });
    }

    // 3) Calcola il prezzo totale (in centesimi)
    const unitPrice = Math.round(ticketCat.price * 100);
    const totalPrice = unitPrice * quantity;

    // 4) Crea la Checkout Session, includendo metadata utili (incluso booking_id e ticket_category_id)
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
            booking_id: bookingData.id, // Passiamo il booking_id creato in checkout
            ticket_category_id: ticketCategoryId, // Passiamo il ticketCategoryId
          },
        },
        // Success URL include il booking_id in query string
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

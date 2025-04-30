// apps/web-customer/app/api/invoice/route.js
import { createServerSupabase } from "@lib/supabase-server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("booking_id");

  if (!bookingId) {
    return new Response("Missing booking_id", { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("invoice_id")
    .eq("id", bookingId)
    .single();

  if (error || !booking || !booking.invoice_id) {
    return new Response("Invoice not available for this booking", { status: 404 });
  }

  try {
    const invoice = await stripe.invoices.retrieve(booking.invoice_id);
    return Response.redirect(invoice.hosted_invoice_url, 302);
  } catch (err) {
    console.error("Stripe invoice error:", err);
    return new Response("Stripe invoice fetch error", { status: 500 });
  }
}

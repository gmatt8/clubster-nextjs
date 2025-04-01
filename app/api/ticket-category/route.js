// app/api/ticket-category/route.js
import { createServerSupabase } from "@/lib/supabase-server";

// GET: Recupera le ticket categories per un determinato evento
export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return new Response(JSON.stringify({ error: "Missing event_id" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("ticket_categories")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      console.error("Errore Supabase (GET /api/ticket-category):", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(JSON.stringify({ ticketCategories: data }), { status: 200 });
  } catch (err) {
    console.error("GET /api/ticket-category error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// POST: Crea una nuova ticket category per un evento
export async function POST(request) {
  try {
    const supabase = await createServerSupabase();
    const payload = await request.json();
    const { event_id, name, price, available_tickets } = payload;

    if (!event_id || !name) {
      return new Response(JSON.stringify({ error: "Missing event_id or name" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("ticket_categories")
      .insert([{ event_id, name, price, available_tickets }])
      .select();

    if (error) {
      console.error("Errore Supabase (POST /api/ticket-category):", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("POST /api/ticket-category error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// DELETE: Elimina tutte le ticket categories per un evento
export async function DELETE(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return new Response(JSON.stringify({ error: "Missing event_id" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("ticket_categories")
      .delete()
      .eq("event_id", eventId);

    if (error) {
      console.error("Errore Supabase (DELETE /api/ticket-category):", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("DELETE /api/ticket-category error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return new Response(
        JSON.stringify({ error: "Missing event_id" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ticket_categories")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      console.error("Errore Supabase (GET /api/ticket-category):", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }

    // Restituisci i dati in un oggetto con chiave ticketCategories
    return new Response(
      JSON.stringify({ ticketCategories: data }),
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/ticket-category error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

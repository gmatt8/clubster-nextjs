import { createServerSupabase } from "@/lib/supabase-server";

// GET: Recupera tutti gli eventi (opzionalmente filtrati per club_id)
export async function GET(request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("club_id");

    let query = supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true }); // Ordina per event_date

    if (clubId) {
      query = query.eq("club_id", clubId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Errore Supabase (GET /api/event):", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("GET /api/event error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// POST: Crea un nuovo evento
export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const payload = await request.json();
    console.log("Payload ricevuto (POST /api/event):", payload);

    // In questo esempio, il client invia "event_date"
    const { club_id, name, description, event_date } = payload;

    if (!club_id || !name) {
      return new Response(
        JSON.stringify({ error: "Missing club_id or name" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .insert([{ club_id, name, description, event_date }])
      .select();

    if (error) {
      console.error("Errore Supabase (POST /api/event):", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("POST /api/event error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

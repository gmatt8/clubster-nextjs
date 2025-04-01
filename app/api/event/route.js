import { createServerSupabase } from "@/lib/supabase-server";

// GET: Recupera tutti gli eventi (opzionalmente filtrati per club_id, event_id e per eventi "upcoming")
export async function GET(request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("club_id");
    const eventId = searchParams.get("event_id");
    const upcoming = searchParams.get("upcoming") === "true";

    let query = supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true });

    if (clubId) {
      query = query.eq("club_id", clubId);
    }
    if (eventId) {
      query = query.eq("id", eventId);
    }
    if (upcoming) {
      const now = new Date().toISOString();
      // Filtra gli eventi che non sono terminati: includi quelli con end_date nullo o con end_date >= now
      query = query.or(`end_date.is.null,end_date.gte.${now}`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Errore Supabase (GET /api/event):", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ events: data }), { status: 200 });
  } catch (err) {
    console.error("GET /api/event error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// POST: Crea un nuovo evento
export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const payload = await request.json();
    console.log("Payload ricevuto (POST /api/event):", payload);

    const {
      club_id,
      name,
      description,
      start_date,
      end_date,
      music_genre,
      age_restriction,
      dress_code,
    } = payload;

    if (!club_id || !name) {
      return new Response(
        JSON.stringify({ error: "Missing club_id or name" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          club_id,
          name,
          description,
          start_date,
          end_date,
          music_genre,
          age_restriction,
          dress_code,
        },
      ])
      .select();

    if (error) {
      console.error("Errore Supabase (POST /api/event):", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("POST /api/event error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// DELETE: Elimina un evento esistente
export async function DELETE(request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return new Response(JSON.stringify({ error: "Missing event_id" }), {
        status: 400,
      });
    }

    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Errore Supabase (DELETE /api/event):", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("DELETE /api/event error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// PUT: Aggiorna un evento esistente
export async function PUT(request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return new Response(JSON.stringify({ error: "Missing event_id" }), {
        status: 400,
      });
    }

    const payload = await request.json();
    const {
      club_id,
      name,
      description,
      start_date,
      end_date,
      music_genre,
      age_restriction,
      dress_code,
    } = payload;

    const { data, error } = await supabase
      .from("events")
      .update({
        club_id,
        name,
        description,
        start_date,
        end_date,
        music_genre,
        age_restriction,
        dress_code,
      })
      .eq("id", eventId)
      .select();

    if (error) {
      console.error("Errore Supabase (PUT /api/event):", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("PUT /api/event error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

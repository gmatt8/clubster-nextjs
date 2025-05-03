export const dynamic = "force-dynamic";

// apps/web-customer/api/events/route.js
import { createServerSupabase } from "../../../../../lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);

    const random = searchParams.get("random") === "true";
    const limit = parseInt(searchParams.get("limit")) || 5;
    const clubId = searchParams.get("club_id");
    const eventId = searchParams.get("event_id");
    const upcoming = searchParams.get("upcoming") === "true";

    let query = supabase
      .from("events")
      .select("*, clubs(name, address, images)")
      .order("start_date", { ascending: true });

    if (clubId) query = query.eq("club_id", clubId);
    if (eventId) query = query.eq("id", eventId);
    if (upcoming) {
      const now = new Date().toISOString();
      query = query.or(`end_date.is.null,end_date.gte.${now}`);
    }

    if (random) {
      query = query.order("start_date", { ascending: false }).limit(10);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Errore Supabase (GET /api/events):", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    const processedData = random && data.length
      ? data.sort(() => 0.5 - Math.random()).slice(0, limit)
      : data.slice(0, limit);

    return new Response(JSON.stringify({ events: processedData }), { status: 200 });
  } catch (err) {
    console.error("Errore interno (GET /api/events):", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerSupabase();
    const payload = await request.json();

    const {
      club_id,
      name,
      description,
      start_date,
      end_date,
      music_genres,
      age_restriction,
      dress_code,
      image
    } = payload;

    if (!club_id || !name) {
      return new Response(JSON.stringify({ error: "Missing club_id or name" }), { status: 400 });
    }

    if (music_genres) {
      if (!Array.isArray(music_genres)) {
        return new Response(JSON.stringify({ error: "music_genres deve essere un array" }), { status: 400 });
      }
      if (music_genres.length > 3) {
        return new Response(JSON.stringify({ error: "Puoi selezionare fino a 3 generi musicali" }), { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from("events")
      .insert([{
        club_id,
        name,
        description,
        start_date,
        end_date,
        music_genres,
        age_restriction,
        dress_code,
        image
      }])
      .select();

    if (error) {
      console.error("Errore Supabase (POST /api/events):", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Errore interno (POST /api/events):", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return new Response(JSON.stringify({ error: "Missing event_id" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Errore Supabase (DELETE /api/events):", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Errore interno (DELETE /api/events):", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    if (!eventId) {
      return new Response(JSON.stringify({ error: "Missing event_id" }), { status: 400 });
    }

    const payload = await request.json();
    const {
      club_id,
      name,
      description,
      start_date,
      end_date,
      music_genres,
      age_restriction,
      dress_code,
      image
    } = payload;

    if (music_genres) {
      if (!Array.isArray(music_genres)) {
        return new Response(JSON.stringify({ error: "music_genres deve essere un array" }), { status: 400 });
      }
      if (music_genres.length > 3) {
        return new Response(JSON.stringify({ error: "Puoi selezionare fino a 3 generi musicali" }), { status: 400 });
      }
    }

    const updateFields = {
      club_id, name, description, start_date, end_date,
      music_genres, age_restriction, dress_code
    };
    if (image !== undefined) updateFields.image = image;

    const { data, error } = await supabase
      .from("events")
      .update(updateFields)
      .eq("id", eventId)
      .select();

    if (error) {
      console.error("Errore Supabase (PUT /api/events):", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Errore interno (PUT /api/events):", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

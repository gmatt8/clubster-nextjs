export const dynamic = "force-dynamic";

// app/api/club/route.js
import { createServerSupabase } from "@lib/supabase-server";

// GET: Recupera i dati di un club, es. /api/club?club_id=xxx
export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("club_id");

    if (!clubId) {
      return new Response(JSON.stringify({ error: "Missing club_id" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    if (!data) {
      return new Response(JSON.stringify({ error: "Club not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("GET /api/club error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// POST: Crea un nuovo club
export async function POST(request) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();
    const { manager_id, name, address, phone_number, lat, lng } = body;

    const { data, error } = await supabase
      .from("clubs")
      .insert([{ manager_id, name, address, phone_number, lat, lng }]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err) {
    console.error("POST /api/club error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// PUT: Aggiorna un club esistente
export async function PUT(request) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();
    const {
      manager_id,
      name,
      address,
      phone_number,
      description,
      capacity,
      outdoor_area,
      parking,
      price,
      smoking,
      coat_check,
      images,
      lat,
      lng,
    } = body;

    const updateFields = { name, address, phone_number, description, capacity, outdoor_area, parking, price, smoking, coat_check, lat, lng };
    if (images !== undefined) updateFields.images = images;

    const { data, error } = await supabase
      .from("clubs")
      .update(updateFields)
      .eq("manager_id", manager_id)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err) {
    console.error("PUT /api/club error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

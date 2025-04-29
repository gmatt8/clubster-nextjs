// apps/web-customer/api/events/route.js
import { createServerSupabase } from "../../../../../lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const random = searchParams.get("random") === "true";
    const limit = parseInt(searchParams.get("limit")) || 5;

    let query = supabase.from("events").select("*, clubs(name, address, images)");

    if (random) {
      query = query.order("start_date", { ascending: false }).limit(10);
    } else {
      query = query.order("start_date", { ascending: true });
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase error /api/events:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const randomizedData = random && data.length
      ? data.sort(() => 0.5 - Math.random()).slice(0, limit)
      : data.slice(0, limit);

    return new Response(JSON.stringify({ events: randomizedData }), { status: 200 });
  } catch (err) {
    console.error("Error /api/events:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

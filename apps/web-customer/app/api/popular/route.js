// apps/web-customer/api/popular/route.js
import { createServerSupabase } from "../../../../../lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabase();

  try {
    const [clubRes, eventRes] = await Promise.all([
      supabase
        .from("clubs")
        .select("id, name, address, images")
        .limit(5), // fallback: potresti anche usare Supabase SQL function o sortare per booking count

      supabase
        .from("events")
        .select("id, name, image, club_id, start_date, clubs(name)")
        .order("start_date", { ascending: true })
        .limit(5),
    ]);

    if (clubRes.error || eventRes.error) {
      console.error("Supabase error:", clubRes.error || eventRes.error);
      return new Response(JSON.stringify({ error: "Fetch failed" }), { status: 500 });
    }

    // Adatta struttura eventi
    const popularEvents = eventRes.data.map((e) => ({
      ...e,
      club_name: e.clubs?.name || "Unknown Club",
    }));

    return new Response(JSON.stringify({
      popularClubs: clubRes.data,
      popularEvents,
    }), { status: 200 });
  } catch (err) {
    console.error("Error in /api/popular:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

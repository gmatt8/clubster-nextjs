// /app/api/reviews/route.js
import { createServerSupabase } from "@/lib/supabase-server";

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabase();

    // Se vengono passati booking_id e user_id, filtriamo per questi
    if (searchParams.has("booking_id") && searchParams.has("user_id")) {
      const bookingId = searchParams.get("booking_id");
      const userId = searchParams.get("user_id");
      if (!uuidRegex.test(bookingId) || !uuidRegex.test(userId)) {
        return new Response(
          JSON.stringify({ error: "Invalid UUID format for booking_id or user_id" }),
          { status: 400 }
        );
      }
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching review by booking and user:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
      return new Response(JSON.stringify({ reviews: data }), { status: 200 });
    } else if (searchParams.has("club_id")) {
      const clubId = searchParams.get("club_id");
      if (!uuidRegex.test(clubId)) {
        return new Response(JSON.stringify({ error: "Invalid club_id format" }), { status: 400 });
      }
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("club_id", clubId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching reviews by club:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
      return new Response(JSON.stringify({ reviews: data }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "Missing required filter" }), { status: 400 });
    }
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerSupabase();
    const { club_id, user_id, booking_id, event_id, rating, comment } = await request.json();

    if (!club_id || !user_id || !booking_id || !event_id || rating == null) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    if (
      !uuidRegex.test(club_id) ||
      !uuidRegex.test(user_id) ||
      !uuidRegex.test(booking_id) ||
      !uuidRegex.test(event_id)
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid UUID format for one of the fields" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([{ club_id, user_id, booking_id, event_id, rating, comment }])
      .select();

    if (error) {
      console.error("Error inserting review:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(JSON.stringify({ reviews: data }), { status: 200 });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

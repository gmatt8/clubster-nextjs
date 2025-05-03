export const dynamic = "force-dynamic";

// apps/web-customer/api/clubs/route.js
import { createServerSupabase } from "../../../../../lib/supabase-server";

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
      .single(); // 🔥 Importantissimo!

    if (error) {
      console.error("Errore Supabase /api/club:", error);
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

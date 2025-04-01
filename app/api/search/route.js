// app/api/search/route.js
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    
    const location = searchParams.get("location");
    const date = searchParams.get("date");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam = searchParams.get("radius");

    if (!location || !date) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    let events, error;

    if (latParam && lngParam && radiusParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      const radius = parseFloat(radiusParam);
      
      const { data, error: rpcError } = await supabase.rpc("search_events", {
        lat_input: lat,
        lng_input: lng,
        date_input: date,
        radius_input: radius,
      });
      events = data;
      error = rpcError;
    } else {
      const { data, error: queryError } = await supabase
        .from("events")
        .select(`
          id,
          name,
          description,
          start_date,
          club_id,
          clubs (
            name,
            address
          )
        `)
        .gte("start_date", `${date}T00:00:00`)
        .lte("start_date", `${date}T23:59:59`)
        .ilike("clubs.address", `%${location}%`);
      events = data;
      error = queryError;
    }

    if (error) {
      console.error("Errore query Supabase:", error);
      return NextResponse.json({ events: [] }, { status: 500 });
    }

    return NextResponse.json({ events }, { status: 200 });
  } catch (err) {
    console.error("Errore generico nella rotta /api/search:", err);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

// apps/web-customer/api/search/route.js
import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../../lib/supabase-server";

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function computeDistanceHaversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // raggio terrestre in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocodeAddress(address) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    const data = await res.json();
    const location = data?.results?.[0]?.geometry?.location;
    return location || null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "club";
    const location = searchParams.get("location");
    const date = searchParams.get("date"); // yyyy-MM-dd
    const radius = 50; // km

    // ======== CLUB SEARCH ========
    if (type === "club") {
      if (!location) {
        return NextResponse.json({ clubs: [] }, { status: 200 });
      }

      const geo = await geocodeAddress(location);
      if (!geo) {
        return NextResponse.json({ clubs: [] }, { status: 200 });
      }

      const latInput = geo.lat;
      const lngInput = geo.lng;

      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .not("lat", "is", null)
        .not("lng", "is", null);

      if (error) {
        console.error("Supabase error clubs:", error);
        return NextResponse.json({ clubs: [] }, { status: 500 });
      }

      const filtered = data
        .map((club) => ({
          ...club,
          distance: computeDistanceHaversine(latInput, lngInput, club.lat, club.lng),
        }))
        .filter((club) => club.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      return NextResponse.json({ clubs: filtered }, { status: 200 });
    }

    // ======== EVENT SEARCH ========
    if (type === "event") {
      if (!location && !date) {
        return NextResponse.json({ events: [] }, { status: 200 });
      }

      let query = supabase
        .from("events")
        .select(`
          *,
          clubs (
            name,
            address,
            lat,
            lng,
            images
          )
        `)
        .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`);

      if (date) {
        query = query
          .gte("start_date", `${date}T00:00:00`)
          .lte("start_date", `${date}T23:59:59`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error events:", error);
        return NextResponse.json({ events: [] }, { status: 500 });
      }

      let results = data;

      if (location) {
        const geo = await geocodeAddress(location);
        if (!geo) return NextResponse.json({ events: [] }, { status: 200 });

        const latInput = geo.lat;
        const lngInput = geo.lng;

        results = results
          .filter((event) => event.clubs?.lat && event.clubs?.lng)
          .map((event) => ({
            ...event,
            distance: computeDistanceHaversine(latInput, lngInput, event.clubs.lat, event.clubs.lng),
          }))
          .filter((event) => event.distance <= radius);
      }

      results.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      return NextResponse.json({ events: results }, { status: 200 });
    }

    return NextResponse.json({ error: "Tipo non supportato" }, { status: 400 });
  } catch (err) {
    console.error("Errore generale in /api/search:", err);
    return NextResponse.json({ events: [], clubs: [] }, { status: 500 });
  }
}

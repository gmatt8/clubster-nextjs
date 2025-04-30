// apps/web-manager/app/api/bookings/route.js
import { createServerSupabase } from "@lib/supabase-server";
import { NextResponse } from "next/server";

async function reverseGeocode(lat, lng) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("[Bookings] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not defined");
    return { city: null, country: null };
  }
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await res.json();
    if (data.status !== "OK" || !data.results || !data.results.length) {
      return { city: null, country: null };
    }

    let city = null;
    let country = null;
    for (const component of data.results[0].address_components) {
      if (!city && component.types.includes("locality")) {
        city = component.long_name;
      }
      if (!country && component.types.includes("country")) {
        country = component.long_name;
      }
    }
    return { city, country };
  } catch (err) {
    console.error("[Bookings] Reverse geocode error:", err);
    return { city: null, country: null };
  }
}

export async function GET(request) {
  console.log("[Bookings] GET request received");

  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("booking_id");

    const page = parseInt(searchParams.get("page") || "1", 10);
    const from = (page - 1) * 20;
    const to = from + 19;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const role = profileData.role;

    let query = supabase
      .from("bookings")
      .select(`
        id,
        status,
        created_at,
        user_id,
        events (
          id,
          name,
          start_date,
          end_date,
          clubs (
            name,
            lat,
            lng,
            manager_id
          )
        )
      `)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (bookingId) {
      query = query.eq("id", bookingId);
    } else {
      query = query.eq("status", "confirmed");
    }

    const { data, error } = await query;
    if (error) throw error;

    let bookings = data || [];

    // Conta il totale disponibile (per controllo frontend paginazione)
let total = 0;
{
  const countQuery = supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });

  if (role === "customer") {
    countQuery.eq("user_id", user.id);
  } else if (role === "manager") {
    countQuery.contains("events.clubs.manager_id", user.id);
  }

  const { count } = await countQuery.eq("status", "confirmed");
  total = count || 0;
}


    // Filtro per ruolo
    if (role === "customer") {
      bookings = bookings.filter((b) => b.user_id === user.id);
    } else if (role === "manager") {
      bookings = bookings.filter((b) => b.events?.clubs?.manager_id === user.id);
    }

    // Recupero email utenti (una query sola)
    const userIds = [...new Set(bookings.map((b) => b.user_id))];
    const { data: profileList } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    const emailMap = Object.fromEntries((profileList || []).map((p) => [p.id, p.email]));
    for (const booking of bookings) {
      booking.userEmail = emailMap[booking.user_id] || "N/A";
    }

    // Geolocalizzazione inversa (facoltativa)
    if (bookings.length > 0) {
      await Promise.all(
        bookings.map(async (booking) => {
          const event = booking.events;
          if (event && event.clubs && event.clubs.lat && event.clubs.lng) {
            const { city, country } = await reverseGeocode(event.clubs.lat, event.clubs.lng);
            event.clubs.city = city;
            event.clubs.country = country;
          }
        })
      );
    }

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (err) {
    console.error("[Bookings] Error in GET /api/bookings:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

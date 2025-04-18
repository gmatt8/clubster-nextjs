// app/api/bookings/route.js
import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { Download, FileText, Loader2 } from "lucide-react";

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("[Bookings] Authenticated user:", user);
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
    console.log("[Bookings] User role:", role);

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
          club_id,
          clubs (
            name,
            lat,
            lng,
            manager_id
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (bookingId) {
      query = query.eq("id", bookingId);
      console.log("[Bookings] Filtering for bookingId:", bookingId);
    } else {
      query = query.eq("status", "confirmed");
      console.log("[Bookings] Filtering for status confirmed");
    }

    const { data, error } = await query;
    if (error) throw error;

    let bookings = data || [];

    // Filtra in base al ruolo
    if (role === "customer") {
      bookings = bookings.filter((b) => b.user_id === user.id);
    } else if (role === "manager") {
      bookings = bookings.filter(
        (b) => b.events?.clubs?.manager_id === user.id
      );
    }

    // Aggiungi email utente
    for (const booking of bookings) {
      const { data: pData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", booking.user_id)
        .single();
      booking.userEmail = pData?.email || "N/A";
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

    console.log("[Bookings] Final bookings returned:", bookings);
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (err) {
    console.error("[Bookings] Error in GET /api/bookings:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

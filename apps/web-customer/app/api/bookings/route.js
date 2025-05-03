export const dynamic = "force-dynamic";

// /apps/web-customer/app/api/bookings/route.js
import { createServerSupabase } from "../../../../../lib/supabase-server";
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
        quantity,
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
            address,
            manager_id
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (bookingId) {
      query = query.eq("id", bookingId);
    } else {
      query = query.eq("status", "confirmed");
    }

    const { data, error } = await query;
    if (error) throw error;

    let bookings = data || [];

    // Filtro per ruolo
    if (role === "customer") {
      bookings = bookings.filter((b) => b.user_id === user.id);
    } else if (role === "manager") {
      bookings = bookings.filter((b) => b.events?.clubs?.manager_id === user.id);
    }

    // Email utente
    for (const booking of bookings) {
      const { data: pData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", booking.user_id)
        .single();
      booking.userEmail = pData?.email || "N/A";
    }

    // Reverse geocode: calcolo city e country dinamicamente
    if (bookings.length > 0) {
      await Promise.all(
        bookings.map(async (booking) => {
          const event = booking.events;
          if (event?.clubs?.lat && event?.clubs?.lng) {
            const { city, country } = await reverseGeocode(event.clubs.lat, event.clubs.lng);
            event.clubs.city = city;
            event.clubs.country = country;
          }
        })
      );
    }

    // Reviewed check lato server con fallback sicuro
    const now = new Date();
    await Promise.all(
      bookings.map(async (booking) => {
        const eventEnd = new Date(booking.events?.end_date || booking.events?.start_date);
        if (eventEnd <= now) {
          try {
            const { data: reviewData, error: reviewError } = await supabase
              .from("reviews")
              .select("id")
              .eq("booking_id", booking.id)
              .eq("user_id", user.id)
              .maybeSingle();

            if (reviewError) {
              console.warn(`[Bookings] Review check failed for booking ${booking.id}:`, reviewError.message);
              booking.reviewed = false;
            } else {
              booking.reviewed = !!reviewData;
            }
          } catch (err) {
            console.error(`[Bookings] Unexpected error checking review for booking ${booking.id}:`, err);
            booking.reviewed = false;
          }
        } else {
          booking.reviewed = false;
        }
      })
    );

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (err) {
    console.error("[Bookings] ERROR STACK:", err.stack || err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

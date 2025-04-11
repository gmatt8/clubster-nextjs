// app/api/bookings/route.js
import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Funzione per eseguire il reverse geocode usando l'API di Google Maps
async function reverseGeocode(lat, lng) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not defined");
    return { city: null, country: null };
  }
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await res.json();
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
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
    console.error("Reverse geocode error:", err);
    return { city: null, country: null };
  }
}

export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("booking_id");

    // Recupera l'utente loggato
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Recupera il ruolo dell'utente dalla tabella profiles
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileError || !profileData) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    const role = profileData.role; // "customer" o "manager"

    // Costruisci la query con join su events e clubs  
    // Aggiungiamo il filtro per mostrare solo i booking con status "confirmed"
    // Costruisci la query con join su events e clubs
let query = supabase
.from("bookings")
.select(`
  id,
  booking_number,
  quantity,
  created_at,
  user_id,
  status,
  events (
    id,
    name,
    start_date,
    end_date,
    club_id,
    clubs (
      club_name: name,
      lat,
      lng,
      manager_id
    )
  )
`)
.order("created_at", { ascending: false });

// Se viene passato il parametro booking_id, filtra per id
if (bookingId) {
query = query.eq("id", bookingId);
} else {
// Altrimenti, mostra solo i booking confermati
query = query.eq("status", "confirmed");
}
424
    
    const { data, error } = await query;
    if (error) throw error;
    let bookings = data || [];

    // Filtra in base al ruolo: solo i booking dell'utente per il "customer",
    // oppure quelli dei club gestiti per il "manager"
    if (role === "customer") {
      bookings = bookings.filter((booking) => booking.user_id === user.id);
    } else if (role === "manager") {
      bookings = bookings.filter(
        (booking) =>
          booking.events &&
          booking.events.clubs &&
          booking.events.clubs.manager_id === user.id
      );
    }

    // Per ogni booking, recupera l'email reale dal profilo
    for (const booking of bookings) {
      const { data: pData, error: pError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", booking.user_id)
        .single();
      booking.userEmail = pData?.email || "N/A";
    }

    // Arricchisci i dati con reverse geocoding, se disponibili le coordinate
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
    console.error("Error in GET /api/bookings:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

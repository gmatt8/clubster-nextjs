// app/api/search/route.js
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// Funzione per il reverse geocoding (stessa logica usata nella bookings API)
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

    const location = searchParams.get("location");
    const date = searchParams.get("date");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam = searchParams.get("radius");

    if (!location || !date) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    let events, error;

    // Se vengono passati lat, lng e radius usiamo la stored procedure
    if (latParam && lngParam && radiusParam) {
      const latValue = parseFloat(latParam);
      const lngValue = parseFloat(lngParam);
      const radiusValue = parseFloat(radiusParam);

      const { data, error: rpcError } = await supabase.rpc("search_events", {
        lat_input: latValue,
        lng_input: lngValue,
        date_input: date,
        radius_input: radiusValue,
      });
      events = data;
      error = rpcError;
    } else {
      // Altrimenti eseguiamo una query diretta con dati annidati
      const { data, error: queryError } = await supabase
        .from("events")
        .select(`
          id,
          name,
          description,
          start_date,
          end_date,
          club_id,
          club_images,
          min_price,
          clubs (
            club_name: name,
            address,
            lat,
            lng
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

    console.log("Eventi ricevuti:", events);

    // Se l'evento non ha un oggetto "clubs" annidato (caso della stored procedure),
    // lo ricostruiamo utilizzando i campi restituiti (club_name, club_location, club_images, lat, lng)
    events.forEach(evt => {
      if (!evt.clubs) {
        evt.clubs = {
          club_name: evt.club_name,
          address: evt.club_location,
          images: evt.club_images,
          lat: evt.lat,
          lng: evt.lng
        };
      }
    });

    // Applica il reverse geocoding se sono presenti lat e lng
    await Promise.all(
      events.map(async (evt) => {
        if (evt.clubs && evt.clubs.lat && evt.clubs.lng) {
          const { city, country } = await reverseGeocode(evt.clubs.lat, evt.clubs.lng);
          evt.clubs.city = city;
          evt.clubs.country = country;
        }
      })
    );

    return NextResponse.json({ events }, { status: 200 });
  } catch (err) {
    console.error("Errore generico nella rotta /api/search:", err);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

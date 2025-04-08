// app/api/search/route.js
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// Funzione per il reverse geocoding (per aggiungere città e paese agli eventi)
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

    const type = searchParams.get("type") || "club";
    const location = searchParams.get("location");
    const date = searchParams.get("date");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam = searchParams.get("radius");

    // --- Ricerca per Club ---
    if (type === "club") {
      if (!location) {
        return NextResponse.json({ clubs: [] }, { status: 200 });
      }
      // Query per i club (usiamo il ilike per cercare per address)
      const { data, error } = await supabase
        .from("clubs")
        .select("*, images")
        .ilike("address", `%${location}%`);

      if (error) {
        console.error("Errore nella query clubs:", error);
        return NextResponse.json({ clubs: [] }, { status: 500 });
      }
      return NextResponse.json({ clubs: data }, { status: 200 });
    }
    // --- Ricerca per Eventi ---
    else if (type === "event") {
      // Almeno location o date devono essere fornite
      if (!location && !date) {
        return NextResponse.json({ events: [] }, { status: 200 });
      }
      let events, error;
      // Se sono forniti lat, lng, radius e date, usiamo la RPC "search_events"
      if (latParam && lngParam && radiusParam && date) {
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
        if (data && Array.isArray(data)) {
          // Rimodella i dati ottenuti dalla stored procedure per avere la struttura coerente
          events = data.map((evt) => ({
            ...evt,
            image: evt.event_image, // Immagine dell'evento
            clubs: {
              club_name: evt.club_name,
              address: evt.club_location,
              images: evt.club_images,
              lat: evt.lat,
              lng: evt.lng,
            },
          }));
        }
      } else {
        // Costruzione dinamica della query se non sono utilizzati tutti i parametri per la RPC
        let query = supabase
          .from("events")
          .select(`
            id,
            name,
            description,
            start_date,
            end_date,
            club_id,
            image,
            clubs (
              club_name: name,
              address,
              lat,
              lng,
              images
            )
          `);
        if (date) {
          query = query
            .gte("start_date", `${date}T00:00:00`)
            .lte("start_date", `${date}T23:59:59`);
        }
        if (location) {
          query = query.ilike("clubs.address", `%${location}%`);
        }
        // Filtro per mostrare solo eventi non terminati
        query = query.or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`);

        const { data, error: queryError } = await query;
        events = data;
        error = queryError;
      }

      if (error) {
        console.error("Errore query Supabase per eventi:", error);
        return NextResponse.json({ events: [] }, { status: 500 });
      }

      // Se il club ha lat e lng, applichiamo il reverse geocode
      await Promise.all(
        events.map(async (evt) => {
          if (evt.clubs && evt.clubs.lat && evt.clubs.lng) {
            const { city, country } = await reverseGeocode(evt.clubs.lat, evt.clubs.lng);
            evt.clubs.city = city;
            evt.clubs.country = country;
          }
        })
      );

      // Se l'oggetto clubs non esiste, lo ricostruiamo in fallback
      events.forEach((evt) => {
        if (!evt.clubs) {
          evt.clubs = {
            club_name: evt.club_name,
            address: evt.club_location,
            images: evt.club_images,
            lat: evt.lat,
            lng: evt.lng,
          };
        }
      });

      return NextResponse.json({ events }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Tipo di ricerca non supportato" }, { status: 400 });
    }
  } catch (err) {
    console.error("Errore generico nella rotta /api/search:", err);
    return NextResponse.json({ events: [], clubs: [] }, { status: 500 });
  }
}

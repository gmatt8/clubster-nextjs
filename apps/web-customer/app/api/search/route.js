// apps/web-customer/api/search/route.js
import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../../lib/supabase-server";

// Funzione per il reverse geocode usando l'API di Google Maps
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
      if (!city && (component.types.includes("locality") || component.types.includes("administrative_area_level_2"))) {
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

// Funzione di fallback per gli eventi: query dinamica
async function getEventsDynamic(supabase, location, date) {
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
  // Mostra solo eventi non terminati
  query = query.or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`);
  const { data, error } = await query;
  return { data, error };
}

// Funzione che filtra gli eventi in base a lat, lng, radius con formula Haversine (se necessario)
async function filterEventsByDistance(events, latInput, lngInput, radiusInput) {
  const filtered = [];
  for (const evt of events) {
    const c = evt.clubs;
    if (c && c.lat && c.lng) {
      const distance = computeDistanceHaversine(latInput, lngInput, c.lat, c.lng);
      evt.distance = distance;
      if (distance <= radiusInput) {
        filtered.push(evt);
      }
    }
  }
  return filtered;
}

function computeDistanceHaversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // Raggio terrestre in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
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
    // Parametri per ordinamento
    const sort = searchParams.get("sort") || (type === "event" ? "date" : "distance");
    // Per club: flag per mostrare solo club con eventi disponibili
    const onlyWithEvents = searchParams.get("onlyWithEvents") === "true";

    // ---- Ricerca per Club ----
    if (type === "club") {
      if (!location) {
        return NextResponse.json({ clubs: [] }, { status: 200 });
      }
      let clubs = [];
      let error = null;
      if (latParam && lngParam && radiusParam) {
        const latValue = parseFloat(latParam);
        const lngValue = parseFloat(lngParam);
        const radiusValue = parseFloat(radiusParam);
        const { data, error: rpcError } = await supabase.rpc("search_clubs", {
          lat_input: latValue,
          lng_input: lngValue,
          radius_input: radiusValue,
        });
        clubs = data;
        error = rpcError;
      } else {
        const { data, error: queryError } = await supabase
          .from("clubs")
          .select("*, images")
          .ilike("address", `%${location}%`);
        clubs = data;
        error = queryError;
      }
      if (error) {
        console.error("Errore nella query clubs:", error);
        return NextResponse.json({ clubs: [] }, { status: 500 });
      }
      // Arricchisci i club con shortAddress ("City, Country")
      await Promise.all(
        clubs.map(async (club) => {
          if (club.lat && club.lng) {
            const { city, country } = await reverseGeocode(club.lat, club.lng);
            club.shortAddress = city && country ? `${city}, ${country}` : club.address;
            if (!club.distance && latParam && lngParam) {
              club.distance = computeDistanceHaversine(parseFloat(latParam), parseFloat(lngParam), club.lat, club.lng);
            }
          } else {
            club.shortAddress = club.address;
          }
        })
      );
      // Ordinamento in base al parametro "sort"
      if (sort === "distance") {
        clubs.sort((a, b) => a.distance - b.distance);
      } else if (sort === "best_selling_club") {
        clubs.sort((a, b) => (b.best_selling || 0) - (a.best_selling || 0));
      } else if (sort === "highest_rating") {
        clubs.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      }
      // Filtro: se onlyWithEvents è true, filtra club che non hanno eventi disponibili
      if (onlyWithEvents) {
        clubs = clubs.filter((club) => club.has_upcoming_events);
      }
      return NextResponse.json({ clubs }, { status: 200 });
    }

    // ---- Ricerca per Eventi ----
    else if (type === "event") {
      // Se manca location e data, restituisci array vuoto
      if (!location && !date) {
        return NextResponse.json({ events: [] }, { status: 200 });
      }
      let events = [];
      let error = null;
      if (latParam && lngParam && radiusParam) {
        const latValue = parseFloat(latParam);
        const lngValue = parseFloat(lngParam);
        const radiusValue = parseFloat(radiusParam);
        // Se non viene fornita una data, usa la data odierna di default
        const dateToUse = date ? date : new Date().toISOString().split("T")[0];
        const { data, error: rpcError } = await supabase.rpc("search_events", {
          lat_input: latValue,
          lng_input: lngValue,
          date_input: dateToUse,
          radius_input: radiusValue,
        });
        if (rpcError) {
          console.error("RPC search_events error:", rpcError);
          const { data: fallbackData, error: fallbackErr } = await getEventsDynamic(supabase, location, date);
          events = fallbackData;
          error = fallbackErr;
        } else {
          events = data;
          error = rpcError;
          if (Array.isArray(events)) {
            events = events.map((evt) => ({
              ...evt,
              image: evt.event_image,
              clubs: {
                club_name: evt.club_name,
                address: evt.club_location,
                images: evt.club_images,
                lat: evt.lat,
                lng: evt.lng,
              },
            }));
          }
        }
        // Applica filtro manuale per distanza, se necessario
        events = await filterEventsByDistance(events, latValue, lngValue, radiusValue);
      } else {
        const { data: fallbackData, error: fallbackErr } = await getEventsDynamic(supabase, location, date);
        events = fallbackData;
        error = fallbackErr;
      }
      if (error) {
        console.error("Errore query Supabase per eventi:", error);
        return NextResponse.json({ events: [] }, { status: 500 });
      }
      // Ordinamento per eventi
      if (sort === "date") {
        events.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      } else if (sort === "distance") {
        events.sort((a, b) => a.distance - b.distance);
      } else if (sort === "best_selling_event") {
        events.sort((a, b) => (b.best_selling || 0) - (a.best_selling || 0));
      } else if (sort === "highest_rating") {
        events.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      }
      // Per ogni evento, se il club ha lat e lng, esegui il reverse geocode; 
      // se non ottieni risultati, prova a estrarre city/country dal campo address
      await Promise.all(
        events.map(async (evt) => {
          if (evt.clubs && evt.clubs.lat && evt.clubs.lng) {
            const { city, country } = await reverseGeocode(evt.clubs.lat, evt.clubs.lng);
            if (city && country) {
              evt.clubs.city = city;
              evt.clubs.country = country;
            } else if (evt.clubs.address) {
              // Fallback: usa l'ultima parte dell'indirizzo
              const parts = evt.clubs.address.split(",");
              if (parts.length >= 2) {
                evt.clubs.city = parts[parts.length - 2].trim();
                evt.clubs.country = parts[parts.length - 1].trim();
              } else {
                evt.clubs.city = "Unknown";
                evt.clubs.country = "Unknown";
              }
            } else {
              evt.clubs.city = "Unknown";
              evt.clubs.country = "Unknown";
            }
          }
        })
      );
      // Se il campo clubs non esiste, ricostruiscilo in fallback
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

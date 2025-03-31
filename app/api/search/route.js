import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const date = searchParams.get("date");

    // Se mancano i parametri, restituiamo un array vuoto (o un errore, a tua scelta)
    if (!location || !date) {
      return NextResponse.json(
        { events: [] },
        { status: 200 }
      );
    }

    // Esempio di query:
    //  - Cerchiamo gli eventi la cui data rientra nella stessa giornata (da T00:00 a T23:59)
    //  - Filtriamo i club che abbiano in "address" un match parziale con `location`
    //  - Per fare la join: `select("*, clubs!inner(name, address)")`
    //    e la condizione `.ilike("clubs.address", ...)` per il match su clubs.address
    //  - Se la colonna dell’evento si chiama "start_date", usiamo gte/lte su start_date

    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        id,
        name,
        description,
        start_date,
        club_id,
        clubs (
          name,
          address
        )
      `
      ) // Join con la tabella clubs
      .gte("start_date", `${date}T00:00:00`)
      .lte("start_date", `${date}T23:59:59`)
      .ilike("clubs.address", `%${location}%`);

    if (error) {
      console.error("Errore query Supabase:", error);
      return NextResponse.json({ events: [] }, { status: 500 });
    }

    // Restituiamo gli eventi trovati
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Errore generico nella rotta /api/search:", error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

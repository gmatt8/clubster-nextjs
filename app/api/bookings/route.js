// app/api/bookings/route.js
import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const supabase = await createServerSupabase();

    // Recupera utente loggato
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Esempio: unisci booking + event
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_number,
        quantity,
        event_id,
        events (
          id,
          name,
          start_date,
          club_id
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Potresti fare un secondo pass per unire i dati del club (club_name), oppure usare i join se configurati
    // ...

    return NextResponse.json({ bookings: data }, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/bookings:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

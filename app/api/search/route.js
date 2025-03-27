import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const date = searchParams.get('date');

    // Se mancano i parametri, restituiamo un array vuoto
    if (!location || !date) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    // Esempio di query:
    //  - Cerchiamo gli eventi la cui data rientra nella stessa giornata (da T00:00 a T23:59)
    //  - Filtriamo i club che abbiano nell'indirizzo (address) un match parziale con `location`
    //  - Se la "location" la salvi in un'altra colonna (es. city), adegua la ilike di conseguenza
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        name,
        description,
        event_date,
        club_id,
        clubs (
          name,
          address
        )
      `)
      .gte('event_date', `${date}T00:00:00`)
      .lte('event_date', `${date}T23:59:59`)
      .ilike('clubs.address', `%${location}%`); // se "location" è in clubs.address

    if (error) {
      console.error('Errore query Supabase:', error);
      return NextResponse.json({ events: [] }, { status: 500 });
    }

    // Restituiamo gli eventi trovati
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('Errore generico nella rotta /api/search:', error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

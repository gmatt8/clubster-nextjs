// app/api/club/route.js
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const body = await request.json();
    const { manager_id, name, address, phone_number } = body;

    // Creazione base (verify-club)
    const { data, error } = await supabase
      .from('clubs')
      .insert([
        {
          manager_id,
          name,
          address,
          phone_number,
        },
      ]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// Aggiornamento (PUT) per la pagina "General Settings"
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      manager_id,
      name,
      address,
      phone_number,
      description,
      capacity,
      outdoor_area,
      parking,
      price,
      smoking,
      coat_check,
    } = body;

    const { data, error } = await supabase
      .from('clubs')
      .update({
        name,
        address,
        phone_number,
        description,
        capacity,
        outdoor_area,
        parking,
        price,
        smoking,
        coat_check,
      })
      .eq('manager_id', manager_id)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

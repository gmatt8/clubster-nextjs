import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request) {
  try {
    // Crea l'istanza di Supabase
    const supabase = createServerSupabase();

    const { event_id, name, price, available_tickets } = await request.json();

    if (!event_id || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing event_id or name' }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ticket_categories')
      .insert([{ event_id, name, price, available_tickets }])
      .select();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error('POST /api/ticket-category error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

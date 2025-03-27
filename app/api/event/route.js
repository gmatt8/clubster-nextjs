import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request) {
  try {
    const { club_id, name, description, event_date } = await request.json();

    // Controlli base
    if (!club_id || !name) {
      return new Response(JSON.stringify({ error: 'Missing club_id or name' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('events')
      .insert([{ club_id, name, description, event_date }])
      .select(); // con .select() ottieni i record creati

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    // data conterrà un array con il record creato
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error('POST /api/event error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

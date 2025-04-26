// app/api/faq/route.js
import { createServerSupabase } from "@lib/supabase-server";

export async function GET(request) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("club_id");

  if (!clubId) {
    return new Response(JSON.stringify({ error: "Missing club_id" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("club_faqs")
    .select("*")
    .eq("club_id", clubId)
    .order("created_at", { ascending: true });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
    const supabase = await createServerSupabase();
    const body = await request.json();
    const { club_id, question, answer } = body;
  
    const { data, error } = await supabase
      .from("club_faqs")
      .insert([{ club_id, question, answer }])
      .select(); // <-- ritorna i dati appena inseriti
  
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  
    return new Response(JSON.stringify(data), { status: 200 });
  }
  

export async function PUT(request) {
  const supabase = await createServerSupabase();
  const body = await request.json();
  const { id, question, answer } = body;

  const { data, error } = await supabase
    .from("club_faqs")
    .update({ question, answer })
    .eq("id", id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify(data), { status: 200 });
}

export async function DELETE(request) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const { error } = await supabase.from("club_faqs").delete().eq("id", id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(null, { status: 204 });
}

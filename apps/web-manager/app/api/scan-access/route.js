// apps/web-manager/app/api/scan-access/route.js
export const dynamic = "force-dynamic";
import { createServerSupabase } from "@lib/supabase-server";

// Funzione per generare codice random unico
function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET: fetch access codes
export async function GET(request) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { data, error } = await supabase
      .from("scan_access_codes")
      .select("id, code, name, expires_at, created_at")
      .eq("manager_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('[API GET] Supabase error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    console.error('[API GET] Unhandled error:', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

// POST: create new access code
export async function POST(request) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();
    const { name, expires_at, club_id } = body;

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    if (!name || !club_id) {
      return new Response(JSON.stringify({ error: "Missing name or club_id" }), { status: 400 });
    }

    // Generazione codice unico
    let code;
    let isUnique = false;

    for (let i = 0; i < 5 && !isUnique; i++) {
      code = generateCode();
      const { data: existing } = await supabase
        .from('scan_access_codes')
        .select('id')
        .eq('code', code)
        .single();

      if (!existing) isUnique = true;
    }

    if (!isUnique) {
      return new Response(JSON.stringify({ error: "Failed to generate unique code" }), { status: 500 });
    }

    const { data, error } = await supabase
      .from("scan_access_codes")
      .insert([{ code, name, club_id, manager_id: user.id, expires_at }])
      .select();

    if (error) {
      console.error('[API POST] Supabase error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    console.error('[API POST] Unhandled error:', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

// DELETE: remove code
export async function DELETE(request) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
    }

    const { error } = await supabase
      .from("scan_access_codes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error('[API DELETE] Supabase error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('[API DELETE] Unhandled error:', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

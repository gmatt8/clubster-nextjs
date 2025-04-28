// app/api/user/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Qui usi la tua Service Role Key (NON la anon key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function DELETE(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Elimina l'utente dal DB auth.users
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

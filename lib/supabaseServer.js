// lib/supabaseServer.js
import { createClient } from '@supabase/supabase-js';

export function createServerClient(req, res) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { 
        persistSession: false, 
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: { headers: { cookie: req.headers.get('cookie') } }
    }
  );
}

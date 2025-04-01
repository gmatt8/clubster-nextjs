// lib/supabase-server.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  // Attende il risultato di cookies() prima di passarlo al client
  const cookieStore = await cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
}

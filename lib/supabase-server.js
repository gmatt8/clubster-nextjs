// lib/supabase-server.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  console.log("[Supabase] Creating server Supabase client...");
  const cookieStore = await cookies();
  console.log("[Supabase] Cookies obtained:", cookieStore);
  const client = createRouteHandlerClient({ cookies: () => cookieStore });
  console.log("[Supabase] Client created:", client);
  return client;
}

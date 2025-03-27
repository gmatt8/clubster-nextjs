// lib/supabase-server.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createServerSupabase() {
  return createRouteHandlerClient({ cookies })
}

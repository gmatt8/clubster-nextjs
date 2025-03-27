import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createServerClient() {
  // Crea il client Supabase per il server usando i cookie
  return createRouteHandlerClient({ cookies })
}

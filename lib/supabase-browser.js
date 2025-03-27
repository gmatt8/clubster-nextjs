'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function createBrowserClient() {
  // Crea il client Supabase per il browser
  return createClientComponentClient()
}

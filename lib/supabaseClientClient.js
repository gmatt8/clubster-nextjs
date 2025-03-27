// lib/supabaseClient.js
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Client per l'esecuzione di query dal BROWSER (Client Components).
 * Mantiene la sessione utente sfruttando le auth-helpers.
 */
export const supabaseBrowserClient = createPagesBrowserClient();

/**
 * Factory per ottenere un client lato SERVER (Route Handler o Server Components).
 * Necessario per gestire query nel contesto server e sfruttare i cookie dell'utente.
 */
export function getSupabaseRouteClient() {
  return createRouteHandlerClient({ cookies });
}

import { supabase } from './supabaseClient';
import Router from 'next/router';

export async function handlePostLoginRedirect() {
  const user = supabase.auth.user();
  if (!user) return;

  // Recupera il profilo
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // Gestisci l'errore
    return;
  }

  // Redirigi in base al ruolo
  if (profile.role === 'manager') {
    Router.push('/dashboard/manager');
  } else {
    Router.push('/dashboard/customer'); // oppure homepage, a seconda della logica
  }
}

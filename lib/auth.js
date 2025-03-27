// lib/auth.js
import { supabase } from './supabaseClientClient';

export async function getUserProfile(userId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return profile;
}

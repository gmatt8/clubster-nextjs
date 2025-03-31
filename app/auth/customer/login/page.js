'use client';

import { useState } from 'react';
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter } from 'next/navigation';

export default function CustomerLoginPage() {
  const supabase = createBrowserSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    // Login con email e password
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setError("Nessun utente trovato.");
      return;
    }

    // Recupera il profilo per verificare che l'utente sia un customer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      setError('Impossibile recuperare il ruolo utente.');
      return;
    }

    if (profile.role !== 'customer') {
      setError('Accesso non autorizzato. Questo form è per i customer.');
      await supabase.auth.signOut();
      return;
    }

    // Se tutto ok, reindirizza alla dashboard customer
    router.push('/dashboard/customer/home');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Login Customer</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Accedi
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

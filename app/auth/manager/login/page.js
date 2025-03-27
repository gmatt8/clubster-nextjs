'use client';

import { useState } from 'react';
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from 'next/navigation';

export default function ManagerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    // Login con Supabase (v2) usando signInWithPassword
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    const user = data.user;

    // Recupera il profilo per verificare che l'utente sia un manager
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      setError('Impossibile recuperare il ruolo utente.');
      return;
    }

    if (profile.role !== 'manager') {
      setError('Accesso non autorizzato. Questo form è per i manager.');
      await supabase.auth.signOut();
      return;
    }

    // Se tutto ok, reindirizza alla dashboard manager
    router.push('/dashboard/manager/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Login Manager</h1>
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
        <button type="submit" className="bg-indigo-500 text-white p-2 rounded">
          Accedi
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

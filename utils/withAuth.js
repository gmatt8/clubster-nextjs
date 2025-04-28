import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Router from 'next/router';

export default function ManagerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const { error: loginError, user } = await supabase.auth.signIn({ email, password });
    if (loginError) {
      setError(loginError.message);
      return;
    }
    // Recupera il profilo per verificare il ruolo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profileError) {
      setError(profileError.message);
      return;
    }
    // Verifica che l'utente sia un manager
    if (profile.role !== 'manager') {
      setError('Accesso non autorizzato tramite questo form');
      await supabase.auth.signOut();
      return;
    }
    Router.push('/manager');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Login Manager</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Accedi</button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Router from 'next/router';

export default function ManagerSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    // Imposta il ruolo "manager" nei metadata per la registrazione
    const { error: signupError, user } = await supabase.auth.signUp(
      { email, password },
      { data: { role: 'manager' } }
    );
    if (signupError) {
      setError(signupError.message);
      return;
    }
    // Reindirizza l'utente alla dashboard manager
    Router.push('/dashboard/manager');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Registrazione Manager</h1>
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
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Registrati</button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

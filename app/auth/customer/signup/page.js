import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Router from 'next/router';

export default function CustomerSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    // Imposta il ruolo "customer" nei metadata per la registrazione
    const { error: signupError, user } = await supabase.auth.signUp(
      { email, password },
      { data: { role: 'customer' } }
    );
    if (signupError) {
      setError(signupError.message);
      return;
    }
    // Reindirizza l'utente alla dashboard/customer (o homepage) per i customer
    Router.push('/dashboard/customer');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Registrazione Customer</h1>
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
        <button type="submit" className="bg-green-500 text-white p-2 rounded">Registrati</button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

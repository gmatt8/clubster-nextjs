'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ManagerSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    // Registrazione con Supabase (v2), impostando il ruolo "manager"
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'manager',
        },
      },
    });

    // Log per debug
    console.log("Signup data:", data, "Signup error:", signupError);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    // Se la registrazione ha avuto successo, anche se data.user potrebbe essere null (se è abilitata la email confirmation)
    setMessage(
      'Signup effettuato. Controlla la tua email per verificare il tuo account. Sarai reindirizzato alla pagina di login.'
    );

    // Dopo 3 secondi, reindirizza alla pagina di login manager
    setTimeout(() => {
      router.push('/auth/manager/login');
    }, 3000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Signup Manager</h1>
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
        <button type="submit" className="bg-purple-500 text-white p-2 rounded">
          Registrati
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {message && <p className="text-green-500 mt-2">{message}</p>}
    </div>
  );
}

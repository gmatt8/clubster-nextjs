'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Controlla la tua email per confermare la registrazione!');
    }
  };

  return (
    <div className="p-8">
      <input
        className="border p-2 mb-4 w-full"
        type="email"
        placeholder="Inserisci email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 mb-4 w-full"
        type="password"
        placeholder="Inserisci password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white p-2 rounded" onClick={handleSignup}>
        Registrati
      </button>
    </div>
  );
}

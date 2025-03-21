'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ManagerSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'manager' },
      },
    });

    if (error) alert(error.message);
    else {
      alert('Controlla la tua email per verificare il tuo account manager!');
      router.push('/manager/auth/login');
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-xl">Manager Signup</h1>
      <input
        className="border p-2 mb-4 w-full"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 mb-4 w-full"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-purple-500 text-white p-2 rounded" onClick={handleSignup}>
        Registrati come Manager
      </button>
    </div>
  );
}

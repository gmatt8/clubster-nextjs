'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ManagerSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'manager',
        },
        emailRedirectTo: `${location.origin}/manager/auth/login`
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Registrazione effettuata! Controlla la tua email per confermare l\'account.');
      router.push('/manager/auth/login');
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-xl">Manager Signup</h1>
      <input className="border p-2 mb-4 w-full" placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 mb-4 w-full" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 rounded" onClick={handleSignup}>
        Registrati come Manager
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ManagerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      if (!data.user.email_confirmed_at) {
        alert('Conferma prima il tuo account dalla tua email.');
        await supabase.auth.signOut();
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile.role !== 'manager') {
        alert('Questo account non è manager.');
        await supabase.auth.signOut();
        router.push('/customer/auth/login');
        return;
      }

      alert('Login effettuato!');
      router.push('/');
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-xl">Manager Login</h1>
      <input className="border p-2 mb-4 w-full" placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 mb-4 w-full" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-green-500 text-white p-2 rounded" onClick={handleLogin}>
        Login Manager
      </button>
    </div>
  );
}

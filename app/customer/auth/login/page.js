'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, verified')
        .eq('id', data.user.id)
        .single();

      if (profile.role !== 'user') {
        alert('Questo è un account Manager. Usa login manager.');
        await supabase.auth.signOut();
        router.push('/manager/auth/login');
        return;
      }

      if (!profile.verified) {
        alert('Account non ancora verificato, inserisci il codice inviato via email.');
        router.push('/customer/auth/verify-email');
      } else {
        alert('Login effettuato!');
        router.push('/');
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-xl">Customer Login</h1>
      <input className="border p-2 mb-4 w-full" type="email" placeholder="Email"
        onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 mb-4 w-full" type="password" placeholder="Password"
        onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-green-500 text-white p-2 rounded" onClick={handleLogin}>
        Accedi come Customer
      </button>
    </div>
  );
}

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
      return;
    }

    if (!data.user.email_confirmed_at) {
      alert('Confirm your account from your email first.');
      await supabase.auth.signOut();
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (!profile || profile.role !== 'customer') {
      alert('Unauthorized account.');
      await supabase.auth.signOut();
      router.push('/customer/auth/login');
      return;
    }

    alert('Login done!');
    router.push('/');
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-xl">Customer Login</h1>
      <input className="border p-2 mb-4 w-full" placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 mb-4 w-full" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-green-500 text-white p-2 rounded" onClick={handleLogin}>
        Login Customer
      </button>
    </div>
  );
}

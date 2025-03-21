'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/customer/auth/login');
    };
    checkAuth();
  }, [router]);

  const handleVerify = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('verification_code')
      .eq('id', user.id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (profile.verification_code === code) {
      await supabase.from('profiles').update({ verified: true }).eq('id', user.id);
      alert('Account verificato con successo!');
      router.push('/');
    } else {
      alert('Codice errato, riprova.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-xl">Verifica Email</h1>
      <input className="border p-2 mb-4 w-full" type="text" placeholder="Codice ricevuto via email"
        onChange={(e) => setCode(e.target.value)} />
      <button className="bg-blue-600 text-white p-2 rounded" onClick={handleVerify}>
        Verifica Account
      </button>
    </div>
  );
}

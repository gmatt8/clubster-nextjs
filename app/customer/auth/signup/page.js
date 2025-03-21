'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import generateCode from '@/lib/generateCode';

export default function CustomerSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    const verificationCode = generateCode();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          role: 'user',
          verification_code: verificationCode
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Registrazione effettuata. Controlla la tua email per il codice di verifica!');
      router.push('/customer/auth/verify-email');
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-xl">Customer Signup</h1>
      <input className="border p-2 mb-4 w-full" type="email" placeholder="Email"
        onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 mb-4 w-full" type="password" placeholder="Password"
        onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 rounded" onClick={handleSignup}>
        Registrati come Customer
      </button>
    </div>
  );
}

// app/dashboard/stripe/callback/route.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ManagerLayout from '@/app/dashboard/manager/ManagerLayout';

export default function StripeCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Exchanging code with Stripe...');
  const [error, setError] = useState('');

  useEffect(() => {
    // Recupera i parametri dalla query string
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    const managerId = urlParams.get('state'); // Se l’hai passato in state

    if (errorParam) {
      setError(`Stripe error: ${errorParam}`);
      setStatus('Impossibile completare l\'onboarding');
      return;
    }

    if (!code) {
      setError('Nessun code di Stripe presente nella query');
      setStatus('Impossibile completare l\'onboarding');
      return;
    }

    // Funzione per lo scambio del code con i token Stripe e poi il redirect
    async function exchangeCode() {
      try {
        const res = await fetch('/api/stripe/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, managerId }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Unknown error');
        }

        // In caso di successo, aggiorna lo stato e reindirizza
        setStatus('Stripe account connected successfully!');
        
        // Reindirizzamento immediato:
        router.push('/dashboard/manager/payments');

        // Oppure, se preferisci attendere qualche secondo prima di redirigere:
        // setTimeout(() => {
        //   router.push('/dashboard/manager/settings');
        // }, 3000);
        
      } catch (err) {
        console.error('Error exchanging code:', err);
        setError(err.message);
        setStatus('Impossibile completare l\'onboarding');
      }
    }

    exchangeCode();
  }, [router]);

  return (
    <ManagerLayout>
      <div style={{ textAlign: 'center' }}>
        <h1>Stripe Callback</h1>
        <p>{status}</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </ManagerLayout>
  );
}

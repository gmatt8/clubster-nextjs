'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StripeCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Exchanging code with Stripe...');
  const [error, setError] = useState('');

  // Aggiungiamo un pulsante per tornare ai payments
  function handleGoToPayments() {
    router.push('/dashboard/manager/payments');
  }

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

    // Chiama l'endpoint server-side per scambiare code e state con i token
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

        setStatus('Stripe account connected successfully!');
      } catch (err) {
        console.error('Error exchanging code:', err);
        setError(err.message);
        setStatus('Impossibile completare l\'onboarding');
      }
    }

    exchangeCode();
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Stripe Callback</h1>
      <p>{status}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* Bottone per andare alla pagina payments */}
      <button
        onClick={handleGoToPayments}
        style={{ marginTop: '1rem', padding: '0.75rem 1rem' }}
      >
        Go to Payments
      </button>
    </div>
  );
}

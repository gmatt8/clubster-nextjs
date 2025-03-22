'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // se necessario per recuperare stato dal DB
import ManagerLayout from '../ManagerLayout';

export default function ManagerPaymentsPage() {
  // Esempio di stato Stripe locale
  const [stripeStatus, setStripeStatus] = useState('loading'); 
  const [stripeEmail, setStripeEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Recupera l'utente e/o lo stato del club per capire se esiste un account Stripe associato
    //    Qui puoi chiamare un endpoint o fare una query al DB (clubs) per caricare stripe_account_id, stripe_status, ecc.

    async function fetchStripeStatus() {
      try {
        // ESEMPIO semplificato: 
        // const user = (await supabase.auth.getUser()).data.user;
        // Se hai l'id del manager, potresti fare:
        // const { data: club, error: clubError } = await supabase
        //   .from('clubs')
        //   .select('stripe_status, stripe_account_id')
        //   .eq('manager_id', user.id)
        //   .single();
        //
        // if (club?.stripe_status) {
        //   setStripeStatus(club.stripe_status);
        //   // se hai anche l'email associata, setStripeEmail(...)
        // } else {
        //   setStripeStatus('none');
        // }

        // Per questa demo, simuliamo 3 possibili stati: 'none', 'incomplete', 'active'
        // e mettiamo un timeout per simulare il caricamento.
        setTimeout(() => {
          // Esempio: passare a 'none', 'incomplete', o 'active'
          setStripeStatus('none'); 
        }, 1000);

      } catch (err) {
        console.error('Errore fetchStripeStatus:', err);
        setError('Impossibile recuperare lo stato Stripe');
        setStripeStatus('none');
      }
    }

    fetchStripeStatus();
  }, []);

  function handleConnectStripe() {
    // Sostituisci l'alert con la fetch al tuo endpoint
    fetch('/api/stripe/onboarding')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to get Stripe OAuth URL');
        }
        return res.json();
      })
      .then((data) => {
        // Reindirizza l’utente all’URL di Stripe
        window.location.href = data.url;
      })
      .catch((err) => {
        console.error('Error during Stripe onboarding:', err);
        // Se vuoi mostrare un messaggio d'errore all'utente, fai un alert o aggiorna lo stato
        alert('Errore durante la connessione a Stripe');
      });
  }
  

  function handleCompleteSetup() {
    // Se l'account esiste ma è incompleto, potresti reindirizzare
    // a un link di "accountLink" di Stripe per completare la configurazione
    alert('TODO: Reindirizzare a Stripe per completare la configurazione');
  }

  function handleGoToStripeDashboard() {
    // Potresti reindirizzare direttamente a https://dashboard.stripe.com/ 
    // o a un link personalizzato se hai un Express Dashboard
    alert('TODO: Aprire Stripe Dashboard');
  }

  return (
    <ManagerLayout>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Payments</h1>

      {stripeStatus === 'loading' && (
        <p>Loading Stripe status...</p>
      )}

      {stripeStatus === 'none' && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h2>Set Up Stripe Payment</h2>
          <p>
            To start receiving payments directly into your Stripe account, please connect your
            Stripe account now. Setup is fast, secure, and takes only a few minutes.
          </p>
          <button
            onClick={handleConnectStripe}
            style={{ padding: '0.75rem 1rem', backgroundColor: '#007bff', color: '#fff' }}
          >
            Connect Stripe Account
          </button>

          <div style={{ marginTop: '1rem' }}>
            <h3>Steps Explanation:</h3>
            <ol>
              <li>Click on "Connect Stripe Account": You will be redirected to Stripe to create or link your account.</li>
              <li>Complete the setup: Follow the on-screen instructions on Stripe to provide your details and set up your payment account.</li>
              <li>Return to the dashboard: Once completed, you'll be redirected back here, and your account will be ready to receive payments.</li>
            </ol>
          </div>
        </div>
      )}

      {stripeStatus === 'incomplete' && (
        <div style={{ border: '2px solid orange', padding: '1rem', borderRadius: '4px' }}>
          <h2>Stripe Payment</h2>
          <p style={{ color: 'orange', fontWeight: 'bold' }}>Action required: Incomplete Stripe Setup</p>
          <p>
            Your Stripe account has been connected but is not yet fully activated. Stripe requires
            additional information to enable payouts and payment processing.
          </p>
          <button
            onClick={handleCompleteSetup}
            style={{ padding: '0.75rem 1rem', backgroundColor: 'orange', color: '#fff' }}
          >
            Complete Setup Now
          </button>
        </div>
      )}

      {stripeStatus === 'active' && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h2>Stripe Payment</h2>
          <p style={{ color: 'green', fontWeight: 'bold' }}>Stripe account connected</p>
          <p>Account email: <strong>{stripeEmail || 'account-email@example.com'}</strong></p>
          <p>Status: <strong>Active</strong></p>
          <button
            onClick={handleGoToStripeDashboard}
            style={{ padding: '0.75rem 1rem', backgroundColor: '#007bff', color: '#fff' }}
          >
            Go to Stripe Dashboard
          </button>
          <p style={{ marginTop: '1rem' }}>
            Need to disconnect or change your Stripe account? Please contact our support team.
          </p>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </ManagerLayout>
  );
}

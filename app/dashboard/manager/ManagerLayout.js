'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ManagerLayout({ children }) {
  const [clubName, setClubName] = useState('Loading...');

  useEffect(() => {
    // Recupera l'utente corrente
    async function fetchClubName() {
      // 1. Ottieni l'utente loggato
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Errore nel recupero utente:', userError);
        setClubName('Error');
        return;
      }
      if (!user) {
        // L'utente non è loggato o non esiste sessione
        setClubName('No user');
        return;
      }

      // 2. Recupera il club dalla tabella "clubs"
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('name')
        .eq('manager_id', user.id)
        .maybeSingle(); // Ritorna un singolo record o null

      if (clubError) {
        console.error('Errore nel recupero club:', clubError);
        setClubName('Error');
        return;
      }
      if (!clubData) {
        // Se non esiste un club associato
        setClubName('No Club');
      } else {
        setClubName(clubData.name);
      }
    }

    fetchClubName();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '240px', backgroundColor: '#222', color: '#fff', padding: '1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2>Clubster Manager</h2>
        </div>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '1rem' }}>
              <Link href="/dashboard/manager/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>
                Dashboard
              </Link>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <Link href="/dashboard/manager/events" style={{ color: '#fff', textDecoration: 'none' }}>
                Events
              </Link>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <Link href="/dashboard/manager/bookings" style={{ color: '#fff', textDecoration: 'none' }}>
                Bookings
              </Link>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <Link href="/dashboard/manager/analytics" style={{ color: '#fff', textDecoration: 'none' }}>
                Analytics
              </Link>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <Link href="/dashboard/manager/payments" style={{ color: '#fff', textDecoration: 'none' }}>
                Payments
              </Link>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <Link href="/dashboard/manager/settings" style={{ color: '#fff', textDecoration: 'none' }}>
                Settings
              </Link>
            </li>
            <li style={{ marginTop: '2rem' }}>
              <Link href="/auth/manager/login" style={{ color: 'red', textDecoration: 'none' }}>
                Logout
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* CONTENUTO PRINCIPALE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ backgroundColor: '#fff', padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {/* Mostra il nome del club */}
              <h3 style={{ margin: 0 }}>{clubName}</h3>
            </div>
            <div>
              {/* Spazio per un avatar o un menu utente a destra */}
            </div>
          </div>
        </header>

        {/* Contenuto della pagina */}
        <main style={{ padding: '1rem', backgroundColor: '#f0f0f0', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

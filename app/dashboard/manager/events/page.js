'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import ManagerLayout from '../ManagerLayout';

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        // 1. Recupera l’utente manager
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError('Nessun utente loggato o errore nel recupero utente');
          setLoading(false);
          return;
        }

        // 2. Recupera il club associato a questo manager
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('id')
          .eq('manager_id', user.id)
          .single();

        if (clubError || !clubData) {
          setError('Impossibile recuperare il club del manager');
          setLoading(false);
          return;
        }

        // 3. Carica gli eventi associati al club
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('club_id', clubData.id)
          .order('created_at', { ascending: false });

        if (eventsError) {
          setError('Errore nel recupero degli eventi');
          setLoading(false);
          return;
        }

        setEvents(eventsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Errore generico nel recupero eventi');
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <ManagerLayout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>My Events</h1>

        {loading && <p>Loading events...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Bottone/link per creare un nuovo evento */}
        <div style={{ marginBottom: '1rem' }}>
          <Link
            href="/dashboard/manager/events/new-event"
            style={{ 
              padding: '0.75rem 1rem',
              backgroundColor: '#007bff',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            + Create New Event
          </Link>
        </div>

        {/* Se non ci sono errori e non stiamo caricando, mostra la lista eventi */}
        {!loading && !error && events.length === 0 && (
          <p>No events found.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((evt) => (
            <div key={evt.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
              <h2 style={{ margin: '0 0 0.5rem' }}>{evt.name}</h2>
              <p style={{ margin: '0 0 0.5rem' }}>{evt.description}</p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Date:</strong> {evt.event_date}
              </p>
              <p style={{ margin: '0', fontSize: '0.85rem', color: '#666' }}>
                Created at: {new Date(evt.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ManagerLayout>
  );
}

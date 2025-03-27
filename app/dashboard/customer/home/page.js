// app/dashboard/customer/home/page.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CustomerLayout from '../CustomerLayout';

const HomePage = () => {
  const [where, setWhere] = useState('');
  const [when, setWhen] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Chiamata all'API per effettuare la ricerca degli eventi in base a location e data
      const response = await fetch(
        `/api/search?location=${encodeURIComponent(where)}&date=${encodeURIComponent(when)}`
      );
      if (!response.ok) {
        throw new Error('Errore nella ricerca degli eventi');
      }
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Errore nella ricerca:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div>
        <h1>Benvenuto nella tua Home</h1>
        <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Where: 
              <input
                type="text"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                placeholder="Inserisci località"
                required
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              When: 
              <input
                type="date"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                required
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Cercando...' : 'Cerca'}
          </button>
        </form>

        <div>
          {events.length > 0 ? (
            <div>
              <h2>Eventi trovati:</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {events.map((event) => (
                  <Link key={event.id} href={`/dashboard/customer/club-details/${event.id}`}>
                    <div style={{
                      border: '1px solid #ccc',
                      padding: '1rem',
                      cursor: 'pointer'
                    }}>
                      <h3>{event.name}</h3>
                      <p>{event.description}</p>
                      <p>{new Date(event.event_date).toLocaleDateString()}</p>
                      {/* Se la location è presente nell'oggetto event */}
                      {event.location && <p>{event.location}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p>Nessun evento trovato.</p>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default HomePage;

'use client';

import { createBrowserSupabase } from "@/lib/supabase-browser";


import { useState, useEffect } from 'react';
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter } from 'next/navigation';
import ManagerLayout from '../../ManagerLayout';

export default function NewEventPage() {
  const router = useRouter();

  // Stato del manager (club_id)
  const [managerId, setManagerId] = useState(null);
  const [clubId, setClubId] = useState(null);

  // Campi dell’evento
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [musicGenre, setMusicGenre] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('');
  const [dressCode, setDressCode] = useState('');

  // Ticket categories
  const [ticketCategories, setTicketCategories] = useState([
    { name: 'Normal', price: 0, available_tickets: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 1. Recupera l’utente manager e il suo club
  useEffect(() => {
    async function fetchManager() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError('Errore nel recupero utente');
        return;
      }
      if (!user) {
        setError('Nessun utente loggato');
        return;
      }

      setManagerId(user.id);

      // Recupera il club associato a questo manager
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('id')
        .eq('manager_id', user.id)
        .single();

      if (clubError || !clubData) {
        setError('Impossibile recuperare il club del manager');
        return;
      }

      setClubId(clubData.id);
    }

    fetchManager();
  }, []);

  // Aggiunge una nuova categoria di ticket
  function handleAddCategory() {
    setTicketCategories([
      ...ticketCategories,
      { name: '', price: 0, available_tickets: 0 },
    ]);
  }

  // Rimuove una categoria
  function handleRemoveCategory(index) {
    const updated = [...ticketCategories];
    updated.splice(index, 1);
    setTicketCategories(updated);
  }

  // Aggiorna i campi di una categoria
  function handleCategoryChange(index, field, value) {
    const updated = [...ticketCategories];
    updated[index][field] = value;
    setTicketCategories(updated);
  }

  // 2. Submit dell’evento
  async function handleSubmit(e) {
    e.preventDefault();
    if (!clubId) {
      setError('Nessun club associato. Impossibile creare evento.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Combina data e ora di inizio in un'unica stringa (event_date)
      const eventDateString = `${startDate} ${startTime}`;

      // Creazione dell’evento (chiamata a /api/event)
      const eventRes = await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_id: clubId,
          name,
          // Inseriamo info aggiuntive nella description
          description: `${description}\nMusic Genre: ${musicGenre}\nAge Restriction: ${ageRestriction}\nDress Code: ${dressCode}\nEnd Date: ${endDate} ${endTime}`,
          event_date: eventDateString,
        }),
      });

      if (!eventRes.ok) {
        const errData = await eventRes.json();
        throw new Error(errData.error || 'Errore creazione evento');
      }

      const newEvent = await eventRes.json();
      // newEvent è un array con l'evento creato => newEvent[0].id
      const eventId = newEvent[0].id;

      // Creazione delle ticket categories
      for (let cat of ticketCategories) {
        const ticketRes = await fetch('/api/ticket-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: eventId,
            name: cat.name,
            price: cat.price,
            available_tickets: cat.available_tickets,
          }),
        });
        if (!ticketRes.ok) {
          const errTicket = await ticketRes.json();
          throw new Error(errTicket.error || 'Errore creazione ticket category');
        }
      }

      setMessage('Evento creato con successo!');
      // Reindirizza alla pagina eventi dopo 2 secondi
      setTimeout(() => {
        router.push('/dashboard/manager/events');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ManagerLayout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Create New Event</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Event Name*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ display: 'block', width: '100%' }}
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ display: 'block', width: '100%', height: '80px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label>Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label>Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>Music Genre</label>
            <input
              type="text"
              value={musicGenre}
              onChange={(e) => setMusicGenre(e.target.value)}
              style={{ display: 'block', width: '100%' }}
            />
          </div>

          <div>
            <label>Age Restriction</label>
            <input
              type="text"
              value={ageRestriction}
              onChange={(e) => setAgeRestriction(e.target.value)}
              style={{ display: 'block', width: '100%' }}
              placeholder="+21"
            />
          </div>

          <div>
            <label>Dress Code</label>
            <input
              type="text"
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              style={{ display: 'block', width: '100%' }}
              placeholder="Casual, Formal, etc."
            />
          </div>

          <hr />

          <h2>Ticket Categories</h2>
          {ticketCategories.map((cat, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
              <label>Category Name</label>
              <input
                type="text"
                value={cat.name}
                onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }}
              />
              <label>Price</label>
              <input
                type="number"
                value={cat.price}
                onChange={(e) => handleCategoryChange(index, 'price', e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }}
              />
              <label>No. of tickets</label>
              <input
                type="number"
                value={cat.available_tickets}
                onChange={(e) => handleCategoryChange(index, 'available_tickets', e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }}
              />

              {ticketCategories.length > 1 && (
                <button type="button" onClick={() => handleRemoveCategory(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddCategory}>+ Add category</button>

          <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '0.75rem 1rem' }}>
            {loading ? 'Saving...' : 'Create Event'}
          </button>
        </form>
      </div>
    </ManagerLayout>
  );
}

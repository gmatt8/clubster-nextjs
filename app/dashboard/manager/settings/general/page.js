'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ManagerLayout from '../../ManagerLayout';

export default function ManagerSettingsGeneralPage() {
  const [managerId, setManagerId] = useState(null);

  // Campi del club
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [outdoorArea, setOutdoorArea] = useState('not available');
  const [parking, setParking] = useState('not available');
  const [price, setPrice] = useState('$');
  const [smoking, setSmoking] = useState('not allowed');
  const [coatCheck, setCoatCheck] = useState('not available');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 1. Recupera l'utente loggato e carica i dati del club
  useEffect(() => {
    async function fetchClubData() {
      const {
        data: { user },
        error: userError
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

      // Recupera i dati del club
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('manager_id', user.id)
        .maybeSingle();

      if (clubError) {
        setError('Errore nel recupero dati del club');
        return;
      }

      if (clubData) {
        // Popola i campi
        setName(clubData.name || '');
        setAddress(clubData.address || '');
        setPhoneNumber(clubData.phone_number || '');
        setDescription(clubData.description || '');
        setCapacity(clubData.capacity ?? 0);
        setOutdoorArea(clubData.outdoor_area || 'not available');
        setParking(clubData.parking || 'not available');
        setPrice(clubData.price || '$');
        setSmoking(clubData.smoking || 'not allowed');
        setCoatCheck(clubData.coat_check || 'not available');
      }
    }

    fetchClubData();
  }, []);

  // 2. Salva i dati aggiornati
  async function handleSave(e) {
    e.preventDefault();
    if (!managerId) {
      setError('Impossibile determinare il manager ID');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const response = await fetch('/api/club', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        manager_id: managerId,
        name,
        address,
        phone_number: phoneNumber,
        description,
        capacity: Number(capacity),
        outdoor_area: outdoorArea,
        parking,
        price,
        smoking,
        coat_check: coatCheck
      }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || 'Errore sconosciuto durante l\'aggiornamento del club');
      return;
    }

    setMessage('Dati aggiornati con successo!');
  }

  return (
    <ManagerLayout>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>General Settings</h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
        <div>
          <label>Club Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
            required
          />
        </div>

        <div>
          <label>Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          />
        </div>

        <div>
          <label>Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem', height: '80px' }}
          />
        </div>

        <div>
          <label>Capacity</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          />
        </div>

        <div>
          <label>Outdoor Area</label>
          <select
            value={outdoorArea}
            onChange={(e) => setOutdoorArea(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          >
            <option value="available">available</option>
            <option value="not available">not available</option>
          </select>
        </div>

        <div>
          <label>Parking</label>
          <select
            value={parking}
            onChange={(e) => setParking(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          >
            <option value="available">available</option>
            <option value="not available">not available</option>
          </select>
        </div>

        <div>
          <label>Price</label>
          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          >
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </div>

        <div>
          <label>Smoking</label>
          <select
            value={smoking}
            onChange={(e) => setSmoking(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          >
            <option value="allowed">allowed</option>
            <option value="not allowed">not allowed</option>
          </select>
        </div>

        <div>
          <label>Coat Check</label>
          <select
            value={coatCheck}
            onChange={(e) => setCoatCheck(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
          >
            <option value="available">available</option>
            <option value="not available">not available</option>
          </select>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <button
          type="submit"
          style={{ padding: '0.75rem 1rem', backgroundColor: '#007bff', color: '#fff' }}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </ManagerLayout>
  );
}

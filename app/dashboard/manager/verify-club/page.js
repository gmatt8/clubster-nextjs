"use client";
import { useState, useEffect, useRef } from 'react';
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter } from 'next/navigation';

export default function VerifyClubPage() {
  const router = useRouter();
  const supabase = createBrowserSupabase();

  // Campi del form
  const [clubName, setClubName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [docUrl, setDocUrl] = useState('');

  // Checkbox
  const [confirmBusiness, setConfirmBusiness] = useState(false);
  const [confirmLicenses, setConfirmLicenses] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);

  // Errori e stato di caricamento
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ID manager loggato
  const [managerId, setManagerId] = useState(null);

  // Ref per l'input address
  const addressInputRef = useRef(null);

  // Recupero utente loggato
  useEffect(() => {
    async function getUser() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError('Errore nel recupero utente');
      } else if (user) {
        setManagerId(user.id);
      }
    }
    getUser();
  }, [supabase]);

  // Inizializza Autocomplete di Google Maps
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps JS non è ancora caricato");
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      types: ["geocode"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return; // se l'utente digita e non seleziona un suggerimento, place.geometry può mancare

      const latVal = place.geometry.location.lat();
      const lngVal = place.geometry.location.lng();
      setLat(latVal);
      setLng(lngVal);

      const formattedAddress = place.formatted_address || "";
      setAddress(formattedAddress);
    });
  }, []);

  // Verifica se il form è compilato
  const isFormValid = () => {
    return (
      clubName.trim() !== '' &&
      address.trim() !== '' &&
      phoneNumber.trim() !== '' &&
      docUrl.trim() !== '' &&
      confirmBusiness &&
      confirmLicenses &&
      confirmTerms
    );
  };

  // Invio form
  async function handleSubmit(e) {
    e.preventDefault();

    if (!managerId) {
      setError('Impossibile recuperare l\'ID del manager');
      return;
    }

    setLoading(true);
    setError('');

    // Invio i dati all'endpoint /api/club (POST)
    const response = await fetch('/api/club', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        manager_id: managerId,
        name: clubName,
        address,
        phone_number: phoneNumber,
        doc_url: docUrl,
        lat,
        lng,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || 'Errore sconosciuto durante la creazione del club');
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/dashboard/manager/dashboard');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Club Verification</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Club Name</label>
          <input
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
            required
          />
        </div>

        <div>
          <label>Address</label>
          <input
            ref={addressInputRef}
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
            required
          />
        </div>

        <div>
          <label>Phone number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
            required
          />
        </div>

        <div>
          <label>Upload Document (URL o info)</label>
          <input
            type="text"
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
            required
          />
        </div>

        {/* Checkbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label>
            <input
              type="checkbox"
              checked={confirmBusiness}
              onChange={(e) => setConfirmBusiness(e.target.checked)}
            />
            &nbsp;I confirm that the club complies with all local legal and licensing requirements
          </label>
          <label>
            <input
              type="checkbox"
              checked={confirmLicenses}
              onChange={(e) => setConfirmLicenses(e.target.checked)}
            />
            &nbsp;I confirm that the club holds all necessary operational licenses
          </label>
          <label>
            <input
              type="checkbox"
              checked={confirmTerms}
              onChange={(e) => setConfirmTerms(e.target.checked)}
            />
            &nbsp;I have read and accept the Terms &amp; Conditions and Privacy Policy
          </label>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button
          type="submit"
          style={{ padding: '0.75rem 1rem', backgroundColor: '#007bff', color: '#fff' }}
          disabled={!isFormValid() || loading}
        >
          {loading ? 'Saving...' : 'Next'}
        </button>
      </form>
    </div>
  );
}

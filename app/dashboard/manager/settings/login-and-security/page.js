'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserSupabase } from "@/lib/supabase-browser";
import ManagerLayout from '../../ManagerLayout';

export default function ManagerSettingsLoginSecurityPage() {
  // Crea l'istanza di supabase una sola volta
  const supabase = useMemo(() => createBrowserSupabase(), []);

  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);

  // Campi per cambio password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Messaggi di stato
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Al mount, recupera l'utente loggato
  useEffect(() => {
    async function getUser() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError('Errore nel recupero utente');
      } else if (user) {
        setUserEmail(user.email);
        setUserId(user.id);
      }
    }
    getUser();
  }, [supabase]);

  // Funzione per cambiare la password
  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    // Verifica che i campi siano compilati correttamente
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Compila tutti i campi');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('La nuova password e la conferma non coincidono');
      return;
    }
    if (!userEmail) {
      setError('Impossibile determinare l\'email utente');
      return;
    }

    setLoading(true);

    try {
      // Verifica la password attuale (ri-effettua il login con email e currentPassword)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        setError('La password attuale non è corretta');
        setLoading(false);
        return;
      }

      // Se la verifica è ok, aggiorna la password
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setMessage('Password aggiornata con successo!');
    } catch (err) {
      setError('Errore sconosciuto durante il cambio password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ManagerLayout>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Login and Security</h1>

      <div style={{ maxWidth: '400px' }}>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
              required
            />
          </div>
          <div>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
              required
            />
          </div>
          <div>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '0.75rem 1rem', backgroundColor: '#007bff', color: '#fff' }}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>

        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
      </div>
    </ManagerLayout>
  );
}

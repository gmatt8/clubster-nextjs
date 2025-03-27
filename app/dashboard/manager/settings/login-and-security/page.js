'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClientClient';
import ManagerLayout from '../../ManagerLayout';

export default function ManagerSettingsLoginSecurityPage() {
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
  }, []);

  // 1. Funzione per cambiare la password
  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    // Verifica che i campi siano coerenti
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
      // 1. Verifica la password attuale (ri-effettua login con email e currentPassword)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        setError('La password attuale non è corretta');
        setLoading(false);
        return;
      }

      // 2. Se la verifica è ok, aggiorna la password
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

  // 2. Funzione per disattivare/cancellare l'account
  async function handleDeactivateAccount() {
    setError('');
    setMessage('');

    if (!userId) {
      setError('Impossibile determinare l\'ID utente');
      return;
    }

    // Chiamata a un endpoint server-side che usa la Service Role Key per eliminare l'utente
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        const result = await response.json();
        setError(result.error || 'Errore sconosciuto durante la cancellazione account');
        return;
      }
      // Se l'account è stato cancellato con successo
      setMessage('Account eliminato. Verrai reindirizzato...');
      // Opzionalmente fai logout o reindirizza
      setTimeout(() => {
        supabase.auth.signOut();
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError('Errore sconosciuto durante la cancellazione account');
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

        <hr style={{ margin: '2rem 0' }} />

        <div>
          <p style={{ color: 'red', fontWeight: 'bold' }}>Deactivate account</p>
          <p>If you deactivate your account, all your data will be permanently deleted.</p>
          <button
            onClick={handleDeactivateAccount}
            style={{ padding: '0.75rem 1rem', backgroundColor: 'red', color: '#fff' }}
          >
            Deactivate account
          </button>
        </div>

        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
      </div>
    </ManagerLayout>
  );
}

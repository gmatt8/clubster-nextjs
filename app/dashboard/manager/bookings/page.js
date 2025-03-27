'use client';

import { createBrowserSupabase } from "@/lib/supabase-browser";


import ManagerLayout from '../ManagerLayout';

export default function ManagerBookingsPage() {
  return (
    <ManagerLayout>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Bookings</h1>
      <p>Qui puoi gestire le prenotazioni.</p>
    </ManagerLayout>
  );
}

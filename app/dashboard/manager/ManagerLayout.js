'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-server'; // <-- SOLO CLIENT!

export default function ManagerLayout({ children }) {
  const [clubName, setClubName] = useState('Loading...');

  useEffect(() => {
    async function fetchClubName() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Errore nel recupero utente:', userError);
        setClubName(userError ? 'Error' : 'No user');
        return;
      }

      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('name')
        .eq('manager_id', user.id)
        .maybeSingle();

      if (clubError || !clubData) {
        console.error('Errore nel recupero club:', clubError);
        setClubName(clubError ? 'Error' : 'No Club'); 
      } else {
        setClubName(clubData.name);
      }
    }

    fetchClubName(); 
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar e Header qui */}
      {children}
    </div>
  );
}

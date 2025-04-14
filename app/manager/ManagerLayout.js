// app/manager/ManagerLayout.js
"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";

// IMPORTA i componenti Sidebar e Header
import Sidebar from "@/components/manager/layout/sidebar";
import Header from "@/components/manager/layout/header";

export default function ManagerLayout({ children }) {
  const [clubName, setClubName] = useState("Loading...");
  const supabase = createBrowserSupabase();

  useEffect(() => {
    async function fetchClubName() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Errore nel recupero utente:", userError);
        setClubName(userError ? "Error" : "No user");
        return;
      }

      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select("name")
        .eq("manager_id", user.id)
        .maybeSingle();

      if (clubError || !clubData) {
        console.error("Errore nel recupero club:", clubError);
        setClubName(clubError ? "Error" : "No Club");
      } else {
        setClubName(clubData.name);
      }
    }

    fetchClubName();
  }, [supabase]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR a sinistra */}
      <Sidebar />

      {/* Colonna di destra (Header in alto, contenuto sotto) */}
      <div className="flex flex-1 flex-col">
        <Header clubName={clubName} />
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

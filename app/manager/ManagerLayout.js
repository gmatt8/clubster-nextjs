// app/manager/ManagerLayout.js
"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import Sidebar from "@/components/manager/layout/sidebar";
import Header from "@/components/manager/layout/header";

export default function ManagerLayout({ children }) {
  const [clubName, setClubName] = useState(null);
  const [isMounted, setIsMounted] = useState(false); // 👈 AGGIUNTO
  const supabase = createBrowserSupabase();

  useEffect(() => {
    setIsMounted(true); // ✅ Ora siamo nel client

    const savedName = localStorage.getItem("clubName");
    if (savedName) {
      setClubName(savedName);
    }

    const fetchClubName = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setClubName("Utente non trovato");
          return;
        }

        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select("name")
          .eq("manager_id", user.id)
          .maybeSingle();

        if (clubError || !clubData) {
          setClubName("Club non trovato");
        } else {
          setClubName(clubData.name);
          localStorage.setItem("clubName", clubData.name);
        }
      } catch (err) {
        setClubName("Errore");
      }
    };

    if (!savedName) {
      fetchClubName();
    }
  }, []);

  if (!isMounted) return null; // ⛔️ Blocca tutto fino al mount per evitare mismatch

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header clubName={clubName || "Caricamento..."} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

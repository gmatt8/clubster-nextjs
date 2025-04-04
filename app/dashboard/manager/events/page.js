// /app/dashboard/manager/events/page.js
"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import ManagerLayout from "../ManagerLayout";

// Import dei componenti
import EventsSidebar from "@/components/manager/events/sidebar";
import EventsCalendar from "@/components/manager/events/calendar";

export default function EventsPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();

  const [managerId, setManagerId] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        // 1) Recupera l'utente loggato
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("Nessun utente loggato o errore nel recupero utente");
          return;
        }
        setManagerId(user.id);

        // 2) Recupera il club associato al manager
        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select("id")
          .eq("manager_id", user.id)
          .single();

        if (clubError || !clubData) {
          setError("Impossibile recuperare il club del manager");
          return;
        }
        setClubId(clubData.id);

        // 3) Recupera la lista degli eventi
        const res = await fetch(`/api/event?club_id=${clubData.id}`, {
          method: "GET",
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Errore nel recupero eventi");
        }
        const eventsList = await res.json();
        setEvents(eventsList.events || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }
    fetchData();
  }, [supabase]);

  function goToNewEvent() {
    router.push("/dashboard/manager/events/new-event");
  }

  function goToEditEvent(eventId) {
    router.push(`/dashboard/manager/events/edit-event?event_id=${eventId}`);
  }

  return (
    <ManagerLayout>
      {/* Titolo della sezione "Events" */}
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Events</h1>
      </div>

      {/* Layout a colonne con maggiore spazio tra Sidebar e Calendario */}
      <div className="flex flex-col md:flex-row gap-8 h-full">
        <EventsSidebar
          events={events}
          onNewEvent={goToNewEvent}
          onEditEvent={goToEditEvent}
        />
        <EventsCalendar events={events} />
      </div>

      {/* Messaggio di errore */}
      {error && (
        <div className="p-4 text-red-600 text-center">
          <p>{error}</p>
        </div>
      )}
    </ManagerLayout>
  );
}

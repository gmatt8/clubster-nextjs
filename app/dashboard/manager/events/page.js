"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import ManagerLayout from "../ManagerLayout";

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

        // 3) Recupera la lista degli eventi filtrati per club_id
        const res = await fetch(`/api/event?club_id=${clubData.id}`, {
          method: "GET",
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Errore nel recupero eventi");
        }
        const eventsList = await res.json();
        // Assicurati di estrarre la proprietà events (che è un array)
        setEvents(eventsList.events);
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
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>My Events</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={goToNewEvent} style={{ marginBottom: "1rem" }}>
          + Create New Event
        </button>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {events.map((evt) => (
            <li
              key={evt.id}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1rem",
                cursor: "pointer",
              }}
              onClick={() => goToEditEvent(evt.id)}
            >
              <h2 style={{ margin: 0 }}>{evt.name}</h2>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
                {evt.start_date ? new Date(evt.start_date).toLocaleString() : "No date"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </ManagerLayout>
  );
}

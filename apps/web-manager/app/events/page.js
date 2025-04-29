// /apps/web-manager/app/events/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@lib/supabase-browser";
import ManagerLayout from "../ManagerLayout";

import EventsSidebar from "@/components/events/sidebar";
import EventsCalendar from "@/components/events/calendar";

export default function EventsPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();

  const [managerId, setManagerId] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [clubStripeStatus, setClubStripeStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("Nessun utente loggato o errore nel recupero utente");
          return;
        }

        setManagerId(user.id);

        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select("id, stripe_account_id, stripe_status")
          .eq("manager_id", user.id)
          .single();

        if (clubError || !clubData) {
          setError("Impossibile recuperare il club del manager");
          return;
        }

        setClubId(clubData.id);
        setClubStripeStatus(clubData.stripe_status);

        const res = await fetch(`/api/event?club_id=${clubData.id}`);
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
    if (clubStripeStatus !== "active") {
      alert("Devi collegare Stripe per creare un evento.");
      router.push("/payments");
    } else {
      router.push("/events/new-event");
    }
  }

  function goToEditEvent(eventId) {
    router.push(`/events/edit-event?event_id=${eventId}`);
  }

  return (
    <ManagerLayout>
      {/* Titolo coerente come nella Dashboard */}
      <h1 className="text-3xl font-semibold mb-6 tracking-tight">Events</h1>

      <div className="flex flex-col md:flex-row gap-8 h-full">
        <EventsSidebar
          events={events}
          onNewEvent={goToNewEvent}
          onEditEvent={goToEditEvent}
        />
        <EventsCalendar events={events} />
      </div>

      {error && (
        <div className="mt-4 p-4 text-red-600 text-center bg-red-50 border border-red-200 rounded">
          <p>{error}</p>
        </div>
      )}
    </ManagerLayout>
  );
}

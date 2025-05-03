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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("No user logged in or failed to fetch user data.");
          return;
        }

        setManagerId(user.id);

        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select("id, stripe_account_id, stripe_status")
          .eq("manager_id", user.id)
          .single();

        if (clubError || !clubData) {
          setError("Unable to retrieve the manager's club.");
          return;
        }

        setClubId(clubData.id);
        setClubStripeStatus(clubData.stripe_status);

        const res = await fetch(`/api/events?club_id=${clubData.id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch events.");
        }

        const eventsList = await res.json();
        setEvents(eventsList.events || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  function goToNewEvent() {
    if (clubStripeStatus !== "active") {
      alert("You must connect Stripe to create an event.");
      router.push("/payments");
    } else {
      router.push("/events/new-event");
    }
  }

  function goToEditEvent(eventId) {
    router.push(`/events/detail-event?event_id=${eventId}`);
  }

  return (
    <ManagerLayout>
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 tracking-tight text-gray-900">Events</h1>

        <div className="flex flex-col md:flex-row gap-8">
          <EventsSidebar
            events={events}
            loading={loading}
            onNewEvent={goToNewEvent}
            onEditEvent={goToEditEvent}
          />
          <EventsCalendar events={events} loading={loading} />
        </div>

        {error && (
          <div className="mt-6 p-4 text-red-600 text-center bg-red-50 border border-red-200 rounded">
            <p>{error}</p>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
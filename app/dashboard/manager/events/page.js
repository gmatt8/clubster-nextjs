"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ManagerLayout from "../ManagerLayout";
import EventsList from "@/components/manager/events/eventsList";

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await fetch("/api/event");
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Errore generico nel recupero eventi");
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Errore generico nel recupero eventi");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <ManagerLayout>
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Events</h1>

        {/* Bottone per creare un nuovo evento */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/dashboard/manager/events/new-event"
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "#007bff",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            + New Event
          </Link>
        </div>

        {loading && <p>Loading events...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && events.length === 0 && <p>No events found.</p>}

        {!loading && !error && events.length > 0 && (
          <EventsList events={events} />
        )}
      </div>
    </ManagerLayout>
  );
}

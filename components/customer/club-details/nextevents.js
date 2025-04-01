"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NextEvents({ clubId, selectedEventId }) {
  const router = useRouter();
  
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [selectedTicketCategory, setSelectedTicketCategory] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Recupera gli eventi futuri del club
  useEffect(() => {
    async function fetchEvents() {
      try {
        // Assumi che l'endpoint /api/events gestisca il parametro upcoming=true
        const res = await fetch(`/api/event?club_id=${clubId}&upcoming=true`);
        if (!res.ok) throw new Error("Error fetching events");
        const { events: data } = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    if (clubId) {
      fetchEvents();
    }
  }, [clubId]);

  // Pre-seleziona l'evento: se è presente selectedEventId, usa quello, altrimenti usa il primo evento
  useEffect(() => {
    if (events.length === 0) return;
    if (selectedEventId) {
      const ev = events.find((e) => e.id === selectedEventId);
      setSelectedEvent(ev || events[0]);
    } else {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEventId]);

  // Quando l'evento selezionato cambia, recupera le ticket categories
  useEffect(() => {
    async function fetchTicketCategories() {
      if (!selectedEvent) return;
      try {
        const res = await fetch(`/api/ticket-category?event_id=${selectedEvent.id}`);
        if (!res.ok) throw new Error("Error fetching ticket categories");
        const { ticketCategories: categories } = await res.json();
        setTicketCategories(categories || []);
        if (categories && categories.length > 0) {
          setSelectedTicketCategory(categories[0].id); // pre-seleziona la prima categoria
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchTicketCategories();
  }, [selectedEvent]);

  // Funzione per il Book Now
  function handleBookNow() {
    router.push(
        `/dashboard/customer/basket?event_id=${selectedEvent.id}&ticket_category=${selectedTicketCategory}&quantity=${quantity}`
      );
  }

  if (!selectedEvent) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Next events</h2>
        <p>No upcoming events available.</p>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Next events</h2>
      <div className="flex gap-8">
        {/* Calendario placeholder */}
        <div className="border border-gray-300 p-4 rounded w-48 h-48 flex items-center justify-center">
          <span className="text-gray-500">Calendar placeholder</span>
        </div>

        {/* Informazioni sull'evento selezionato */}
        <div className="flex flex-col space-y-2">
          <span className="font-semibold text-gray-800 text-lg">
            {selectedEvent.name}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(selectedEvent.start_date).toLocaleDateString()}
          </span>
          <span className="text-sm text-gray-500">
            {selectedEvent.start_date
              ? new Date(selectedEvent.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ""}
            {" - "}
            {selectedEvent.end_date
              ? new Date(selectedEvent.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ""}
          </span>
          <div className="flex items-center gap-2 mt-2">
            {/* Dropdown per selezionare la categoria di ticket */}
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={selectedTicketCategory}
              onChange={(e) => setSelectedTicketCategory(e.target.value)}
            >
              {ticketCategories.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.name} - €{tc.price}
                </option>
              ))}
            </select>
            {/* Input per la quantità */}
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border border-gray-300 rounded w-16 px-2 py-1"
            />
            {/* Bottone "Book now" */}
            <button
              onClick={handleBookNow}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Book now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

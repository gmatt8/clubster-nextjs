"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import CustomerLayout from "../CustomerLayout";

export default function BasketPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");
  const initialTicketCategoryId = searchParams.get("ticket_category");
  const initialQuantity = Number(searchParams.get("quantity")) || 1;

  // Stati per l'evento, le ticket categories, e la selezione dell'utente
  const [eventData, setEventData] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [selectedTicketCategoryId, setSelectedTicketCategoryId] = useState(initialTicketCategoryId || "");
  const [quantity, setQuantity] = useState(initialQuantity);

  // Stati di caricamento ed errori
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Al mount o quando eventId cambia, carichiamo l'evento e le categories
  useEffect(() => {
    if (!eventId) return;

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // 1) Recupera i dati dell'evento
        const eventRes = await fetch(`/api/event?event_id=${eventId}`);
        if (!eventRes.ok) {
          const errText = await eventRes.text();
          throw new Error(`Error fetching event: ${errText}`);
        }
        const { events } = await eventRes.json();
        if (!events || events.length === 0) {
          throw new Error("Event not found");
        }
        const currentEvent = events[0];
        setEventData(currentEvent);

        // 2) Recupera le ticket categories
        const catRes = await fetch(`/api/ticket-category?event_id=${eventId}`);
        if (!catRes.ok) {
          const errText = await catRes.text();
          throw new Error(`Error fetching ticket categories: ${errText}`);
        }
        const { ticketCategories: cats } = await catRes.json();
        setTicketCategories(cats || []);

        // Se non esiste più la category selezionata inizialmente, resettiamo
        if (initialTicketCategoryId && !cats.find((c) => c.id === initialTicketCategoryId)) {
          setSelectedTicketCategoryId(cats.length > 0 ? cats[0].id : "");
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eventId]);

  // Calcoliamo la ticket category selezionata
  const selectedCategory = ticketCategories.find((cat) => cat.id === selectedTicketCategoryId);

  // Calcoliamo il prezzo totale (se c'è una ticket category)
  const totalPrice = selectedCategory ? selectedCategory.price * quantity : 0;

  // Se manca eventId, mostriamo un messaggio
  if (!eventId) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-xl mx-auto">
          <p>Missing event_id</p>
        </div>
      </CustomerLayout>
    );
  }

  // Se stiamo caricando i dati, mostriamo un loading
  if (loading) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-xl mx-auto">
          <p>Loading...</p>
        </div>
      </CustomerLayout>
    );
  }

  // Se c'è un errore, lo mostriamo
  if (error) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-xl mx-auto">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </CustomerLayout>
    );
  }

  // Layout stile wireframe
  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Basket</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Colonna sinistra */}
          <div className="flex-1 border border-gray-300 p-4 rounded">
            {/* Nome Club e Nome Evento (se l'evento ha club_name, altrimenti placeholder) */}
            <h2 className="text-lg font-semibold mb-2">{eventData?.club_name || "Club Name"}</h2>
            <p className="text-gray-600 mb-4">
              {eventData?.name || "Event name"}
            </p>

            {/* Selezione Ticket Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket category
              </label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={selectedTicketCategoryId}
                onChange={(e) => setSelectedTicketCategoryId(e.target.value)}
              >
                {ticketCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.price} CHF)
                  </option>
                ))}
              </select>
            </div>

            {/* Selezione quantità */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guests
              </label>
              <input
                type="number"
                min="1"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Colonna destra: Price details */}
          <div className="w-full md:w-72 border border-gray-300 p-4 rounded flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-4">Price details</h3>
              <div className="text-sm text-gray-700">
                {/* Nome Evento */}
                <p className="mb-1">
                  {eventData?.name || "Event Name"}
                </p>
                {/* Ticket Category x quantity */}
                <p className="mb-1">
                  {selectedCategory
                    ? `${selectedCategory.name} x ${quantity} guests`
                    : "No ticket category"}
                </p>
                {/* Totale */}
                <p className="font-medium">
                  Total (CHF): {totalPrice} CHF
                </p>
              </div>
            </div>
            <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

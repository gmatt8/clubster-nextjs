// app/manager/new-event/page.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabase } from "@lib/supabase-browser";
import { useRouter } from "next/navigation";
import ManagerLayout from "../../ManagerLayout";
import UploadEventImage from "@components/events/UploadEventImage";
import DatePicker from "@components/events/DataTimePicker";
import EventHeader from "@components/events/EventHeader";

// Lista predefinita dei generi musicali
const predefinedGenres = [
  "Techno", 
  "Pop", 
  "Rock", 
  "Jazz", 
  "Hip-Hop", 
  "EDM", 
  "Classical", 
  "Reggae"
];

export default function NewEventPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const router = useRouter();

  const [managerId, setManagerId] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [clubStripeStatus, setClubStripeStatus] = useState(null);

  // Campi dell'evento
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [musicGenres, setMusicGenres] = useState([]); // Array per generi musicali
  const [ageRestriction, setAgeRestriction] = useState("");
  const [dressCode, setDressCode] = useState("");

  // Stato per le ticket categories
  const [ticketCategories, setTicketCategories] = useState([
    { name: "Normal", price: 0, available_tickets: 0 },
  ]);

  // Stato per la foto evento
  const [eventImage, setEventImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchManager() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          setError("Errore nel recupero utente");
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
      } catch (err) {
        console.error(err);
        setError("Errore sconosciuto nel recupero manager/club");
      }
    }
    fetchManager();
  }, [supabase]);

  if (clubStripeStatus !== "active") {
    return (
      <ManagerLayout>
        <div className="px-6 py-8 max-w-screen-md mx-auto text-center">
          <h1 className="text-xl font-bold mb-4">Create New Event</h1>
          <p className="text-gray-700">
            Per creare un nuovo evento, devi collegare il tuo account Stripe.
          </p>
          <button
            onClick={() => router.push("/manager/payments")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Collegare Stripe
          </button>
        </div>
      </ManagerLayout>
    );
  }

  // Funzioni per la gestione delle Ticket Categories
  function handleAddCategory() {
    setTicketCategories([...ticketCategories, { name: "", price: 0, available_tickets: 0 }]);
  }

  function handleRemoveCategory(index) {
    const updated = [...ticketCategories];
    updated.splice(index, 1);
    setTicketCategories(updated);
  }

  function handleCategoryChange(index, field, value) {
    const updated = [...ticketCategories];
    updated[index][field] = value;
    setTicketCategories(updated);
  }

  // Gestione dei checkbox per Music Genres
  function handleGenreCheckboxChange(genre, isChecked) {
    if (isChecked) {
      if (musicGenres.length >= 3) {
        setError("Puoi selezionare al massimo 3 generi musicali.");
        return;
      }
      setMusicGenres((prev) => [...prev, genre]);
    } else {
      setMusicGenres((prev) => prev.filter((g) => g !== genre));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!clubId) {
      setError("Nessun club associato. Impossibile creare evento.");
      return;
    }
    if (!name.trim()) {
      setError("Il nome dell'evento è obbligatorio.");
      return;
    }
    if (!startDate || !startTime) {
      setError("Data e ora d'inizio sono obbligatorie.");
      return;
    }
    if (!endDate || !endTime) {
      setError("Data e ora di fine sono obbligatorie.");
      return;
    }
    if (musicGenres.length === 0) {
      setError("Seleziona almeno un genere musicale.");
      return;
    }

    const startDateTimeStr = `${startDate}T${startTime}:00`;
    const endDateTimeStr = `${endDate}T${endTime}:00`;
    const startDateObj = new Date(startDateTimeStr);
    const endDateObj = new Date(endDateTimeStr);
    if (isNaN(startDateObj.getTime())) {
      setError("Il formato della data/ora d'inizio non è valido.");
      return;
    }
    if (isNaN(endDateObj.getTime())) {
      setError("Il formato della data/ora di fine non è valido.");
      return;
    }
    const startDateISO = startDateObj.toISOString();
    const endDateISO = endDateObj.toISOString();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Creazione evento
      const eventRes = await fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          club_id: clubId,
          name,
          description,
          start_date: startDateISO,
          end_date: endDateISO,
          music_genres: musicGenres, // inviamo l'array
          age_restriction: ageRestriction,
          dress_code: dressCode,
          image: eventImage,
        }),
      });
      if (!eventRes.ok) {
        const errData = await eventRes.json();
        throw new Error(errData.error || "Errore creazione evento");
      }
      const newEvent = await eventRes.json();
      const eventId = newEvent[0].id;

      // Creazione ticket categories associate
      for (let cat of ticketCategories) {
        const ticketRes = await fetch("/api/ticket-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            event_id: eventId,
            name: cat.name,
            price: cat.price,
            available_tickets: cat.available_tickets,
          }),
        });
        if (!ticketRes.ok) {
          const errTicket = await ticketRes.json();
          throw new Error(errTicket.error || "Errore creazione ticket category");
        }
      }
      setMessage("Evento creato con successo!");
      setTimeout(() => {
        router.push("/events");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ManagerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <EventHeader title="Create New Event" />

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {message && <p className="text-green-600 mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* BOX 1: Dettagli evento */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Event Details</h2>

            {/* Nome Evento e Descrizione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 h-24"
              />
            </div>

            {/* Data e Orari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={startDate ? new Date(startDate) : null}
                  onSelect={(date) => {
                    if (date) {
                      setStartDate(date.toLocaleDateString("en-CA"));
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={endDate ? new Date(endDate) : null}
                  onSelect={(date) => {
                    if (date) {
                      setEndDate(date.toLocaleDateString("en-CA"));
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Campo per Music Genre: gruppo di checkbox */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Music Genre (seleziona 1-3)
              </label>
              <div className="flex flex-wrap gap-4">
                {predefinedGenres.map((genre) => {
                  const isSelected = musicGenres.includes(genre);
                  return (
                    <label key={genre} className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleGenreCheckboxChange(genre, e.target.checked)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                      />
                      <span>{genre}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Restriction
                </label>
                <input
                  type="text"
                  value={ageRestriction}
                  onChange={(e) => setAgeRestriction(e.target.value)}
                  placeholder="+21"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dress Code
                </label>
                <input
                  type="text"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  placeholder="Casual, Formal, etc."
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Upload Event Image (optional)
              </h3>
              <UploadEventImage
                eventId="new" // ID temporaneo per il caricamento
                currentImage={eventImage}
                managerId={managerId}
                onUploadComplete={(uploadedUrl) => setEventImage(uploadedUrl)}
              />
            </div>
          </div>

          {/* BOX 2: Ticket Categories */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Ticket Categories</h2>
            {ticketCategories.map((cat, index) => (
              <div key={index} className="border border-gray-300 rounded p-4 space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleCategoryChange(index, "name", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={cat.price}
                    onChange={(e) => handleCategoryChange(index, "price", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. of Tickets
                  </label>
                  <input
                    type="number"
                    value={cat.available_tickets}
                    onChange={(e) =>
                      handleCategoryChange(index, "available_tickets", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                {ticketCategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(index)}
                    className="mt-2 px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              + Add category
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {loading ? "Saving..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </ManagerLayout>
  );
}

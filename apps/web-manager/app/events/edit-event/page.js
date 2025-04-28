// apps/web-manager/app/events/edit-event/page.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabase } from "@lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import ManagerLayout from "../../ManagerLayout";
import EventHeader from "@components/events/EventHeader";
import DatePicker from "@components/events/DataTimePicker";
import UploadEventImage from "@components/events/UploadEventImage";

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

export default function EditEventPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const eventId = searchParams.get("event_id");

  const [managerId, setManagerId] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Campi evento
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [musicGenres, setMusicGenres] = useState([]); // Array per generi musicali
  const [ageRestriction, setAgeRestriction] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [eventImage, setEventImage] = useState("");
  const [ticketCategories, setTicketCategories] = useState([]);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) {
        setError("ID evento mancante");
        return;
      }
      try {
        // Recupera utente loggato
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          setError("Errore nel recupero utente o nessun utente loggato");
          return;
        }
        setManagerId(user.id);

        // Recupera club associato
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

        // Recupera dettagli evento
        const eventRes = await fetch(
          `/api/event?event_id=${eventId}&club_id=${clubData.id}`,
          { method: "GET", credentials: "include" }
        );
        if (!eventRes.ok) {
          const errData = await eventRes.json();
          throw new Error(errData.error || "Errore nel recupero dell'evento");
        }
        const { events: eventsData } = await eventRes.json();
        if (!eventsData || eventsData.length === 0) {
          setError("Evento non trovato");
          return;
        }
        const event = eventsData[0];
        setName(event.name || "");
        setDescription(event.description || "");
        if (event.start_date) {
          const startObj = new Date(event.start_date);
          setStartDate(startObj.toLocaleDateString("en-CA"));
          setStartTime(startObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
        }
        if (event.end_date) {
          const endObj = new Date(event.end_date);
          setEndDate(endObj.toLocaleDateString("en-CA"));
          setEndTime(endObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
        }
        // Presupponiamo che il backend restituisca l'array music_genres
        setMusicGenres(event.music_genres || []);
        setAgeRestriction(event.age_restriction || "");
        setDressCode(event.dress_code || "");
        setEventImage(event.image || "");

        // Recupera ticket categories
        const tcRes = await fetch(
          `/api/ticket-category?event_id=${eventId}`,
          { method: "GET", credentials: "include" }
        );
        if (!tcRes.ok) {
          const errTC = await tcRes.json();
          throw new Error(errTC.error || "Errore nel recupero delle ticket categories");
        }
        const { ticketCategories: tcData } = await tcRes.json();
        if (tcData && tcData.length > 0) {
          setTicketCategories(tcData);
        } else {
          setTicketCategories([{ name: "", price: 0, available_tickets: 0 }]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }
    fetchEvent();
  }, [eventId, supabase]);

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
      setError("Nessun club associato. Impossibile aggiornare l'evento.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
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

      const updateRes = await fetch(`/api/event?event_id=${eventId}`, {
        method: "PUT",
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
        }),
      });
      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(errData.error || "Errore nell'aggiornamento dell'evento");
      }

      const deleteRes = await fetch(`/api/ticket-category?event_id=${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!deleteRes.ok) {
        const errDelete = await deleteRes.json();
        throw new Error(errDelete.error || "Errore nella cancellazione delle ticket categories");
      }

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
          throw new Error(errTicket.error || "Errore nella creazione delle ticket categories");
        }
      }
      setMessage("Evento aggiornato con successo!");
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

  async function handleDelete() {
    if (!confirm("Sei sicuro di voler eliminare questo evento?")) return;
    try {
      const res = await fetch(`/api/event?event_id=${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Errore nella cancellazione dell'evento");
      }
      router.push("/events");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  return (
    <ManagerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <EventHeader title="Edit Event" />

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {message && <p className="text-green-600 mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* BOX 1: Dettagli evento */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Event Details</h2>

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

            {/* Campo per Music Genre: checkbox multiplo */}
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
                eventId={eventId}
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
                    onChange={(e) => handleCategoryChange(index, "available_tickets", e.target.value)}
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

          <div className="flex justify-end space-x-4">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              {loading ? "Saving..." : "Aggiorna Evento"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Elimina Evento
            </button>
          </div>
        </form>
      </div>
    </ManagerLayout>
  );
}

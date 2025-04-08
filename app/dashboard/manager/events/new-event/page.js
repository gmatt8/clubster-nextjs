// app/dashboard/manager/new-event/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import ManagerLayout from "../../ManagerLayout";
import UploadEventImage from "@/components/manager/events/UploadEventImage";

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
  const [musicGenre, setMusicGenre] = useState("");
  const [ageRestriction, setAgeRestriction] = useState("");
  const [dressCode, setDressCode] = useState("");

  const [ticketCategories, setTicketCategories] = useState([
    { name: "Normal", price: 0, available_tickets: 0 },
  ]);

  // Stato per la foto evento (una sola immagine)
  const [eventImage, setEventImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchManager() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
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
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Crea Nuovo Evento</h1>
          <p>Per creare un nuovo evento, devi collegare il tuo account Stripe.</p>
          <button
            onClick={() => router.push("/dashboard/manager/payments")}
            style={{ marginTop: "1rem", padding: "0.75rem 1rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Collegare Stripe
          </button>
        </div>
      </ManagerLayout>
    );
  }

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
    const startDateTimeStr = `${startDate}T${startTime}:00`;
    const endDateTimeStr = `${endDate}T${endTime}:00`;
    const startDateObj = new Date(startDateTimeStr);
    if (isNaN(startDateObj.getTime())) {
      setError("Il formato della data/ora d'inizio non è valido.");
      return;
    }
    const endDateObj = new Date(endDateTimeStr);
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
      // Crea l'evento includendo il campo "image"
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
          music_genre: musicGenre,
          age_restriction: ageRestriction,
          dress_code: dressCode,
          image: eventImage
        }),
      });
      if (!eventRes.ok) {
        const errData = await eventRes.json();
        throw new Error(errData.error || "Errore creazione evento");
      }
      const newEvent = await eventRes.json();
      const eventId = newEvent[0].id;

      // Crea le ticket categories associate
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
        router.push("/dashboard/manager/events");
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
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Create New Event</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label>Event Name*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ display: "block", width: "100%" }}
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ display: "block", width: "100%", height: "80px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label>Music Genre</label>
            <input
              type="text"
              value={musicGenre}
              onChange={(e) => setMusicGenre(e.target.value)}
              style={{ display: "block", width: "100%" }}
            />
          </div>
          <div>
            <label>Age Restriction</label>
            <input
              type="text"
              value={ageRestriction}
              onChange={(e) => setAgeRestriction(e.target.value)}
              style={{ display: "block", width: "100%" }}
              placeholder="+21"
            />
          </div>
          <div>
            <label>Dress Code</label>
            <input
              type="text"
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              style={{ display: "block", width: "100%" }}
              placeholder="Casual, Formal, etc."
            />
          </div>
          {/* Sezione per foto evento */}
          <div style={{ marginTop: "1rem" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Event Photo (optional)</h2>
            <UploadEventImage
              eventId="new" // Usato come ID temporaneo per il caricamento
              currentImage={eventImage}
              managerId={managerId}
              onUploadComplete={(uploadedUrl) => setEventImage(uploadedUrl)}
            />
          </div>
          <h2>Ticket Categories</h2>
          {ticketCategories.map((cat, index) => (
            <div key={index} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
              <label>Category Name</label>
              <input
                type="text"
                value={cat.name}
                onChange={(e) => handleCategoryChange(index, "name", e.target.value)}
                style={{ display: "block", width: "100%", marginBottom: "0.5rem" }}
              />
              <label>Price</label>
              <input
                type="number"
                value={cat.price}
                onChange={(e) => handleCategoryChange(index, "price", e.target.value)}
                style={{ display: "block", width: "100%", marginBottom: "0.5rem" }}
              />
              <label>No. of tickets</label>
              <input
                type="number"
                value={cat.available_tickets}
                onChange={(e) => handleCategoryChange(index, "available_tickets", e.target.value)}
                style={{ display: "block", width: "100%", marginBottom: "0.5rem" }}
              />
              {ticketCategories.length > 1 && (
                <button type="button" onClick={() => handleRemoveCategory(index)}>Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddCategory}>+ Add category</button>
          <button type="submit" disabled={loading} style={{ marginTop: "1rem", padding: "0.75rem 1rem" }}>
            {loading ? "Saving..." : "Create Event"}
          </button>
        </form>
      </div>
    </ManagerLayout>
  );
}

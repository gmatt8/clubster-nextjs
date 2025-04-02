"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import ManagerLayout from "../../ManagerLayout";

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

  // Campi per l'evento
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [musicGenre, setMusicGenre] = useState("");
  const [ageRestriction, setAgeRestriction] = useState("");
  const [dressCode, setDressCode] = useState("");

  // Ticket categories
  const [ticketCategories, setTicketCategories] = useState([]);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) {
        setError("ID evento mancante");
        return;
      }
      try {
        // 1) Recupera l'utente loggato
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          setError("Errore nel recupero utente o nessun utente loggato");
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

        // 3) Recupera i dettagli dell'evento
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

        // Popola i campi dell'evento
        setName(event.name || "");
        setDescription(event.description || "");
        if (event.start_date) {
            const startObj = new Date(event.start_date);
            // Formatta la data nel formato YYYY-MM-DD
            setStartDate(startObj.toLocaleDateString('en-CA'));
            // Formatta l'orario in formato HH:mm (24 ore)
            setStartTime(startObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
          }
          if (event.end_date) {
            const endObj = new Date(event.end_date);
            setEndDate(endObj.toLocaleDateString('en-CA'));
            setEndTime(endObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
          }
          
        setMusicGenre(event.music_genre || "");
        setAgeRestriction(event.age_restriction || "");
        setDressCode(event.dress_code || "");

        // 4) Recupera le ticket categories associate all'evento
        const tcRes = await fetch(
          `/api/ticket-category?event_id=${eventId}`,
          { method: "GET", credentials: "include" }
        );
        if (!tcRes.ok) {
          const errTC = await tcRes.json();
          throw new Error(
            errTC.error || "Errore nel recupero delle ticket categories"
          );
        }
        const { ticketCategories: tcData } = await tcRes.json();
        if (tcData && tcData.length > 0) {
          setTicketCategories(tcData);
        } else {
          // Se non esistono, inizializza con una categoria vuota
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
    setTicketCategories([
      ...ticketCategories,
      { name: "", price: 0, available_tickets: 0 },
    ]);
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
      setError("Nessun club associato. Impossibile aggiornare l'evento.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const startDateISO = new Date(`${startDate}T${startTime}`).toISOString();
      const endDateISO = new Date(`${endDate}T${endTime}`).toISOString();

      // Aggiorna i dettagli dell'evento
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
          music_genre: musicGenre,
          age_restriction: ageRestriction,
          dress_code: dressCode,
        }),
      });
      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(
          errData.error || "Errore nell'aggiornamento dell'evento"
        );
      }

      // Elimina tutte le ticket categories esistenti per l'evento
      const deleteRes = await fetch(
        `/api/ticket-category?event_id=${eventId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!deleteRes.ok) {
        const errDelete = await deleteRes.json();
        throw new Error(
          errDelete.error || "Errore nella cancellazione delle ticket categories"
        );
      }

      // Crea (o ricrea) le ticket categories aggiornate
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
          throw new Error(
            errTicket.error || "Errore nella creazione delle ticket categories"
          );
        }
      }

      setMessage("Evento aggiornato con successo!");
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

  async function handleDelete() {
    if (!confirm("Sei sicuro di voler eliminare questo evento?")) return;
    try {
      const res = await fetch(`/api/event?event_id=${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error || "Errore nella cancellazione dell'evento"
        );
      }
      router.push("/dashboard/manager/events");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  return (
    <ManagerLayout>
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Modifica Evento
        </h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label>Nome Evento*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ display: "block", width: "100%" }}
            />
          </div>
          <div>
            <label>Descrizione</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                height: "80px",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div>
              <label>Data Inizio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label>Ora Inizio</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div>
              <label>Data Fine</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label>Ora Fine</label>
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
          <hr />
          <h2>Ticket Categories</h2>
          {ticketCategories.map((cat, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <label>Category Name</label>
              <input
                type="text"
                value={cat.name}
                onChange={(e) =>
                  handleCategoryChange(index, "name", e.target.value)
                }
                style={{
                  display: "block",
                  width: "100%",
                  marginBottom: "0.5rem",
                }}
              />
              <label>Price</label>
              <input
                type="number"
                value={cat.price}
                onChange={(e) =>
                  handleCategoryChange(index, "price", e.target.value)
                }
                style={{
                  display: "block",
                  width: "100%",
                  marginBottom: "0.5rem",
                }}
              />
              <label>No. of tickets</label>
              <input
                type="number"
                value={cat.available_tickets}
                onChange={(e) =>
                  handleCategoryChange(index, "available_tickets", e.target.value)
                }
                style={{
                  display: "block",
                  width: "100%",
                  marginBottom: "0.5rem",
                }}
              />
              {ticketCategories.length > 1 && (
                <button type="button" onClick={() => handleRemoveCategory(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddCategory}>
            + Add category
          </button>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="submit" disabled={loading} style={{ padding: "0.75rem 1rem" }}>
              {loading ? "Saving..." : "Aggiorna Evento"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Elimina Evento
            </button>
          </div>
        </form>
      </div>
    </ManagerLayout>
  );
}

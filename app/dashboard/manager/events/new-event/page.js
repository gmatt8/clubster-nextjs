"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import ManagerLayout from "../../ManagerLayout";

export default function NewEventPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const router = useRouter();

  const [managerId, setManagerId] = useState(null);
  const [clubId, setClubId] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(""); // es. "2025-03-29"
  const [startTime, setStartTime] = useState(""); // es. "20:00"
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [musicGenre, setMusicGenre] = useState("");
  const [ageRestriction, setAgeRestriction] = useState("");
  const [dressCode, setDressCode] = useState("");

  const [ticketCategories, setTicketCategories] = useState([
    { name: "Normal", price: 0, available_tickets: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchManager() {
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();
        if (userError) {
          setError("Errore nel recupero utente");
          return;
        }
        if (!user) {
          setError("Nessun utente loggato");
          return;
        }
        setManagerId(user.id);

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
      } catch (err) {
        console.error(err);
        setError("Errore sconosciuto nel recupero manager/club");
      }
    }
    fetchManager();
  }, [supabase]);

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
      setError("Nessun club associato. Impossibile creare evento.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Combina data e ora per creare un ISO string
      const startDateISO = new Date(`${startDate}T${startTime}`).toISOString();
      const endDateISO = new Date(`${endDate}T${endTime}`).toISOString();

      // 1) Crea l'evento
      const eventRes = await fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      if (!eventRes.ok) {
        const errData = await eventRes.json();
        throw new Error(errData.error || "Errore creazione evento");
      }

      const newEvent = await eventRes.json();
      const eventId = newEvent[0].id;

      // 2) Crea le ticket categories associate
      for (let cat of ticketCategories) {
        const ticketRes = await fetch("/api/ticket-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
            errTicket.error || "Errore creazione ticket category"
          );
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
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Create New Event
        </h1>
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
                  handleCategoryChange(
                    index,
                    "available_tickets",
                    e.target.value
                  )
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

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "1rem", padding: "0.75rem 1rem" }}
          >
            {loading ? "Saving..." : "Create Event"}
          </button>
        </form>
      </div>
    </ManagerLayout>
  );
}

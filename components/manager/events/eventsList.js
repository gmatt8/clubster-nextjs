"use client";
import { useMemo, useState } from "react";

export default function EventsList({ events }) {
  const [tab, setTab] = useState("upcoming");

  // Data attuale per separare eventi futuri e passati
  const now = useMemo(() => new Date(), []);
  const upcoming = events.filter((e) => new Date(e.event_date) > now);
  const past = events.filter((e) => new Date(e.event_date) <= now);

  // Funzione per formattare la data come "17 feb 2025"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      .toLowerCase();
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        width: "100%",
        minHeight: "80vh", // Il box copre quasi tutta la pagina
      }}
    >
      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setTab("upcoming")}
          style={{
            backgroundColor: tab === "upcoming" ? "#ECEFFE" : "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontWeight: tab === "upcoming" ? "bold" : "normal",
          }}
        >
          Upcoming
        </button>
        <button
          onClick={() => setTab("past")}
          style={{
            backgroundColor: tab === "past" ? "#ECEFFE" : "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontWeight: tab === "past" ? "bold" : "normal",
          }}
        >
          Past
        </button>
      </div>

      {/* Lista eventi: solo nome e data formattata */}
      {tab === "upcoming" &&
        upcoming.map((evt) => (
          <div key={evt.id} style={{ borderBottom: "1px solid #ccc", padding: "0.75rem 0" }}>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem" }}>{evt.name}</p>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>{formatDate(evt.event_date)}</p>
          </div>
        ))}

      {tab === "past" &&
        past.map((evt) => (
          <div key={evt.id} style={{ borderBottom: "1px solid #ccc", padding: "0.75rem 0" }}>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem" }}>{evt.name}</p>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>{formatDate(evt.event_date)}</p>
          </div>
        ))}

      <button
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1rem",
          backgroundColor: "#f5f5f5",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        See More
      </button>
    </div>
  );
}

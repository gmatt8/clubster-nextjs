// apps/web-customer/components/club-details/nextevents.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function NextEvents({ clubId, selectedEventId }) {
  const router = useRouter();

  // Stati per eventi e dettagli
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [selectedTicketCategory, setSelectedTicketCategory] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Stato per il calendario dinamico
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-based

  // Carica tutti gli eventi futuri del club
  useEffect(() => {
    async function fetchEvents() {
      if (!clubId) return;
      try {
        const res = await fetch(`/api/event?club_id=${clubId}&upcoming=true`);
        if (!res.ok) throw new Error("Error fetching events");
        const { events: data } = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();
  }, [clubId]);

  // Mappa gli eventi per data: { "YYYY-MM-DD": [event, ...] }
  const eventMap = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const dateObj = new Date(ev.start_date);
      const dateKey = dateObj.toISOString().slice(0, 10);
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(ev);
    });
    return map;
  }, [events]);

  // Se selectedEventId è presente, seleziona quell'evento; altrimenti il primo evento del mese corrente se disponibile
  useEffect(() => {
    if (events.length === 0) return;
    if (selectedEventId) {
      const found = events.find((e) => e.id === selectedEventId);
      setSelectedEvent(found || events[0]);
    } else {
      const firstInMonth = events.find((ev) => {
        const d = new Date(ev.start_date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
      setSelectedEvent(firstInMonth || events[0]);
    }
  }, [events, selectedEventId, currentYear, currentMonth]);

  // Carica le ticket categories quando cambia selectedEvent
  useEffect(() => {
    async function fetchTicketCategories() {
      if (!selectedEvent) return;
      try {
        const res = await fetch(`/api/ticket-category?event_id=${selectedEvent.id}`);
        if (!res.ok) throw new Error("Error fetching ticket categories");
        const { ticketCategories: categories } = await res.json();
        setTicketCategories(categories || []);
        if (categories && categories.length > 0) {
          setSelectedTicketCategory(categories[0].id);
          // Imposta la quantità in base alla disponibilità: se sold out, quantity = 0
          if (categories[0].available_tickets > 0) {
            setQuantity(1);
          } else {
            setQuantity(0);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchTicketCategories();
  }, [selectedEvent]);

  // Recupera il ticket category selezionato
  const selectedTC = ticketCategories.find((tc) => tc.id === selectedTicketCategory);

  // Funzione Book Now
  function handleBookNow() {
    if (!selectedEvent) return;
    router.push(
      `/basket?event_id=${selectedEvent.id}&ticket_category=${selectedTicketCategory}&quantity=${quantity}`
    );
  }

  // Navigazione del calendario
  function prevMonth() {
    // Non permettiamo di andare al passato se il mese corrente mostrato è quello attuale
    if (currentYear === today.getFullYear() && currentMonth <= today.getMonth()) {
      return;
    }
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  function nextMonth() {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  // Numero di giorni nel mese corrente
  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Formatta la data in "YYYY-MM-DD"
  function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // Verifica se un giorno ha eventi
  function dayHasEvents(day) {
    const dateKey = formatDate(currentYear, currentMonth, day);
    return Boolean(eventMap[dateKey]);
  }

  // Verifica se un giorno è selezionato (corrisponde alla data di selectedEvent)
  function isSelectedDay(day) {
    if (!selectedEvent) return false;
    const start = new Date(selectedEvent.start_date);
    const startKey = start.toISOString().slice(0, 10);
    const dayKey = formatDate(currentYear, currentMonth, day);
    return startKey === dayKey;
  }

  // Quando clicchi su un giorno con eventi, seleziona il primo evento di quel giorno
  function handleDayClick(day) {
    const dateKey = formatDate(currentYear, currentMonth, day);
    if (eventMap[dateKey] && eventMap[dateKey].length > 0) {
      setSelectedEvent(eventMap[dateKey][0]);
    } else {
      setSelectedEvent(null);
    }
  }

  // Genera la griglia del calendario "reale"
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday, 1 = Monday, ...
  const adjustedFirstDay = firstDay === 0 ? 7 : firstDay; // se domenica, considerala come 7
  const blankDays = adjustedFirstDay - 1;
  const calendarDays = [
    ...Array(blankDays).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  // Etichetta del mese (es. "April 2025")
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthLabel = `${monthNames[currentMonth]} ${currentYear}`;

  // Abilita la freccia sinistra solo se il mese mostrato è successivo al mese corrente
  const canGoPrev = !(currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Next events</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendario dinamico */}
        <div>
          {/* Header del calendario con frecce (solo icone) */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className={`text-gray-600 hover:text-gray-800 ${!canGoPrev ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              &#8592;
            </button>
            <div className="font-medium text-gray-700">{monthLabel}</div>
            <button
              onClick={nextMonth}
              className="text-gray-600 hover:text-gray-800"
            >
              &#8594;
            </button>
          </div>
          {/* Giorni della settimana */}
          <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-1">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
          {/* Griglia dei giorni */}
          <div className="grid grid-cols-7 text-center gap-y-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={index} className="w-8 h-8"></div>;
              }
              const hasEv = dayHasEvents(day);
              // Se il giorno è passato, usa un colore più tenue
              let cellTextColor = "text-gray-900";
              if (currentYear === today.getFullYear() && currentMonth === today.getMonth() && day < today.getDate()) {
                cellTextColor = "text-gray-400";
              }
              return (
                <div key={index} className="flex items-center justify-center">
                  {hasEv ? (
                    <div
                      onClick={() => handleDayClick(day)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${
                        isSelectedDay(day)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-300 text-black"
                      }`}
                    >
                      {day}
                    </div>
                  ) : (
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full ${cellTextColor} cursor-default`}>
                      {day}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dettagli dell'evento selezionato */}
        {selectedEvent ? (
          <div className="flex flex-col space-y-2 w-full md:w-2/3">
            <span className="font-semibold text-gray-800 text-lg">
              {selectedEvent.name}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(selectedEvent.start_date).toLocaleDateString("en-GB", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(selectedEvent.start_date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" - "}
              {selectedEvent.end_date
                ? new Date(selectedEvent.end_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <select
                className="border border-gray-300 rounded px-2 py-1"
                value={selectedTicketCategory}
                onChange={(e) => {
                  setSelectedTicketCategory(e.target.value);
                  // Resetta la quantità a 1 se disponibili, altrimenti 0
                  const newTC = ticketCategories.find((tc) => tc.id === e.target.value);
                  if (newTC) {
                    setQuantity(newTC.available_tickets > 0 ? 1 : 0);
                  }
                }}
              >
                {ticketCategories.map((tc) => (
                  <option key={tc.id} value={tc.id}>
                    {tc.name} - €{tc.price} (Available: {tc.available_tickets})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max={selectedTC ? selectedTC.available_tickets : 1}
                value={quantity}
                onChange={(e) => {
                  let newQuantity = Number(e.target.value);
                  if (selectedTC && newQuantity > selectedTC.available_tickets) {
                    newQuantity = selectedTC.available_tickets;
                  }
                  setQuantity(newQuantity);
                }}
                disabled={selectedTC && selectedTC.available_tickets === 0}
                className="border border-gray-300 rounded w-16 px-2 py-1"
              />
              <button
                onClick={handleBookNow}
                disabled={selectedTC && selectedTC.available_tickets === 0}
                className={`bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ${
                  selectedTC && selectedTC.available_tickets === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {selectedTC && selectedTC.available_tickets === 0 ? "Sold Out" : "Book now"}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full md:w-2/3 text-gray-500 flex items-center">
            No event selected.
          </div>
        )}
      </div>
    </section>
  );
}

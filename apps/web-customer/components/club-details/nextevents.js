// apps/web-customer/components/club-details/nextevents.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  Music,
  Eye,
  Users,
  DollarSign,
  Shirt,
  Sun,
  Car,
  Cigarette,
  Briefcase
} from "lucide-react";

export default function NextEvents({ clubId, selectedEventId }) {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [selectedTicketCategory, setSelectedTicketCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [clubData, setClubData] = useState(null);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  useEffect(() => {
    async function fetchEvents() {
      if (!clubId) return;
      try {
        const res = await fetch(`/api/events?club_id=${clubId}&upcoming=true`);
        if (!res.ok) throw new Error("Error fetching events");
        const { events: data } = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [clubId]);

  useEffect(() => {
    async function fetchClubData() {
      if (!clubId) return;
      try {
        const res = await fetch(`/api/club?club_id=${clubId}`);
        if (!res.ok) throw new Error("Error fetching club data");
        const data = await res.json();
        setClubData(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchClubData();
  }, [clubId]);

  const eventMap = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const dateKey = new Date(ev.start_date).toISOString().slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(ev);
    });
    return map;
  }, [events]);

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
          setQuantity(categories[0].available_tickets > 0 ? 1 : 0);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchTicketCategories();
  }, [selectedEvent]);

  const selectedTC = ticketCategories.find((tc) => tc.id === selectedTicketCategory);

  function handleBookNow() {
    if (!selectedEvent) return;
    router.push(`/basket?event_id=${selectedEvent.id}&ticket_category=${selectedTicketCategory}&quantity=${quantity}`);
  }

  function prevMonth() {
    if (currentYear === today.getFullYear() && currentMonth <= today.getMonth()) return;
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  function nextMonth() {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function dayHasEvents(day) {
    return Boolean(eventMap[formatDate(currentYear, currentMonth, day)]);
  }

  function isSelectedDay(day) {
    if (!selectedEvent) return false;
    const startKey = new Date(selectedEvent.start_date).toISOString().slice(0, 10);
    const dayKey = formatDate(currentYear, currentMonth, day);
    return startKey === dayKey;
  }

  function handleDayClick(day) {
    const dateKey = formatDate(currentYear, currentMonth, day);
    setSelectedEvent(eventMap[dateKey]?.[0] || null);
  }

  function renderInfoIcons(event, club) {
    if (!event || !club) return null;

    const features = [];

    if (event.music_genres?.length) {
      event.music_genres.forEach((genre) => features.push({ label: genre, Icon: Music }));
    }
    if (event.age_restriction) {
      features.push({ label: `+${event.age_restriction} years old`, Icon: Eye });
    }
    if (event.dress_code) {
      features.push({ label: event.dress_code, Icon: Shirt });
    }
    if (club.capacity) {
      features.push({ label: `${club.capacity} people`, Icon: Users });
    }
    if (club.price) {
      const label = club.price === "$" ? "Low cost" : club.price === "$$" ? "Medium cost" : "High cost";
      features.push({ label, Icon: DollarSign });
    }
    if (club.outdoor_area === "available") features.push({ label: "Outdoor Area", Icon: Sun });
    if (club.parking === "available") features.push({ label: "Parking", Icon: Car });
    if (club.smoking === "allowed") features.push({ label: "Smoking allowed", Icon: Cigarette });
    if (club.coat_check === "available") features.push({ label: "Coat check", Icon: Briefcase });

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-10 justify-center">
        {features.map(({ label, Icon }, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 7 : firstDay;
  const blankDays = adjustedFirstDay - 1;
  const calendarDays = [...Array(blankDays).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthLabel = `${monthNames[currentMonth]} ${currentYear}`;
  const canGoPrev = !(currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  if (loading) return <LoadingSpinner />;
  if (!events.length) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Next events</h2>
        <div className="text-gray-500">No upcoming events for this club.</div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-4">Next events</h2>
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <button onClick={prevMonth} disabled={!canGoPrev} className={`text-gray-600 hover:text-gray-800 ${!canGoPrev ? "opacity-50 cursor-not-allowed" : ""}`}>
                &#8592;
              </button>
              <div className="font-medium text-gray-700">{monthLabel}</div>
              <button onClick={nextMonth} className="text-gray-600 hover:text-gray-800">
                &#8594;
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-1">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            <div className="grid grid-cols-7 text-center gap-y-2">
              {calendarDays.map((day, index) => {
                if (!day) return <div key={index} className="w-8 h-8"></div>;
                const hasEv = dayHasEvents(day);
                let cellTextColor = "text-gray-900";
                if (currentYear === today.getFullYear() && currentMonth === today.getMonth() && day < today.getDate()) {
                  cellTextColor = "text-gray-400";
                }
                return (
                  <div key={index} className="flex items-center justify-center">
                    {hasEv ? (
                      <div onClick={() => handleDayClick(day)} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${isSelectedDay(day) ? "bg-purple-600 text-white" : "bg-gray-300 text-black"}`}>{day}</div>
                    ) : (
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${cellTextColor}`}>{day}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedEvent ? (
            <div className="flex flex-col md:flex-row gap-6 items-start w-full border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
              <img src={selectedEvent.image || "/images/no-image.jpeg"} alt={selectedEvent.name} className="w-full md:w-48 h-32 object-cover rounded-md" />
              <div className="flex-1 space-y-2">
                <p className="text-lg font-semibold">{selectedEvent.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedEvent.start_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} – {new Date(selectedEvent.start_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {selectedEvent.end_date && " - " + new Date(selectedEvent.end_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                {ticketCategories.length === 0 ? (
                  <LoadingSpinner />
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <select className="border border-gray-300 rounded px-2 py-1" value={selectedTicketCategory} onChange={(e) => {
                      setSelectedTicketCategory(e.target.value);
                      const newTC = ticketCategories.find((tc) => tc.id === e.target.value);
                      if (newTC) {
                        setQuantity(newTC.available_tickets > 0 ? 1 : 0);
                      }
                    }}>
                      {ticketCategories.map((tc) => (
                        <option key={tc.id} value={tc.id}>{tc.name} - €{tc.price} ({tc.available_tickets} left)</option>
                      ))}
                    </select>
                    <input type="number" min="1" max={selectedTC ? selectedTC.available_tickets : 1} value={quantity} onChange={(e) => {
                      let newQuantity = Number(e.target.value);
                      if (selectedTC && newQuantity > selectedTC.available_tickets) {
                        newQuantity = selectedTC.available_tickets;
                      }
                      setQuantity(newQuantity);
                    }} disabled={selectedTC && selectedTC.available_tickets === 0} className="border border-gray-300 rounded w-16 px-2 py-1" />
                    <button onClick={handleBookNow} disabled={selectedTC && selectedTC.available_tickets === 0} className={`bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ${selectedTC && selectedTC.available_tickets === 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                      {selectedTC && selectedTC.available_tickets === 0 ? "Sold Out" : "Book now"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full text-gray-500 flex items-center">No event selected.</div>
          )}
        </div>
        {renderInfoIcons(selectedEvent, clubData)}
      </div>
    </section>
  );
}

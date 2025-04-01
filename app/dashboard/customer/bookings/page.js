// app/dashboard/customer/bookings/page.js
"use client";

import { useEffect, useState } from "react";
import CustomerLayout from "../CustomerLayout";

export default function MyBookingsPage() {
  const [tab, setTab] = useState("upcoming"); // "upcoming" o "past"
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/bookings", { credentials: "include" });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Error fetching bookings: ${errText}`);
        }
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  // Filtra upcoming vs. past in base alla data dell'evento
  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.event.start_date) >= now);
  const pastBookings = bookings.filter(b => new Date(b.event.start_date) < now);

  // Scegli la lista da mostrare in base al tab
  const displayedBookings = tab === "upcoming" ? upcomingBookings : pastBookings;

  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Tickets</h1>

        {/* Tabs */}
        <div className="mb-4 flex gap-4">
          <button
            className={`px-4 py-2 rounded ${
              tab === "upcoming" ? "bg-purple-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`px-4 py-2 rounded ${
              tab === "past" ? "bg-purple-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("past")}
          >
            Past
          </button>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : displayedBookings.length === 0 ? (
          <p>No {tab === "upcoming" ? "upcoming" : "past"} bookings found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {displayedBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

// Componente card per mostrare un singolo booking
function BookingCard({ booking }) {
  const event = booking.event;
  const startDateObj = new Date(event.start_date);
  const eventDateStr = startDateObj.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="border border-gray-300 p-4 rounded flex flex-col md:flex-row justify-between gap-4">
      <div>
        <p className="text-sm text-gray-600 mb-1">{eventDateStr}</p>
        <p className="text-lg font-semibold">{event.name}</p>
        <p className="text-gray-600">{event.club_name || "Club location"}</p>
        <p className="text-sm mt-2">Order #{booking.booking_number} | {booking.quantity} ticket(s) purchased</p>
      </div>
      <div className="flex flex-col md:items-end justify-center gap-2">
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          Download tickets
        </button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          Download invoice
        </button>
      </div>
    </div>
  );
}

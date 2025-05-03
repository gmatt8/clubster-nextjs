// /apps/web-customer/app/bookings/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomerLayout from "../CustomerLayout";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function MyBookingsPage() {
  const [tab, setTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleUpcoming, setVisibleUpcoming] = useState(3);
  const [visiblePast, setVisiblePast] = useState(3);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/bookings", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load bookings");
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

  const now = new Date();
  const upcoming = bookings.filter(b => new Date(b.events?.end_date || b.events?.start_date) > now);
  const past = bookings.filter(b => new Date(b.events?.end_date || b.events?.start_date) <= now);

  const displayed = tab === "upcoming" ? upcoming.slice(0, visibleUpcoming) : past.slice(0, visiblePast);

  return (
    <CustomerLayout>
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        <div className="mb-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              tab === "upcoming" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              tab === "past" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setTab("past")}
          >
            Past
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : displayed.length === 0 ? (
          <p className="text-gray-500 text-center">No {tab} bookings found.</p>
        ) : (
          <div className="space-y-6">
            {displayed.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}

            {(tab === "upcoming" && upcoming.length > visibleUpcoming) ||
            (tab === "past" && past.length > visiblePast) ? (
              <div className="text-center">
                <button
                  onClick={() => tab === "upcoming" ? setVisibleUpcoming((p) => p + 3) : setVisiblePast((p) => p + 3)}
                  className="mt-4 px-5 py-2 text-sm font-medium bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Show more
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

function BookingCard({ booking }) {
  const router = useRouter();
  const event = booking.events;
  const now = new Date();
  const eventEnd = new Date(event?.end_date || event?.start_date);
  const isPast = now > eventEnd;
  const reviewed = booking.reviewed;

  const start = new Date(event.start_date);
  const eventDate = `${start.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} • ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const club = event.clubs;
  const location = club?.address || [club?.club_name, club?.city, club?.country].filter(Boolean).join(", ") || "Location not available";

  const mapLink = club?.lat && club?.lng
    ? `https://www.google.com/maps/search/?api=1&query=${club.lat},${club.lng}`
    : null;

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm flex flex-col md:flex-row justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500 mb-1">{eventDate}</p>
        <h2 className="text-lg font-semibold text-gray-900">{event.name}</h2>
        <p className="text-gray-600 text-sm">{location}</p>
        {mapLink && (
          <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
            View on map
          </a>
        )}
        <p className="text-sm mt-2 text-gray-500">
          Order #{booking.id} • <strong>{booking.quantity}</strong> {booking.quantity === 1 ? "ticket" : "tickets"} purchased
        </p>
      </div>

      <div className="flex flex-col md:items-end justify-center gap-2">
        <button
          onClick={() => window.open(`/api/ticket?booking_id=${booking.id}`, "_blank")}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Download tickets
        </button>
        {isPast && !reviewed && (
          <button
            onClick={() =>
              router.push(`/add-review?event_id=${event.id}&club_id=${event.club_id}&booking_id=${booking.id}`)
            }
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Add review
          </button>
        )}
      </div>
    </div>
  );
}

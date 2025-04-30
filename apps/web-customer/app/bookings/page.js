// /apps/web-customer/app/bookings/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomerLayout from "../CustomerLayout";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function MyBookingsPage() {
  const [tab, setTab] = useState("upcoming"); // "upcoming" o "past"
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stati per la paginazione separata per upcoming e past
  const [visibleUpcoming, setVisibleUpcoming] = useState(3);
  const [visiblePast, setVisiblePast] = useState(3);

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

  const now = new Date();

  // Filtra le prenotazioni upcoming e past basandosi sulla data di fine o, se mancante, su start_date
  const upcomingBookings = bookings.filter((b) => {
    if (!b.events) return false;
    const event = b.events;
    const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
    return eventEndDate > now;
  });

  const pastBookings = bookings.filter((b) => {
    if (!b.events) return false;
    const event = b.events;
    const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
    return eventEndDate <= now;
  });

  // Ordina entrambe le liste in ordine decrescente rispetto a created_at (le più recenti in cima)
  const upcomingBookingsSorted = [...upcomingBookings].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  const pastBookingsSorted = [...pastBookings].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // Mostra i primi 3 (o più se "Show more" è stato premuto) in base al tab attivo
  const displayedBookings =
    tab === "upcoming"
      ? upcomingBookingsSorted.slice(0, visibleUpcoming)
      : pastBookingsSorted.slice(0, visiblePast);

  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Tickets</h1>

        {/* Tabs per selezionare upcoming o past */}
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
  <div className="flex items-center justify-center h-[300px]">
    <svg
      className="animate-spin h-8 w-8 text-purple-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      ></path>
    </svg>
  </div>
) : error ? (

          <p className="text-red-500">Error: {error}</p>
        ) : displayedBookings.length === 0 ? (
          <p>No {tab === "upcoming" ? "upcoming" : "past"} bookings found.</p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {displayedBookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>
            {/* Bottone "Show more" se ci sono altri elementi da mostrare */}
            {((tab === "upcoming" && upcomingBookingsSorted.length > visibleUpcoming) ||
              (tab === "past" && pastBookingsSorted.length > visiblePast)) && (
              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    if (tab === "upcoming") setVisibleUpcoming((prev) => prev + 3);
                    else setVisiblePast((prev) => prev + 3);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Show more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  );
}

function BookingCard({ booking }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const event = booking.events;
  if (!event) return null;

  // Formatta la data e l'orario dell'evento
  const startDateObj = new Date(event.start_date);
  const eventDateStr = `${startDateObj.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })} - ${startDateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;

  // Dati del club
  const clubData = event.clubs;
  const clubLocation =
    clubData && clubData.club_name && clubData.city && clubData.country
      ? `${clubData.club_name}, ${clubData.city} (${clubData.country})`
      : clubData && clubData.address
      ? clubData.address
      : "Club location";

  const mapsLink =
    clubData && clubData.lat && clubData.lng
      ? `https://www.google.com/maps/search/?api=1&query=${clubData.lat},${clubData.lng}`
      : null;

  const now = new Date();
  const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
  const isEventFinished = now > eventEndDate;

  // Stato per verificare se esiste già una review per questo booking
  const [reviewExists, setReviewExists] = useState(false);

  useEffect(() => {
    async function fetchReview() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const userId = user.id;
      try {
        const res = await fetch(`/api/reviews?booking_id=${booking.id}&user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.reviews && data.reviews.length > 0) {
            setReviewExists(true);
          }
        }
      } catch (err) {
        console.error("Error fetching review for booking:", err);
      }
    }
    if (isEventFinished) {
      fetchReview();
    }
  }, [booking, isEventFinished, supabase]);

  // Determina il testo per il numero di ticket
  const ticketText = booking.quantity === 1 ? "ticket" : "tickets";

  return (
    <div className="border border-gray-300 p-4 rounded flex flex-col md:flex-row justify-between gap-4">
      <div>
        <p className="text-sm text-gray-600 mb-1">{eventDateStr}</p>
        <p className="text-lg font-semibold">{event.name}</p>
        <p className="text-gray-600">{clubLocation}</p>
        {mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline text-sm"
          >
            View on Google Maps
          </a>
        )}
        {/* Mostra il Booking ID personalizzato come numero d'ordine e il testo corretto per ticket */}
        <p className="text-sm mt-2">
          Order #{booking.id} | {booking.quantity} {ticketText} purchased
        </p>
      </div>
      <div className="flex flex-col md:items-end justify-center gap-2">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={() =>
            window.open(`/api/ticket?booking_id=${booking.id}`, "_blank")
          }
        >
          Download tickets
        </button>
        
        {isEventFinished && !reviewExists && (
          <button
            onClick={() =>
              router.push(
                `/add-review?event_id=${event.id}&club_id=${event.club_id}&booking_id=${booking.id}`
              )
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

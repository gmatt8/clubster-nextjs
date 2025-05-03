"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ManagerLayout from "../../ManagerLayout";
import { createBrowserSupabase } from "@lib/supabase-browser";

export default function EventDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketStats, setTicketStats] = useState({
    sold: 0,
    capacity: 0,
    revenue: 0,
  });

  const supabase = createBrowserSupabase();

  useEffect(() => {
    if (!eventId) return;

    async function fetchData() {
      try {
        // 1. Event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select(
            `
            id,
            name,
            description,
            start_date,
            end_date,
            music_genres,
            age_restriction,
            dress_code,
            image,
            clubs ( name )
          `
          )
          .eq("id", eventId)
          .single();

        if (eventError) throw eventError;

        setEvent(eventData);

        // 2. Bookings for event
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("quantity")
          .eq("event_id", eventId)
          .eq("status", "confirmed");

        if (bookingsError) throw bookingsError;

        const sold = bookings.reduce((sum, b) => sum + b.quantity, 0);

        // 3. Capacity from ticket categories
        const { data: categories, error: catError } = await supabase
          .from("ticket_categories")
          .select("available_tickets, price")
          .eq("event_id", eventId);

        if (catError) throw catError;

        const remaining = categories.reduce((sum, cat) => sum + (cat.available_tickets || 0), 0);
        const capacity = remaining + sold;
        
        const revenue = categories.reduce((sum, cat) => sum + ((cat.price || 0) * sold), 0);

        setTicketStats({ sold, capacity, revenue });
      } catch (err) {
        console.error("Error loading event detail:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eventId, supabase]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getEventStatus = () => {
    if (!event) return "Unknown";
    const now = new Date();
    const start = new Date(event.start_date);
    const end = event.end_date ? new Date(event.end_date) : start;

    if (now < start) return "Scheduled";
    if (now >= start && now <= end) return "Live";
    return "Ended";
  };

  const status = getEventStatus();
  const occupancy =
    ticketStats.capacity > 0
      ? Math.round((ticketStats.sold / ticketStats.capacity) * 100)
      : 0;

  return (
    <ManagerLayout>
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event details</h1>
          {event && (
            <button
              onClick={() =>
                router.push(`/events/edit-event?event_id=${event.id}`)
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
            >
              Edit event
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading event...</p>
        ) : !event ? (
          <p className="text-red-600">Event not found.</p>
        ) : (
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Event name</h2>
                <p className="text-lg font-semibold text-gray-900">{event.name}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Club</h2>
                <p className="text-gray-800">{event.clubs?.name || "—"}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Start</h2>
                <p className="text-gray-800">
                  {formatDate(event.start_date)} at {formatTime(event.start_date)}
                </p>
              </div>
              {event.end_date && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">End</h2>
                  <p className="text-gray-800">
                    {formatDate(event.end_date)} at {formatTime(event.end_date)}
                  </p>
                </div>
              )}
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Status</h2>
                <p
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-semibold ${
                    status === "Live"
                      ? "bg-purple-100 text-purple-700 animate-pulse"
                      : status === "Ended"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {status}
                </p>
              </div>
              {event.age_restriction && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Age restriction</h2>
                  <p className="text-gray-800">{event.age_restriction}+</p>
                </div>
              )}
              {event.dress_code && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Dress code</h2>
                  <p className="text-gray-800">{event.dress_code}</p>
                </div>
              )}
              {event.music_genres?.length > 0 && (
                <div className="col-span-full">
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Music genres</h2>
                  <div className="flex flex-wrap gap-2">
                    {event.music_genres.map((genre, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ticket Stats */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Ticket stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tickets sold</p>
                  <p className="text-xl font-bold text-gray-900">{ticketStats.sold}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Capacity</p>
                  <p className="text-xl font-bold text-gray-900">{ticketStats.capacity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Revenue (CHF)</p>
                  <p className="text-xl font-bold text-gray-900">{ticketStats.revenue}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-1">Occupancy</p>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-purple-600 transition-all"
                    style={{ width: `${occupancy}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{occupancy}% full</p>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}

// apps/web-customer/components/home/popularEvents.js
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../common/LoadingSpinner";

export default function PopularEvents() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events?random=true&limit=5&upcoming=true");
        const { events } = await res.json();
        setEvents(events || []);
      } catch (error) {
        console.error("Errore caricando eventi:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (events.length === 0) {
    return <div className="text-center">No events available</div>;
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex space-x-4">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => router.push(`/club-details?club_id=${event.club_id}&event_id=${event.id}`)}
            className="w-[220px] bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          >
            <img
              src={event.image || "/images/no-image.jpeg"}
              alt={event.name}
              className="w-full h-32 object-cover rounded-t-lg"
            />
            <div className="p-3 text-center">
              <p className="font-semibold text-sm text-gray-800">{event.name}</p>
              <p className="text-xs text-gray-500">{event.clubs?.name || event.club_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// components/customer/home/popularEvents.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PopularEvents() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPopularEvents() {
      try {
        const res = await fetch("/api/popular");
        if (!res.ok) {
          throw new Error("Errore nel recupero dei dati");
        }
        const data = await res.json();
        setEvents(data.popularEvents || []);
      } catch (err) {
        console.error("Errore nel recuperare gli eventi popolari:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPopularEvents();
  }, []);

  if (loading) {
    return <div className="text-center">Loading popular events...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Errore nel caricamento degli eventi popolari.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex space-x-4">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() =>
              router.push(
                `/dashboard/customer/club-details?club_id=${event.club_id}&event_id=${event.id}`
              )
            }
            // Stesse classi di PopularLocation
            className="w-[180px] bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          >
            <img
              src={event.image || "/images/no-image.jpeg"}
              alt={event.name}
              className="w-full h-32 object-cover rounded-t-lg"
            />
            <div className="p-3 text-center">
              <p className="font-semibold text-sm text-gray-800">{event.name}</p>
              <p className="text-xs text-gray-500">
                {event.club_name || "Unknown Club"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

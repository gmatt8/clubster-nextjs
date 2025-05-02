// apps/web-customer/components/home/popularEvents.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../common/LoadingSpinner";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";

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
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (events.length === 0) return <div className="text-center">No events available</div>;

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4">
        {events.map((event) => {
          const dateFormatted = event.start_date
            ? format(new Date(event.start_date), "EEE, d MMM", { locale: enGB })
            : "";

          return (
            <div
              key={event.id}
              onClick={() =>
                router.push(`/club-details?club_id=${event.club_id}&event_id=${event.id}`)
              }
              className="relative w-[220px] h-44 rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg hover:scale-[1.03] transition-transform duration-200 cursor-pointer"
            >
              <img
                src={event.image || "/images/no-image.jpeg"}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex flex-col justify-end text-white">
                <p className="text-xs font-medium text-gray-200 mb-1">{dateFormatted}</p>
                <p className="font-semibold text-sm truncate">{event.name}</p>
                <p className="text-xs text-gray-300 truncate">{event.clubs?.name || event.club_name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@lib/supabase-browser";

export default function DashboardEventHighlights() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserSupabase();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: clubData } = await supabase
          .from("clubs")
          .select("id")
          .eq("manager_id", user.id)
          .single();

        const res = await fetch(`/api/events?club_id=${clubData.id}`);
        const { events: allEvents } = await res.json();
        setEvents(allEvents || []);
      } catch (err) {
        console.error("Failed to load dashboard events", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [supabase]);

  const now = new Date();

  const upcomingEvents = events
    .filter((e) => new Date(e.start_date) > now || isEventLive(e, now))
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 3);

  if (loading || upcomingEvents.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcomingEvents.map((evt) => {
          const isLive = isEventLive(evt, now);
          const startDate = new Date(evt.start_date);

          const formattedDate = startDate.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const formattedTime = startDate.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={evt.id}
              onClick={() => router.push(`/events/detail-event?event_id=${evt.id}`)}
              className={`relative bg-white p-4 rounded-xl shadow-sm border hover:shadow-md cursor-pointer transition ${
                isLive ? "border-2 border-purple-500 animate-pulse" : "border-gray-200"
              }`}
            >
              {/* LIVE badge top-right */}
              {isLive && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-red-600 font-semibold">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping inline-block"></span>
                  LIVE
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-base">{evt.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{formattedDate}</p>
              <p className="text-xs text-gray-500">{formattedTime}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function isEventLive(event, now) {
  const start = new Date(event.start_date);
  const end = event.end_date ? new Date(event.end_date) : start;
  return start <= now && now <= end;
}

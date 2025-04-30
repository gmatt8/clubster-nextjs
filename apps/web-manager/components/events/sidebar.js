// apps/web-manager/components/events/sidebar.js
"use client";

import { useState } from "react";
import LoadingSpinner from "../common/LoadingSpinner";

export default function EventsSidebar({ events = [], onNewEvent, onEditEvent, loading = false }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [visibleCount, setVisibleCount] = useState(6);
  const now = new Date();

  const filteredEvents = events.filter((evt) => {
    const eventEndDate = evt.end_date
      ? new Date(evt.end_date)
      : new Date(evt.start_date);
    return activeTab === "upcoming"
      ? eventEndDate > now
      : eventEndDate <= now;
  });

  const visibleEvents = filteredEvents.slice(0, visibleCount);

  return (
    <div className="w-full md:w-1/3 bg-white border-r border-gray-200 p-4 rounded-lg">
      {/* Bottone + New Event */}
      <div className="flex justify-center mb-4">
        <button
          onClick={onNewEvent}
          className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
        >
          + New Event
        </button>
      </div>

      {/* Tabs: Upcoming / Past */}
      <div className="flex justify-around border-b border-gray-200 mb-4">
        <button
          className={`pb-2 text-sm font-semibold ${
            activeTab === "upcoming"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => {
            setActiveTab("upcoming");
            setVisibleCount(6);
          }}
        >
          Upcoming
        </button>
        <button
          className={`pb-2 text-sm font-semibold ${
            activeTab === "past"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => {
            setActiveTab("past");
            setVisibleCount(6);
          }}
        >
          Past
        </button>
      </div>

      {/* Sezione caricamento + lista eventi */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-[150px]">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {visibleEvents.length === 0 ? (
                <li className="text-center text-gray-500">No events found.</li>
              ) : (
                visibleEvents.map((evt) => (
                  <li
                    key={evt.id}
                    className="flex items-center justify-between bg-white rounded-lg shadow p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onEditEvent(evt.id)}
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800">{evt.name}</h3>
                      <p className="text-sm text-gray-500">
                        {evt.start_date
                          ? new Date(evt.start_date).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "No date"}
                      </p>
                    </div>
                    <span className="text-gray-400 text-xl">⋮</span>
                  </li>
                ))
              )}
            </ul>

            {/* Bottone See More */}
            {filteredEvents.length > visibleEvents.length && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
                >
                  See More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// apps/web-manager/components/events/sidebar.js
"use client";

import { useState } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import { PlusCircle } from "lucide-react";

export default function EventsSidebar({ events = [], onNewEvent, onEditEvent, loading = false }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [visibleCount, setVisibleCount] = useState(6);
  const now = new Date();

  const filteredEvents = events.filter((evt) => {
    const eventEndDate = evt.end_date ? new Date(evt.end_date) : new Date(evt.start_date);
    return activeTab === "upcoming" ? eventEndDate > now : eventEndDate <= now;
  });

  const visibleEvents = filteredEvents.slice(0, visibleCount);

  return (
    <div className="w-full md:w-1/3 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Your Events</h2>
        <button
          onClick={onNewEvent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Tabs */}
      <div className="flex justify-around border-b border-gray-200 mb-4">
        {[
          { key: "upcoming", label: "Upcoming" },
          { key: "past", label: "Past" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`pb-2 text-sm font-semibold ${
              activeTab === tab.key ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
            }`}
            onClick={() => {
              setActiveTab(tab.key);
              setVisibleCount(6);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Event List */}
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
                visibleEvents.map((evt) => {
                  const isPast = new Date(evt.end_date || evt.start_date) < now;
                  const badgeColor = isPast ? "text-gray-400" : "text-blue-600";

                  return (
                    <li
                      key={evt.id}
                      className="flex items-start justify-between bg-white rounded-lg shadow hover:bg-gray-50 cursor-pointer p-3"
                      onClick={() => onEditEvent(evt.id)}
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">{evt.name}</h3>
                        <p className={`text-xs ${badgeColor}`}>
                          {evt.start_date
                            ? new Date(evt.start_date).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "No date"}
                        </p>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>

            {filteredEvents.length > visibleEvents.length && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition text-sm"
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
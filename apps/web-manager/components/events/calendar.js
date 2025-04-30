// apps/web-customer/app/components/events/calendar.js
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../common/LoadingSpinner";

export default function EventsCalendar({ events = [], loading = false }) {
  const router = useRouter();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  const eventMap = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const dateObj = new Date(ev.start_date);
      const dateKey = dateObj.toISOString().slice(0, 10);
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(ev);
    });
    return map;
  }, [events]);

  function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function prevMonth() {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  function nextMonth() {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const adjustedFirstDay = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;
  const blankDays = adjustedFirstDay - 1;
  const calendarDays = [
    ...Array(blankDays).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthLabel = `${monthNames[currentMonth]} ${currentYear}`;
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="w-full md:w-2/3 bg-white border border-gray-200 p-4 rounded-lg">
      {/* Navigazione mese con frecce fisse */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2"
          aria-label="Previous month"
        >
          ←
        </button>
        <div className="text-lg font-medium text-gray-700">{monthLabel}</div>
        <button
          onClick={nextMonth}
          className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Intestazione giorni */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-2">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>

      {/* Griglia */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={idx} className="h-20"></div>;

            const cellDateKey = formatDate(currentYear, currentMonth, day);
            const dayEvents = eventMap[cellDateKey] || [];
            const hasEvent = dayEvents.length > 0;
            const cellDate = new Date(currentYear, currentMonth, day);
            const isPast = cellDate < todayDate;

            if (hasEvent) {
              const eventBgColor = isPast ? "bg-gray-100" : "bg-green-100";
              const eventBorderColor = isPast ? "border-gray-400" : "border-green-500";
              const eventNames = dayEvents.map((ev) => ev.name).join(", ");
              return (
                <div
                  key={idx}
                  className={`relative h-20 border-4 ${eventBorderColor} ${eventBgColor} rounded flex items-center justify-center p-1 cursor-pointer`}
                  onClick={() => router.push(`/events/edit-event?event_id=${dayEvents[0].id}`)}
                >
                  <div className="absolute top-1 right-1 text-xs text-gray-600">{day}</div>
                  <span className="text-xs text-gray-700 font-bold text-center">
                    {eventNames}
                  </span>
                </div>
              );
            } else {
              const bgColor = isPast ? "bg-gray-100" : "bg-white";
              return (
                <div
                  key={idx}
                  className={`relative h-20 border border-gray-200 ${bgColor} rounded`}
                >
                  <div className="absolute top-1 right-1 text-xs text-gray-500">{day}</div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}

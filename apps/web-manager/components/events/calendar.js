// apps/web-customer/app/components/events/calendar.js
// Updated EventsCalendar.js with clickable individual event badges
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../common/LoadingSpinner";

export default function EventsCalendar({ events = [], loading = false }) {
  const router = useRouter();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

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
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
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
    <div className="w-full md:w-2/3 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2"
          aria-label="Previous month"
        >
          ←
        </button>
        <div className="text-lg font-medium text-gray-800">{monthLabel}</div>
        <button
          onClick={nextMonth}
          className="text-gray-600 hover:text-gray-800 text-xl font-bold px-2"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
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
            const cellDate = new Date(currentYear, currentMonth, day);
            const isToday = cellDate.toDateString() === todayDate.toDateString();
            const isPast = cellDate < todayDate;

            const baseStyle = "relative h-20 rounded border text-xs p-1 flex flex-col justify-between overflow-hidden";
            const borderColor = isToday ? "border-purple-500 border-2" : "border-gray-200";
            const bgColor = isPast ? "bg-gray-50" : "bg-white";

            return (
              <div
                key={idx}
                className={`${baseStyle} ${borderColor} ${bgColor}`}
              >
                <div className="text-gray-400 absolute top-1 left-1 font-semibold">{day}</div>
                <div className="mt-5 space-y-1">
                  {dayEvents.slice(0, 2).map((ev, i) => (
                    <button
                      key={i}
                      onClick={() => router.push(`/events/edit-event?event_id=${ev.id}`)}
                      className="w-full bg-green-100 text-green-800 rounded px-1 py-0.5 text-[10px] font-medium truncate hover:bg-green-200"
                      title={ev.name}
                    >
                      {ev.name}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-gray-400 italic">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
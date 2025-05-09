// apps/web-manager/components/events/DateTimePicker.js
"use client";

import { Popover } from "@headlessui/react";
import { CalendarIcon } from "@heroicons/react/20/solid";
import { DayPicker } from "react-day-picker";
import { enGB } from "date-fns/locale";
import "react-day-picker/dist/style.css"; // <--- IMPORTANTE per lo stile

export default function DatePicker({ selected, onSelect }) {
  const today = new Date();
  const todayNormalized = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  function handleSelect(day) {
    if (!day) return;
    const localDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    onSelect(localDay);
  }

  const buttonLabel = selected
    ? selected.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select date";

  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center justify-between border border-gray-300 rounded px-3 py-2 w-32 sm:w-48">
        <span className="text-sm text-gray-700">{buttonLabel}</span>
        <CalendarIcon className="w-5 h-5 ml-2 text-gray-500" />
      </Popover.Button>

      <Popover.Panel className="absolute z-10 mt-2 bg-white p-2 border border-gray-200 rounded shadow">
        <div className="w-[20rem] text-sm">
          <DayPicker
            locale={enGB}
            weekStartsOn={1}
            showOutsideDays={false}
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={{ before: todayNormalized }}
          />
        </div>
      </Popover.Panel>
    </Popover>
  );
}

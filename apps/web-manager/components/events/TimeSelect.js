"use client";

import { Popover } from "@headlessui/react";
import { ClockIcon } from "@heroicons/react/20/solid";

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, "0");
  const m = String((i % 4) * 15).padStart(2, "0");
  return `${h}:${m}`;
});

export default function TimeSelect({ value, onChange }) {
  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center justify-between w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700">
        {value || "Select time"}
        <ClockIcon className="w-4 h-4 ml-2 text-gray-500" />
      </Popover.Button>

      <Popover.Panel className="absolute z-10 mt-2 bg-white p-2 border border-gray-200 rounded shadow max-h-60 overflow-y-auto w-full">
        <div className="grid grid-cols-3 gap-2 text-sm">
          {TIME_OPTIONS.map((time) => (
            <button
              key={time}
              onClick={() => onChange(time)}
              className="hover:bg-indigo-100 rounded px-2 py-1 text-left"
            >
              {time}
            </button>
          ))}
        </div>
      </Popover.Panel>
    </Popover>
  );
}

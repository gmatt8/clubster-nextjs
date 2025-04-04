// /components/customer/home/calendar.js
"use client";

import { Popover } from "@headlessui/react";
import { CalendarIcon } from "@heroicons/react/20/solid";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { enGB } from "date-fns/locale";

/**
 * Componente DatePicker
 * - Bottone: mostra la data selezionata o "Select date"
 * - Popover: contiene il calendario
 * - Disabilita i giorni prima di oggi
 * - Usa locale en-GB e inizia la settimana di lunedì
 * - Normalizza la data selezionata per evitare offset indesiderati
 */
export default function DatePicker({ selected, onSelect }) {
  // Calcoliamo "oggi" normalizzato a mezzanotte (per disabilitare i giorni passati)
  const today = new Date();
  const todayNormalized = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // Quando selezioniamo un giorno dal calendario, rimuoviamo l'orario
  // per evitare problemi di offset (es. clicco 3, ma salva 2).
  function handleSelect(day) {
    if (!day) return;
    const localDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    onSelect(localDay);
  }

  return (
    <Popover className="relative">
      {/* Bottone che apre il popover */}
      <Popover.Button className="flex items-center justify-between border border-gray-300 rounded px-3 py-2 w-32 sm:w-48">
        <span className="text-sm text-gray-700">
          {selected
            ? selected.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Select date"}
        </span>
        <CalendarIcon className="w-5 h-5 ml-2 text-gray-500" />
      </Popover.Button>

      {/* Popover Panel con il calendario */}
      <Popover.Panel className="absolute z-10 mt-2 bg-white p-2 border border-gray-200 rounded shadow w-[18rem]">
        <DayPicker
          locale={enGB}
          weekStartsOn={1}
          showOutsideDays={false}
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          disabled={{ before: todayNormalized }}
        />
      </Popover.Panel>
    </Popover>
  );
}

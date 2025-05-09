// apps/web-manager/components/events/StepDate.js

import DatePicker from "./DataTimePicker";
import TimeSelect from "./TimeSelect"; // nuovo componente custom

export default function StepDate({
  startDate, setStartDate,
  startTime, setStartTime,
  endDate, setEndDate,
  endTime, setEndTime
}) {
  return (
    <div className="space-y-6">
      {/* Sezione Data Inizio + Ora Inizio */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1 text-gray-700">Data Inizio*</label>
          <DatePicker
            selected={startDate ? new Date(startDate) : null}
            onSelect={(date) => setStartDate(date.toLocaleDateString("en-CA"))}
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700">Ora Inizio*</label>
          <TimeSelect value={startTime} onChange={setStartTime} />
        </div>
      </div>

      {/* Sezione Data Fine + Ora Fine */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1 text-gray-700">Data Fine*</label>
          <DatePicker
            selected={endDate ? new Date(endDate) : null}
            onSelect={(date) => setEndDate(date.toLocaleDateString("en-CA"))}
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700">Ora Fine*</label>
          <TimeSelect value={endTime} onChange={setEndTime} />
        </div>
      </div>
    </div>
  );
}

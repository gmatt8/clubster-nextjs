// apps/web-manager/components/events/StepDate.js


import DatePicker from "@components/events/DataTimePicker";

export default function StepDate({
  startDate, setStartDate,
  startTime, setStartTime,
  endDate, setEndDate,
  endTime, setEndTime
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Data Inizio*</label>
          <DatePicker
            selected={startDate ? new Date(startDate) : null}
            onSelect={(date) => setStartDate(date.toLocaleDateString("en-CA"))}
          />
        </div>
        <div>
          <label className="block font-medium">Ora Inizio*</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Data Fine*</label>
          <DatePicker
            selected={endDate ? new Date(endDate) : null}
            onSelect={(date) => setEndDate(date.toLocaleDateString("en-CA"))}
          />
        </div>
        <div>
          <label className="block font-medium">Ora Fine*</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}

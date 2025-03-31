"use client";

export default function NextEvents({ clubId }) {
  // Qui potresti fare un fetch degli eventi futuri del club (clubId),
  // per ora usiamo un segnaposto.
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Next events</h2>

      <div className="flex gap-8">
        {/* Calendario placeholder */}
        <div className="border border-gray-300 p-4 rounded w-48 h-48 flex items-center justify-center">
          <span className="text-gray-500">Calendar placeholder</span>
        </div>

        {/* Informazioni evento */}
        <div className="flex flex-col space-y-2">
          <span className="font-semibold text-gray-800 text-lg">EVENT TITLE</span>
          <span className="text-sm text-gray-500">Friday, February 7th</span>
          <span className="text-sm text-gray-500">23:00 - 05:00</span>
          <div className="flex items-center gap-2 mt-2">
            {/* Selezione del tipo di ticket */}
            <select className="border border-gray-300 rounded px-2 py-1">
              <option>Normal ticket</option>
              <option>VIP ticket</option>
            </select>
            {/* Quantità */}
            <input
              type="number"
              min="1"
              defaultValue="1"
              className="border border-gray-300 rounded w-16 px-2 py-1"
            />
            {/* Bottone "Book now" */}
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Book now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

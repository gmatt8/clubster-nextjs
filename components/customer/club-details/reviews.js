"use client";

export default function Reviews({ clubId }) {
  // Potresti fetchare le recensioni reali per "clubId".
  // Per ora, ecco un esempio statico.

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Reviews <span className="text-gray-500">★ 4.8 · 157 reviews</span>
        </h2>
        <div>
          <label className="mr-2 text-sm text-gray-600">Sort by:</label>
          <select className="border border-gray-300 rounded px-2 py-1">
            <option value="recent">Most recent</option>
            <option value="high">Highest rating</option>
            <option value="low">Lowest rating</option>
          </select>
        </div>
      </div>

      {/* Esempi di recensioni */}
      <div className="space-y-4">
        <div className="border border-gray-200 p-4 rounded">
          <p className="text-sm text-gray-600 mb-1">October 2024</p>
          <p className="text-gray-800">
            A fun experience overall! The staff was friendly, and the club has a
            great vibe.
          </p>
        </div>
        <div className="border border-gray-200 p-4 rounded">
          <p className="text-sm text-gray-600 mb-1">September 2024</p>
          <p className="text-gray-800">
            Great music with a fantastic rooftop view. The cocktails were
            superb. Would definitely come back again!
          </p>
        </div>
      </div>

      {/* Pulsante "Show more" */}
      <div className="mt-4">
        <button className="text-purple-600 hover:underline">Show more</button>
      </div>
    </section>
  );
}

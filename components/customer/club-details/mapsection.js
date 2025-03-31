"use client";

export default function MapSection({ club }) {
  const { address = "Unknown location" } = club || {};

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Find us here</h2>
      {/* Placeholder mappa */}
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">
        <span className="text-gray-500">Map placeholder for {address}</span>
      </div>
    </section>
  );
}

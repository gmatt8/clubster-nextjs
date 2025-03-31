// components/customer/club-details/clubinfo.js
"use client";

export default function ClubInfo({ club }) {
  // 'club' contiene i dati come nome, immagini, rating, ecc.
  return (
    <section className="mb-8">
      <h1 className="text-2xl font-bold">{club.name}</h1>
      {/* Esempio di rating e location */}
      <div className="text-sm text-gray-600">
        {club.address} – Rating: {club.rating ?? "N/A"}
      </div>
      {/* Immagini: potresti avere un array club.images */}
      <div className="flex gap-4 mt-4">
        {club.images?.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Club image ${i}`}
            className="w-48 h-32 object-cover rounded"
          />
        ))}
      </div>
      {/* Bottone "Book now" o altro */}
      <button className="bg-purple-600 text-white px-4 py-2 rounded mt-4">
        Book now
      </button>
    </section>
  );
}

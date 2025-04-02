// components/customer/club-details/clubinfo.js
"use client";

import { useState } from "react";

export default function ClubInfo({ club }) {
  const images = club.images || [];

  return (
    <section className="mb-8">
      {/* Header: Nome, indirizzo e rating */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{club.name}</h1>
        <div className="text-sm text-gray-600">
          {club.address} – Rating: {club.rating ?? "N/A"}
        </div>
      </div>

      {/* Layout immagini */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Colonna sinistra: cover grande */}
        <div className="flex-1">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt="Club main cover"
              className="w-full h-[500px] object-cover rounded"
            />
          ) : (
            <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center rounded">
              No image
            </div>
          )}
        </div>

        {/* Colonna destra: seconda immagine (media) e sotto tre piccole */}
        <div className="w-full md:w-1/3 flex flex-col gap-2">
          {images.length > 1 && (
            <img
              src={images[1]}
              alt="Club secondary image"
              className="w-full h-[240px] object-cover rounded"
            />
          )}
          {images.length > 2 && (
            <div className="flex gap-2">
              {images.slice(2, 5).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Thumbnail ${i}`}
                  className="w-1/3 h-[80px] object-cover rounded"
                />
              ))}
            </div>
          )}
          {images.length > 5 && (
            <button
              onClick={() => alert("Show all images (to implement)")}
              className="mt-2 text-sm text-purple-600 hover:underline"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      {/* Descrizione */}
      {club.description && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-1">Description</h2>
          <p className="text-gray-700">{club.description}</p>
        </div>
      )}
    </section>
  );
}

// components/customer/club-details/clubinfo.js
"use client";

import { useState, useEffect } from "react";
// Esempio di icona share da react-icons
import { FiShare2 } from "react-icons/fi";

export default function ClubInfo({ club }) {
  const images = club.images || [];

  // Stato per la media e il numero di recensioni
  const [averageRating, setAverageRating] = useState("0.0");
  const [reviewsCount, setReviewsCount] = useState(0);

  // Recupera le recensioni per calcolare media e conteggio
  useEffect(() => {
    async function fetchReviews() {
      if (!club.id) return;
      try {
        const res = await fetch(`/api/reviews?club_id=${club.id}`);
        if (!res.ok) throw new Error("Error fetching reviews");
        const data = await res.json();
        const reviews = data.reviews || [];
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
          const avg = (sum / reviews.length).toFixed(1);
          setAverageRating(avg);
          setReviewsCount(reviews.length);
        } else {
          setAverageRating("0.0");
          setReviewsCount(0);
        }
      } catch (err) {
        console.error(err);
        setAverageRating("0.0");
        setReviewsCount(0);
      }
    }
    fetchReviews();
  }, [club.id]);

  return (
    <section className="mb-8">
      {/* Header: nome club, indirizzo, rating, share icon */}
      <div className="flex items-start justify-between">
        {/* Colonna sinistra: nome + indirizzo */}
        <div>
          <h1 className="text-2xl font-bold">{club.name}</h1>
          {club.address && (
            <p className="text-sm text-gray-600 mt-1">{club.address}</p>
          )}
        </div>

        {/* Colonna destra: rating + share */}
        <div className="flex items-start gap-4">
          {/* Sezione rating e numero recensioni */}
          <div className="flex flex-col items-end">
            {/* Riga stella + media */}
            <div className="flex items-center gap-1 text-xl">
              <span className="text-yellow-500">★</span>
              <span>{averageRating}</span>
            </div>
            {/* Numero di recensioni */}
            <p className="text-sm text-gray-500">
              {reviewsCount} reviews
            </p>
          </div>

          {/* Icona share */}
          <button
            onClick={() => alert("Share functionality to be implemented")}
            className="text-gray-600 hover:text-gray-800 mt-1"
            title="Share"
          >
            <FiShare2 size={20} />
          </button>
        </div>
      </div>

      {/* Immagini: principale + colonna destra */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Immagine principale */}
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

        {/* Seconda immagine media + miniature */}
        <div className="w-full md:w-1/3 flex flex-col gap-2">
          {images.length > 1 && (
            <img
              src={images[1]}
              alt="Club secondary"
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

      {/* Descrizione (se presente) */}
      {club.description && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-1">Description</h2>
          <p className="text-gray-700">{club.description}</p>
        </div>
      )}
    </section>
  );
}

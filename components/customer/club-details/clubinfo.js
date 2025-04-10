// components/customer/club-details/clubinfo.js
"use client";

import { useState, useEffect } from "react";
import { FiShare2 } from "react-icons/fi";

export default function ClubInfo({ club }) {
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

  // Otteniamo l'immagine principale (max 1 secondo le nuove regole)
  const images = club.images || [];
  const clubImage = images.length > 0 ? images[0] : null;

  // Funzione per gestire la condivisione del link del club
  const handleShare = async () => {
    const shareData = {
      title: club.name,
      text: club.description || `Scopri ${club.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log("Club shared successfully.");
      } else {
        // Fallback: copia il link negli appunti
        await navigator.clipboard.writeText(window.location.href);
        console.log("Link copiato negli appunti.");
      }
    } catch (error) {
      console.error("Error sharing the club: ", error);
      // Non viene mostrato alcun alert in caso di errore.
    }
  };

  return (
    <section className="mb-8">
      {/* Hero con immagine di sfondo blur */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg">
        {clubImage ? (
          <>
            {/* Immagine di sfondo blurrata */}
            <img
              src={clubImage}
              alt="Club background"
              className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
            />
            {/* Overlay scuro per migliore leggibilità */}
            <div className="absolute inset-0 bg-black bg-opacity-30" />
          </>
        ) : (
          // Se non ci sono immagini
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
            No image
          </div>
        )}

        {/* Contenuto in sovrimpressione (hero content) */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-white">
          {/* Immagine non blur in primo piano, se presente */}
          {clubImage && (
            <img
              src={clubImage}
              alt="Club main"
              className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-full border-4 border-white shadow mb-4"
            />
          )}

          {/* Nome Club e indirizzo */}
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            {club.name}
          </h1>
          {club.address && (
            <p className="text-sm md:text-base text-gray-100 mt-1 text-center">
              {club.address}
            </p>
          )}

          {/* Rating + Share */}
          <div className="flex items-center gap-6 mt-4">
            {/* Rating */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-xl">
                <span className="text-yellow-400">★</span>
                <span>{averageRating}</span>
              </div>
              <p className="text-xs text-gray-100">{reviewsCount} reviews</p>
            </div>

            {/* Icona share */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center text-gray-100 hover:text-white"
              title="Share"
            >
              <FiShare2 size={20} />
              <span className="text-xs mt-1">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Descrizione Club (se presente) */}
      {club.description && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-1">Description</h2>
          <p className="text-gray-700">{club.description}</p>
        </div>
      )}
    </section>
  );
}

// apps/web-customer/app/components/club-details/clubinfo.js
"use client";

import { useState, useEffect } from "react";
import { FiShare2 } from "react-icons/fi";

export default function ClubInfo({ club }) {
  const [averageRating, setAverageRating] = useState(null);
  const [reviewsCount, setReviewsCount] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const images = club.images || [];
  const clubImage = images.length > 0 ? images[0] : "/images/no-image.jpeg";

  const handleShare = async () => {
    const shareData = {
      title: club.name,
      text: club.description || `Scopri ${club.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Error sharing the club: ", error);
    }
  };

  return (
    <section className="mb-8">
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg">
        {clubImage && (
          <>
            <img
              src={clubImage}
              alt="Club background"
              className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </>
        )}

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-white text-center">
          {clubImage && (
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4">
              <img
                src={clubImage}
                alt="Club"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold">{club.name}</h1>
          {club.address && (
            <p className="text-sm md:text-base text-gray-100 mt-1">{club.address}</p>
          )}

          <div className="flex items-center gap-6 mt-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-xl">
                <span className="text-yellow-400">★</span>
                <span>{averageRating ?? "…"}</span>
              </div>
              <p className="text-xs text-gray-100">
                {reviewsCount !== null ? `${reviewsCount} reviews` : "Loading..."}
              </p>
            </div>

            <div className="relative">
              <button
                onClick={handleShare}
                className="flex flex-col items-center text-gray-100 hover:text-white"
                title="Share"
              >
                <FiShare2 size={20} />
                <span className="text-xs mt-1">Share</span>
              </button>
              {copied && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow">
                  Link copied!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {club.description && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-1">Description</h2>
          <p className="text-gray-700">{club.description}</p>
        </div>
      )}
    </section>
  );
}

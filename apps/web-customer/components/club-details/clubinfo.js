// apps/web-customer/app/components/club-details/clubinfo.js
"use client";

import { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { FiShare2, FiMapPin, FiExternalLink, FiX } from "react-icons/fi";

export default function ClubInfo({ club }) {
  const [averageRating, setAverageRating] = useState(null);
  const [reviewsCount, setReviewsCount] = useState(null);
  const [copied, setCopied] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const images = club.images?.length > 0 ? club.images : ["/images/no-image.jpeg"];

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.update();
    }
  }, [images]);

  useEffect(() => {
    async function fetchReviews() {
      if (!club.id) return;
      try {
        const res = await fetch(`/api/reviews?club_id=${club.id}`);
        const data = await res.json();
        const reviews = data.reviews || [];
        const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
        const avg = reviews.length > 0 ? (sum / reviews.length).toFixed(1) : "0.0";
        setAverageRating(avg);
        setReviewsCount(reviews.length);
      } catch (err) {
        console.error(err);
        setAverageRating("0.0");
        setReviewsCount(0);
      }
    }
    fetchReviews();
  }, [club.id]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: club.name,
          text: club.description || `Scopri ${club.name}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <section className="mb-12">
      {/* Image Carousel */}
      <div className="relative w-full h-[350px] md:h-[500px] rounded-xl overflow-hidden">
        <div ref={sliderRef} className="keen-slider h-full overflow-hidden">
          {images.map((src, index) => (
            <div
              key={index}
              className="keen-slider__slide min-w-full flex items-center justify-center cursor-zoom-in"
              onClick={() => setShowFullscreen(true)}
            >
              <img
                src={src}
                alt={`Club image ${index + 1}`}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />

        {images.length > 1 && (
          <>
            <button
              onClick={() => instanceRef.current?.prev()}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white rounded-full p-2 hover:bg-black/60"
              aria-label="Previous image"
            >
              ❮
            </button>
            <button
              onClick={() => instanceRef.current?.next()}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white rounded-full p-2 hover:bg-black/60"
              aria-label="Next image"
            >
              ❯
            </button>
          </>
        )}

        <div className="absolute bottom-6 left-6 z-20 text-white">
          <h1 className="text-3xl md:text-4xl font-bold drop-shadow">{club.name}</h1>
          <p className="flex items-center gap-2 text-sm md:text-base opacity-90">
            <FiMapPin className="inline-block" />
            {club.address || "Location not specified"}
          </p>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 w-full flex justify-center gap-2 z-20">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === currentSlide ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm md:text-base">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xl">★</span>
          <span className="font-semibold">{averageRating}</span>
          <span className="opacity-70">({reviewsCount} reviews)</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-700 hover:text-black"
            title="Share"
          >
            <FiShare2 />
            {copied ? "Link copied!" : "Share"}
          </button>

          {club.website && (
            <a
              href={club.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-black"
            >
              <FiExternalLink />
              Website
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {club.description && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">About {club.name}</h2>
          <p className="text-gray-700 leading-relaxed">{club.description}</p>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-red-400"
            aria-label="Close fullscreen"
          >
            <FiX />
          </button>

          <FullscreenSlider images={images} onClose={() => setShowFullscreen(false)} />
        </div>
      )}
    </section>
  );
}

function FullscreenSlider({ images, onClose }) {
  const [fullscreenRef, fullscreenInstance] = useKeenSlider({ loop: true });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="w-full max-w-5xl px-6">
      <div ref={fullscreenRef} className="keen-slider overflow-hidden">
        {images.map((src, i) => (
          <div key={i} className="keen-slider__slide min-w-full flex items-center justify-center">
            <img
              src={src}
              alt={`Fullscreen image ${i + 1}`}
              className="max-h-[90vh] w-auto mx-auto rounded"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="flex justify-between mt-6 text-white">
          <button
            onClick={() => fullscreenInstance.current?.prev()}
            className="text-lg bg-black/60 px-4 py-2 rounded hover:bg-black/80"
          >
            ❮
          </button>
          <button
            onClick={() => fullscreenInstance.current?.next()}
            className="text-lg bg-black/60 px-4 py-2 rounded hover:bg-black/80"
          >
            ❯
          </button>
        </div>
      )}
    </div>
  );
}

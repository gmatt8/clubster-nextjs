// apps/web-customer/components/club-details/reviews.js
"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "../common/LoadingSpinner";

export default function Reviews({ clubId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/reviews?club_id=${clubId}`);
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Error fetching reviews: ${errText}`);
        }
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (clubId) fetchReviews();
  }, [clubId]);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / totalReviews).toFixed(1)
      : "0.0";

  const sortedReviews = reviews.slice().sort((a, b) => {
    if (sortBy === "recent") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "high") return b.rating - a.rating;
    if (sortBy === "low") return a.rating - b.rating;
    return 0;
  });

  const visibleReviews = sortedReviews.slice(0, visibleCount);

  const handleShowMore = () => setVisibleCount((prev) => prev + 5);
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setVisibleCount(3);
  };

  if (loading) {
    return (
      <section className="mb-8">
        <LoadingSpinner />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Reviews
          <span className="text-yellow-500">★ {averageRating}</span>
          <span className="text-gray-500">· {totalReviews} reviews</span>
        </h2>

        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <label className="mr-2 text-sm text-gray-600">Sort by:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="recent">Most recent</option>
            <option value="high">Highest rating</option>
            <option value="low">Lowest rating</option>
          </select>
        </div>
      </div>

      {totalReviews === 0 ? (
        <div className="text-gray-500">This club has no reviews yet.</div>
      ) : (
        <div className="space-y-4">
          {visibleReviews.map((r) => (
            <div key={r.id} className="border border-gray-200 p-4 rounded shadow-sm bg-white">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600">
                  {new Date(r.created_at).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="flex items-center text-yellow-500 text-sm">
                  {"★".repeat(Math.floor(r.rating))}
                  {"☆".repeat(5 - Math.floor(r.rating))}
                </div>
              </div>
              <p className="text-gray-800 whitespace-pre-line">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {visibleCount < totalReviews && (
        <div className="mt-4">
          <button
            className="text-purple-600 hover:underline"
            onClick={handleShowMore}
          >
            Show more reviews
          </button>
        </div>
      )}
    </section>
  );
}

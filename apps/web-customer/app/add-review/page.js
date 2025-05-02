// apps/web-customer/app/add-review/page.js
// Improved AddReviewPage component with enhanced layout and UX
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CustomerLayout from "../CustomerLayout";

function StarRating({ rating, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          className={`cursor-pointer text-2xl ${
            star <= rating ? "text-yellow-500" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function AddReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const eventId = searchParams.get("event_id");
  const clubId = searchParams.get("club_id");
  const bookingId = searchParams.get("booking_id");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [eventData, setEventData] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoadingEvent(true);
        const res = await fetch(`/api/events?event_id=${eventId}`);
        if (!res.ok) throw new Error("Failed to load event data");
        const data = await res.json();
        if (data.events?.length > 0) setEventData(data.events[0]);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoadingEvent(false);
      }
    }
    if (eventId) fetchEvent();
  }, [eventId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("User not authenticated");

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: clubId,
          user_id: user.id,
          booking_id: bookingId,
          event_id: eventId,
          rating: parseFloat(rating),
          comment,
        }),
      });

      if (!res.ok) throw new Error("Error submitting review");

      setRating(5);
      setComment("");
      setSuccessMsg("Review submitted successfully!");

      setTimeout(() => router.push("/bookings"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  if (!eventId || !clubId || !bookingId) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-md mx-auto">
          <p className="text-red-500">Missing event, club or booking ID</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="px-6 py-10 max-w-screen-md mx-auto">
        <nav className="text-sm text-gray-500 mb-6">
          <span
            className="cursor-pointer hover:underline"
            onClick={() => router.push("/bookings")}
          >
            My Bookings
          </span>
          <span className="mx-2">›</span>
          <span className="text-gray-700 font-medium">Add review</span>
        </nav>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {loadingEvent ? (
            <p>Loading event details...</p>
          ) : (
            <>
              <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Leave a review</h1>
                {eventData && (
                  <p className="text-sm text-gray-600">
                    {eventData.name} • {new Date(eventData.start_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>

              {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
              {successMsg && <p className="text-green-500 mb-2 text-sm">{successMsg}</p>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">Rating</label>
                  <StarRating rating={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Your review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Share your experience..."
                  />
                </div>
                <div className="text-right">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700 text-sm font-medium"
                  >
                    Submit review
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
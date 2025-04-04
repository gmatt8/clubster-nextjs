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
        const res = await fetch(`/api/event?event_id=${eventId}`);
        if (!res.ok) {
          const errData = await res.text();
          throw new Error(`Error fetching event: ${errData}`);
        }
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          setEventData(data.events[0]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoadingEvent(false);
      }
    }
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not found");
      }
      const userId = user.id;

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: clubId,
          user_id: userId,
          booking_id: bookingId,
          event_id: eventId,
          rating: parseFloat(rating),
          comment,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error submitting review");
      }

      setRating(5);
      setComment("");
      setSuccessMsg("Review submitted successfully!");

      setTimeout(() => {
        router.push("/dashboard/customer/bookings");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  if (!eventId || !clubId || !bookingId) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-xl mx-auto">
          <p>Missing event_id, club_id or booking_id</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h2 className="text-sm text-gray-500 mb-2">
          <span className="cursor-pointer" onClick={() => router.push("/dashboard/customer/bookings")}>
            My tickets
          </span>{" "}
          &gt; Reviews
        </h2>

        <div className="border border-gray-300 p-4 rounded">
          {loadingEvent ? (
            <p>Loading event...</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold">Add review</h1>
                {eventData && (
                  <p className="text-sm text-gray-500">
                    {new Date(eventData.start_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              {eventData && (
                <>
                  <p className="font-semibold">
                    {eventData.name}{" "}
                    {eventData.music_genre ? `- ${eventData.music_genre}` : ""}
                  </p>
                  {eventData.club_id && (
                    <p className="text-sm text-gray-600 mb-4">
                      Seven Club, Lugano (Switzerland)
                    </p>
                  )}
                </>
              )}

              {error && <p className="text-red-500 mb-2">{error}</p>}
              {successMsg && <p className="text-green-500 mb-2">{successMsg}</p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-semibold">Rating</label>
                  <StarRating rating={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold">Your review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="border border-gray-300 rounded w-full p-2"
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Submit review
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

// app/dashboard/customer/checkout/success/page.js
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CustomerLayout from "../../CustomerLayout";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setError("Missing booking ID");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/bookings?booking_id=${bookingId}`, { credentials: "include" });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText);
        }
        const data = await res.json();
        if (data.bookings && data.bookings.length > 0) {
          setBooking(data.bookings[0]);
        } else {
          setError("Booking not found");
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-xl mx-auto text-center">
          Loading order details...
        </div>
      </CustomerLayout>
    );
  }

  if (error || !booking) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-xl mx-auto text-center">
          <p className="text-red-500">Error: {error || "Booking not found"}</p>
          <button
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 mt-4"
            onClick={() => router.push("/dashboard/customer/bookings")}
          >
            View bookings
          </button>
        </div>
      </CustomerLayout>
    );
  }

  // Utilizza il booking.id come order number (che contiene il Booking ID personalizzato)
  const orderNumber = booking.id;
  const orderDate = new Date(booking.created_at).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const event = booking.events;
  const eventDate = event
    ? new Date(event.start_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const eventName = event ? event.name : "";
  const eventLocation =
    event && event.clubs
      ? `${event.clubs.club_name}, ${event.clubs.city} (${event.clubs.country})`
      : "";

  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Thank you!</h1>
        <p className="mb-4">Your order was placed successfully.</p>
        <p className="mb-6 text-gray-600">
          We sent the order confirmation details to{" "}
          <strong>{booking.userEmail || "your email"}</strong>
        </p>

        {/* Order info */}
        <div className="mb-6">
          <p className="mb-1 font-bold">Order number #{orderNumber}</p>
          <p className="mb-1 text-gray-600">Order date: {orderDate}</p>
        </div>

        {/* Event details */}
        {event && (
          <div className="border border-gray-300 rounded p-4 text-left mb-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">{eventDate}</p>
              <p className="text-lg font-bold my-1">{eventName}</p>
              <p className="text-sm text-gray-600">{eventLocation}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                onClick={() =>
                  window.open(`/api/ticket?booking_id=${booking.id}`, "_blank")
                }
              >
                Download tickets
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                onClick={() =>
                  window.open(`/api/invoice?booking_id=${booking.id}`, "_blank")
                }
              >
                Download invoice
              </button>
            </div>
          </div>
        )}

        <button
          className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700"
          onClick={() => router.push("/dashboard/customer/bookings")}
        >
          View bookings
        </button>

        <p className="mt-4 text-gray-600">
          Need help or have questions? Contact support
        </p>
      </div>
    </CustomerLayout>
  );
}

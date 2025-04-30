// apps/web-customer/app/basket/page.js
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import CustomerLayout from "../CustomerLayout";
import AuthModal from "@components/basket/AuthModal";
import LoadingSpinner from "@components/common/LoadingSpinner";

export default function BasketPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");
  const initialTicketCategoryId = searchParams.get("ticket_category");
  const initialQuantity = Number(searchParams.get("quantity")) || 1;

  const [eventData, setEventData] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [selectedTicketCategoryId, setSelectedTicketCategoryId] = useState(initialTicketCategoryId || "");
  const [quantity, setQuantity] = useState(initialQuantity);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const eventRes = await fetch(`/api/events?event_id=${eventId}`);
        if (!eventRes.ok) {
          const errText = await eventRes.text();
          throw new Error(`Error fetching event: ${errText}`);
        }
        const { events } = await eventRes.json();
        if (!events || events.length === 0) {
          throw new Error("Event not found");
        }
        const currentEvent = events[0];
        setEventData(currentEvent);

        const catRes = await fetch(`/api/ticket-category?event_id=${eventId}`);
        if (!catRes.ok) {
          const errText = await catRes.text();
          throw new Error(`Error fetching ticket categories: ${errText}`);
        }
        const { ticketCategories: cats } = await catRes.json();
        setTicketCategories(cats || []);

        if (initialTicketCategoryId && !cats.find((c) => c.id === initialTicketCategoryId)) {
          setSelectedTicketCategoryId(cats.length > 0 ? cats[0].id : "");
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eventId, initialTicketCategoryId]);

  const selectedCategory = ticketCategories.find((cat) => cat.id === selectedTicketCategoryId);
  const totalPrice = selectedCategory ? selectedCategory.price * quantity : 0;

  async function handleCheckout() {
    if (!selectedTicketCategoryId || quantity <= 0) {
      alert("Please select a ticket category and a valid quantity");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId, ticketCategoryId: selectedTicketCategoryId, quantity }),
      });
      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 401 || errData.error === "User not authenticated") {
          setShowAuthModal(true);
          return;
        }
        throw new Error(errData.error || "Checkout error");
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!eventId) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-xl mx-auto">
          <p>Missing event_id</p>
        </div>
      </CustomerLayout>
    );
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-[300px]">
          <LoadingSpinner />
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-xl mx-auto">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Basket</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Colonna sinistra */}
          <div className="flex-1 border border-gray-300 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">{eventData?.clubs?.name || "Club Name"}</h2>
            <p className="text-gray-600 mb-4">{eventData?.name || "Event name"}</p>

            {/* Selezione Ticket Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket category</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={selectedTicketCategoryId}
                onChange={(e) => {
                  setSelectedTicketCategoryId(e.target.value);
                  const newCat = ticketCategories.find((c) => c.id === e.target.value);
                  if (newCat) {
                    setQuantity(newCat.available_tickets > 0 ? 1 : 0);
                  }
                }}
              >
                {ticketCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.price} CHF) - Available: {cat.available_tickets}
                  </option>
                ))}
              </select>
            </div>

            {/* Selezione quantità */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
              <input
                type="number"
                min="1"
                max={selectedCategory ? selectedCategory.available_tickets : 1}
                value={quantity}
                onChange={(e) => {
                  let newQuantity = Number(e.target.value);
                  if (selectedCategory && newQuantity > selectedCategory.available_tickets) {
                    newQuantity = selectedCategory.available_tickets;
                  }
                  setQuantity(newQuantity);
                }}
                disabled={selectedCategory && selectedCategory.available_tickets === 0}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* Colonna destra: Price details */}
          <div className="w-full md:w-72 border border-gray-300 p-4 rounded flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-4">Price details</h3>
              <div className="text-sm text-gray-700">
                <p className="mb-1">{eventData?.name || "Event Name"}</p>
                <p className="mb-1">
                  {selectedCategory ? `${selectedCategory.name} x ${quantity} guests` : "No ticket category"}
                </p>
                <p className="font-medium">Total (CHF): {totalPrice} CHF</p>
              </div>
            </div>
            <button
              className={`mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ${
                selectedCategory && selectedCategory.available_tickets === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleCheckout}
              disabled={loading || (selectedCategory && selectedCategory.available_tickets === 0)}
            >
              {selectedCategory && selectedCategory.available_tickets === 0 ? "Sold Out" : "Proceed to checkout"}
            </button>
          </div>
        </div>
      </div>
      {/* Includiamo il modal per l'autenticazione */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </CustomerLayout>
  );
}
"use client";

import { useState, useEffect, useMemo } from "react";
import ManagerLayout from "../ManagerLayout";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 20;

export default function ManagerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    async function fetchManagerBookings() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/bookings", { credentials: "include" });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText);
        }
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchManagerBookings();
  }, []);

  // Estrai la lista degli eventi unici dai booking
  const eventNames = useMemo(() => {
    const names = bookings.map((b) => b.events?.name).filter(Boolean);
    return Array.from(new Set(names));
  }, [bookings]);

  // Applica filtri e ordinamento
  const filteredBookings = useMemo(() => {
    let temp = [...bookings];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      temp = temp.filter((b) => {
        const orderIdMatch = b.booking_number?.toLowerCase().includes(lowerSearch);
        const emailMatch = b.profiles?.email?.toLowerCase().includes(lowerSearch);
        return orderIdMatch || emailMatch;
      });
    }
    if (selectedEvent) {
      temp = temp.filter((b) => b.events?.name === selectedEvent);
    }
    switch (sortBy) {
      case "date_asc":
        temp.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "date_desc":
        temp.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "email_asc":
        temp.sort((a, b) => (a.profiles?.email || "").localeCompare(b.profiles?.email || ""));
        break;
      case "email_desc":
        temp.sort((a, b) => (b.profiles?.email || "").localeCompare(a.profiles?.email || ""));
        break;
      default:
        temp.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }
    return temp;
  }, [bookings, searchTerm, selectedEvent, sortBy]);

  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const displayedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredBookings.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBookings, currentPage]);

  function handleDownloadTicket(bookingId) {
    window.open(`/api/ticket?booking_id=${booking.id}`, "_blank")
  }

  function handleResetFilter() {
    setSearchTerm("");
    setSelectedEvent("");
    setSortBy("date_desc");
    setCurrentPage(1);
  }

  function handlePrevPage() {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  }

  function handleNextPage() {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  }

  return (
    <ManagerLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Bookings</h1>

        {/* Sezione filtri */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search (order ID or email)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <div className="flex items-center gap-2">
            <label>Select event</label>
            <select
              className="border border-gray-300 rounded px-2 py-2"
              value={selectedEvent}
              onChange={(e) => {
                setSelectedEvent(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All</option>
              {eventNames.map((evt) => (
                <option key={evt} value={evt}>
                  {evt}
                </option>
              ))}
            </select>
          </div>
          <button
            className="text-red-600 border border-red-600 px-3 py-2 rounded"
            onClick={handleResetFilter}
          >
            Reset Filter
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <label>Sort by:</label>
            <select
              className="border border-gray-300 rounded px-2 py-2"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="date_desc">Date (desc)</option>
              <option value="date_asc">Date (asc)</option>
              <option value="email_asc">Email (A-Z)</option>
              <option value="email_desc">Email (Z-A)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm font-light border">
                <thead className="border-b font-medium bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">ORDER DATE</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBookings.map((b) => {
                    const dateObj = new Date(b.created_at);
                    const dateStr = dateObj.toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    });
                    return (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {b.booking_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {b.profiles?.email || b.userEmail || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {b.events?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDownloadTicket(b.id)}
                            className="bg-purple-600 text-white px-3 py-1 rounded mr-2"
                          >
                            Tickets
                          </button>
                          <button
                            disabled
                            className="bg-gray-300 text-gray-600 px-3 py-1 rounded cursor-not-allowed"
                          >
                            Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <p>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white"
                  }`}
                >
                  Prev
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 border rounded ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ManagerLayout>
  );
}

// apps/web-manager/app/bookings/page.js
"use client";

import { useState, useEffect, useMemo } from "react";
import ManagerLayout from "../ManagerLayout";
import { Download, FileText, Loader2 } from "lucide-react";

const PAGE_SIZE = 20;

export default function ManagerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Errore");
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const eventNames = useMemo(() => {
    const names = bookings.map((b) => b.events?.name).filter(Boolean);
    return Array.from(new Set(names));
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let temp = [...bookings];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      temp = temp.filter((b) =>
        (b.booking_number || "").toLowerCase().includes(term) ||
        (b.userEmail || "").toLowerCase().includes(term)
      );
    }
    if (selectedEvent) {
      temp = temp.filter((b) => b.events?.name === selectedEvent);
    }
    switch (sortBy) {
      case "date_asc":
        temp.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "email_asc":
        temp.sort((a, b) => (a.userEmail || "").localeCompare(b.userEmail || ""));
        break;
      case "email_desc":
        temp.sort((a, b) => (b.userEmail || "").localeCompare(a.userEmail || ""));
        break;
      default:
        temp.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }
    return temp;
  }, [bookings, searchTerm, selectedEvent, sortBy]);

  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const displayedBookings = filteredBookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDownloadTicket = (id) => {
    window.open(`/api/ticket?booking_id=${id}`, "_blank");
  };

  return (
    <ManagerLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 tracking-tight">Bookings</h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Search by email or order ID"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Events</option>
            {eventNames.map((evt) => (
              <option key={evt}>{evt}</option>
            ))}
          </select>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="date_desc">Date (Newest)</option>
            <option value="date_asc">Date (Oldest)</option>
            <option value="email_asc">Email (A-Z)</option>
            <option value="email_desc">Email (Z-A)</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="animate-spin w-5 h-5" />
              Loading...
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : displayedBookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Event</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBookings.map((b) => {
                    const dateStr = new Date(b.created_at).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    });
                    return (
                      <tr key={b.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{b.id}</td>
                        <td className="px-4 py-3">{b.userEmail || "N/A"}</td>
                        <td className="px-4 py-3">{b.events?.name || "N/A"}</td>
                        <td className="px-4 py-3">{dateStr}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            b.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : b.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDownloadTicket(b.id)}
                            className="inline-flex items-center gap-1 bg-purple-600 text-white text-xs px-3 py-1 rounded hover:bg-purple-700 mr-2"
                          >
                            <Download className="w-4 h-4" /> Tickets
                          </button>
                          <button
                            disabled
                            className="inline-flex items-center gap-1 bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded cursor-not-allowed"
                          >
                            <FileText className="w-4 h-4" /> Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center text-sm">
            <p>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:bg-gray-200 disabled:text-gray-400"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:bg-gray-200 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}

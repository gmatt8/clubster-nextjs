// /apps/web-customer/app/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { MapPin, CalendarSearch, Loader2 } from "lucide-react";
import CustomerLayout from "./CustomerLayout";
import DatePicker from "@/components/home/calendar";
import PopularLocation from "@/components/home/popularLocation";
import PopularClubs from "@/components/home/popularClubs";
import PopularEvents from "@/components/home/popularEvents";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { motion } from "framer-motion";

export default function CustomerHomePage() {
  const router = useRouter();
  const [searchType, setSearchType] = useState("event");
  const [city, setCity] = useState("");
  const [date, setDate] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  async function handleSearch() {
    if (searchType === "club" && !city.trim()) {
      setErrorMsg("Please enter a city");
      return;
    }
    if (searchType === "event" && !city.trim() && !date) {
      setErrorMsg("Enter a city or date to search for events");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSearchDone(true);

    const params = new URLSearchParams();
    params.set("type", searchType);
    if (city.trim()) params.set("location", city);
    if (searchType === "event" && date) {
      params.set("date", format(date, "yyyy-MM-dd"));
    }

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setResults(searchType === "event" ? data.events : data.clubs);
      } else {
        setErrorMsg("Something went wrong while searching.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setErrorMsg("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CustomerLayout>
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen pb-20">
        {/* Hero Section */}
        <motion.div
          className="text-center py-20 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Discover the <span className="text-purple-600">best nights</span> near you
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Explore events, clubs, and unforgettable nights in Europe’s top cities.
          </p>

          <div className="mb-6 flex justify-center gap-4">
            {["event", "club"].map((type) => (
              <button
                key={type}
                className={`text-sm font-medium pb-1 border-b-2 transition ${
                  searchType === type
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setSearchType(type)}
              >
                {type === "event" ? "Events" : "Clubs"}
              </button>
            ))}
          </div>

          {/* Search Card */}
          <div className="bg-white/60 backdrop-blur-md shadow-lg rounded-xl px-6 py-6 flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
            <div className="relative w-full sm:w-64">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {searchType === "event" && <DatePicker selected={date} onSelect={setDate} />}
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <CalendarSearch size={16} />}
              Search
            </button>
          </div>

          {errorMsg && <div className="text-red-600 mt-4 font-medium">{errorMsg}</div>}
        </motion.div>

        {/* Explore Sections */}
        {!searchDone && (
          <div className="max-w-screen-xl mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <h3 className="text-xl font-bold mb-2">Popular Locations</h3>
              <PopularLocation onSelect={(dest) => setCity(dest.name)} selectedAddress={city} />

              <h3 className="text-xl font-bold mt-10 mb-2">Featured Clubs</h3>
              <PopularClubs />

              <h3 className="text-xl font-bold mt-10 mb-2">Upcoming Events</h3>
              <PopularEvents />
            </motion.div>

            <section className="bg-white py-16 mt-16 border-t border-gray-100">
              <div className="max-w-screen-xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-10">Why Clubster?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  {[
                    {
                      title: "Instant Booking",
                      text: "Reserve your spot at the hottest events in seconds. No waiting. No email chains.",
                    },
                    {
                      title: "Verified Venues",
                      text: "We only list clubs that meet our quality, safety, and authenticity standards.",
                    },
                    {
                      title: "Transparent Pricing",
                      text: "What you see is what you pay. No hidden fees or last-minute surprises.",
                    },
                  ].map(({ title, text }) => (
                    <div key={title} className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-md transition">
                      <h3 className="text-lg font-semibold text-purple-600 mb-2">{title}</h3>
                      <p className="text-gray-600 text-sm">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {searchDone && loading && (
          <div className="flex justify-center items-center mt-10">
            <LoadingSpinner />
          </div>
        )}

        {searchDone && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-screen-xl mx-auto px-4 mt-10"
          >
            {results.length === 0 ? (
              <div className="text-center text-gray-500 text-lg mt-12">
                No results found. Try changing the city or date.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      router.push(
                        searchType === "club"
                          ? `/club-details?club_id=${item.id}`
                          : `/club-details?club_id=${item.club_id}&event_id=${item.id}`
                      )
                    }
                    className="cursor-pointer border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden bg-white"
                  >
                    <img
                      src={item.image || item.images?.[0] || "/images/no-image.jpeg"}
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h4>
                      {searchType === "event" && (
                        <>
                          <p className="text-sm text-gray-600">{item.clubs?.name || item.club_name}</p>
                          <p className="text-sm text-gray-500">
                            {item.start_date
                              ? format(new Date(item.start_date), "d MMM yyyy", { locale: enGB })
                              : "No date"}
                          </p>
                        </>
                      )}
                      {searchType === "club" && <p className="text-sm text-gray-500">{item.address}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </CustomerLayout>
  );
}

// apps/web-customer/app/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import CustomerLayout from "./CustomerLayout";
import DatePicker from "@/components/home/calendar";
import PopularLocation from "@/components/home/popularLocation";
import PopularClubs from "@/components/home/popularClubs";
import PopularEvents from "@/components/home/popularEvents";

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
    if (!city.trim()) {
      setErrorMsg("Inserisci una città");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSearchDone(true);

    const endpoint = searchType === "event" ? "/api/events" : "/api/clubs";
    const params = new URLSearchParams();
    params.set("city", city);
    if (searchType === "event" && date) {
      params.set("date", format(date, "yyyy-MM-dd"));
    }

    try {
      const res = await fetch(`${endpoint}?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setResults(searchType === "event" ? data.events : data.clubs);
      } else {
        setErrorMsg("Errore durante la ricerca.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setErrorMsg("Errore imprevisto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CustomerLayout>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h2 className="text-center text-lg font-semibold mb-6">your night starts here</h2>

        {/* Search Toggle */}
        <div className="flex justify-center mb-4 space-x-6">
          <button
            className={`pb-2 border-b-2 ${searchType === "event" ? "border-purple-600 text-purple-600" : "border-transparent text-gray-600"}`}
            onClick={() => setSearchType("event")}
          >
            Events
          </button>
          <button
            className={`pb-2 border-b-2 ${searchType === "club" ? "border-purple-600 text-purple-600" : "border-transparent text-gray-600"}`}
            onClick={() => setSearchType("club")}
          >
            Clubs
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <input
            type="text"
            placeholder="Inserisci città"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border rounded px-4 py-2 w-full sm:w-64"
          />
          {searchType === "event" && (
            <DatePicker selected={date} onSelect={setDate} />
          )}
          <button
            onClick={handleSearch}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Cerca
          </button>
        </div>

        {errorMsg && <div className="text-center text-red-500 mb-4">{errorMsg}</div>}

        {/* Results */}
        {!searchDone && (
          <>
            <h3 className="text-xl font-bold mb-2">Popular Location</h3>
            <PopularLocation onSelect={(dest) => setCity(dest.name)} selectedAddress={city} />

            <h3 className="text-xl font-bold mt-6 mb-2">Popular Clubs</h3>
            <PopularClubs />

            <h3 className="text-xl font-bold mt-6 mb-2">Popular Events</h3>
            <PopularEvents />
          </>
        )}

        {searchDone && loading && (
          <div className="text-center text-gray-500 mt-6">Loading...</div>
        )}

        {searchDone && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {results.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(
                  searchType === "club"
                    ? `/club-details?club_id=${item.id}`
                    : `/club-details?club_id=${item.club_id}&event_id=${item.id}`
                )}
                className="cursor-pointer border rounded-lg shadow hover:shadow-md transition overflow-hidden"
              >
                <img
                  src={item.image || item.images?.[0] || "/images/no-image.jpeg"}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-800">{item.name}</h4>
                  {searchType === "event" && (
                    <>
                      <p className="text-sm text-gray-600">{item.clubs?.name || item.club_name}</p>
                      <p className="text-sm text-gray-500">
                        {item.start_date ? format(new Date(item.start_date), "d MMM yyyy", { locale: enGB }) : "No date"}
                      </p>
                    </>
                  )}
                  {searchType === "club" && (
                    <p className="text-sm text-gray-500">{item.address}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

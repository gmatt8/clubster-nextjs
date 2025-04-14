// app/page.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import CustomerLayout from "@/app/customer/CustomerLayout";
import DatePicker from "@/components/customer/home/calendar";
import { MapPinIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Import dei componenti dei caroselli
import PopularLocation from "@/components/customer/home/popularLocation";
import PopularClubs from "@/components/customer/home/popularClubs";
import PopularEvents from "@/components/customer/home/popularEvents";

export default function CustomerHomePage() {
  const router = useRouter();

  // Stato per il form di ricerca
  const [searchType, setSearchType] = useState("event");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [radius, setRadius] = useState("10");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  // Risultati della ricerca
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);

  // Stato per ricerca avanzata
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [onlyWithEvents, setOnlyWithEvents] = useState(false);

  const locationInputRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps JS non è ancora caricato");
      return;
    }
    const autocomplete = new window.google.maps.places.Autocomplete(
      locationInputRef.current,
      { types: ["geocode"] }
    );
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      setLat(place.geometry.location.lat());
      setLng(place.geometry.location.lng());
      setLocationSearch(place.formatted_address || "");
    });
  }, []);

  useEffect(() => {
    if (searchType === "event") {
      setSortBy("date");
    } else {
      setSortBy("distance");
    }
    setOnlyWithEvents(false);
  }, [searchType]);

  async function handleSearch(customAddress, customLat, customLng) {
    setSearchPerformed(true);
    setErrorMsg("");
    setLoadingResults(true);

    const effectiveAddress =
      customAddress !== undefined ? customAddress : locationSearch;
    if (!effectiveAddress.trim()) {
      setErrorMsg("Inserisci una location per cercare.");
      setLoadingResults(false);
      return;
    }

    let effectiveLat = customLat !== undefined ? customLat : lat;
    let effectiveLng = customLng !== undefined ? customLng : lng;

    if (!effectiveLat && !effectiveLng) {
      if (typeof window !== "undefined" && window.google && window.google.maps && window.google.maps.Geocoder) {
        try {
          const geocoder = new window.google.maps.Geocoder();
          const results = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: effectiveAddress }, (results, status) => {
              if (status === "OK" && results.length) {
                resolve(results);
              } else {
                reject("Location non trovata");
              }
            });
          });
          effectiveLat = results[0].geometry.location.lat();
          effectiveLng = results[0].geometry.location.lng();
          setLat(effectiveLat);
          setLng(effectiveLng);
        } catch (error) {
          setErrorMsg("Non siamo riusciti a trovare la location.");
          setLoadingResults(false);
          return;
        }
      } else {
        setErrorMsg("Servizio di geocoding non disponibile.");
        setLoadingResults(false);
        return;
      }
    }

    const queryParams = new URLSearchParams({
      type: searchType,
      location: effectiveAddress.trim(),
      radius,
      lat: effectiveLat ? effectiveLat.toString() : "",
      lng: effectiveLng ? effectiveLng.toString() : "",
      sort: sortBy,
    });
    if (searchType === "club" && onlyWithEvents) {
      queryParams.set("onlyWithEvents", "true");
    }
    if (selectedDate) {
      const dateSearch = format(selectedDate, "yyyy-MM-dd");
      queryParams.set("date", dateSearch);
    }

    const query = `/api/search?${queryParams.toString()}`;
    try {
      const res = await fetch(query);
      if (!res.ok) throw new Error("Error fetching results");
      const data = await res.json();
      if (searchType === "club") {
        setClubs(data.clubs || []);
        setEvents([]);
      } else {
        setEvents(data.events || []);
        setClubs([]);
      }
      setVisibleCount(8);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error fetching results");
    } finally {
      setLoadingResults(false);
    }
  }

  function handlePopularDestinationClick(dest) {
    setLocationSearch(dest.address);
    setLat(dest.lat);
    setLng(dest.lng);
    setSortBy("distance");
    handleSearch(dest.address, dest.lat, dest.lng);
  }

  function showMore() {
    setVisibleCount((prev) => prev + 8);
  }

  function goToDetails(clubId, eventId, type) {
    if (type === "club") {
      router.push(`/customer/club-details?club_id=${clubId}`);
    } else if (type === "event") {
      router.push(
        `/customer/club-details?club_id=${clubId}&event_id=${eventId}`
      );
    }
  }

  // Render dei risultati della ricerca
  function renderClubBoxes() {
    if (loadingResults) {
      return <div className="text-center mt-6 text-gray-500">Loading...</div>;
    }
    if (clubs.length === 0) {
      if (searchPerformed) {
        return <div className="text-center mt-6 text-gray-500">No clubs found.</div>;
      }
      return null;
    }
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {clubs.slice(0, visibleCount).map((club) => (
            <div
              key={club.id}
              onClick={() => goToDetails(club.id, "", "club")}
              className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <img
                src={
                  club.images && club.images.length > 0
                    ? club.images[0]
                    : "/images/no-image.jpeg"
                }
                alt={club.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-bold text-gray-800">{club.name}</h2>
                <p className="text-sm text-gray-600">{club.shortAddress || club.address}</p>
              </div>
            </div>
          ))}
        </div>
        {clubs.length > visibleCount && (
          <div className="text-center mt-6">
            <button onClick={showMore} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Show more
            </button>
          </div>
        )}
      </>
    );
  }

  function renderEventBoxes() {
    if (loadingResults) {
      return <div className="text-center mt-6 text-gray-500">Loading...</div>;
    }
    if (events.length === 0) {
      if (searchPerformed) {
        return <div className="text-center mt-6 text-gray-500">No events found.</div>;
      }
      return null;
    }
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.slice(0, visibleCount).map((evt) => {
            const finalImage = evt.image ? evt.image : "/images/no-image.jpeg";
            return (
              <div
                key={evt.id}
                onClick={() => goToDetails(evt.club_id, evt.id, "event")}
                className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <img
                  src={finalImage}
                  alt={evt.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-800">{evt.name}</h2>
                  <p className="text-md text-gray-800 font-medium">{evt.club_name || "Unknown Club"}</p>
                  <p className="text-sm text-gray-600">
                    {evt.start_date ? format(new Date(evt.start_date), "d MMM yyyy", { locale: enGB }) : "No date"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {events.length > visibleCount && (
          <div className="text-center mt-6">
            <button onClick={showMore} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Show more
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col items-center">
        <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-6">your night starts here</h2>

        <div className="mb-6 flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setSearchType("event")}
            className={`pb-2 text-sm sm:text-base font-medium ${
              searchType === "event"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "border-b-2 border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-600"
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setSearchType("club")}
            className={`pb-2 text-sm sm:text-base font-medium ${
              searchType === "club"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "border-b-2 border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-600"
            }`}
          >
            Clubs
          </button>
        </div>

        <div className="w-full max-w-3xl flex flex-col items-center my-4">
          <div className="w-full flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 flex-1">
              <MapPinIcon className="h-5 w-5 text-gray-500" />
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Inserisci location"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full outline-none"
              />
            </div>
            {searchType === "event" && (
              <>
                <div className="h-6 w-px bg-gray-200 mx-3" />
                <div className="flex items-center gap-2">
                  <DatePicker selected={selectedDate} onSelect={(date) => setSelectedDate(date)} />
                </div>
              </>
            )}
            <button
              onClick={() => handleSearch()}
              className="ml-4 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
          {(searchType === "club" || searchType === "event") && (
            <div className="mt-2">
              <button onClick={() => setShowAdvanced((prev) => !prev)} className="text-purple-600 hover:underline text-sm">
                {showAdvanced ? "Nascondi opzioni avanzate" : "Advanced Search"}
              </button>
            </div>
          )}
          {showAdvanced && (searchType === "club" || searchType === "event") && (
            <div className="mt-3 flex flex-wrap items-center gap-4 w-full max-w-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Radius (km):</label>
                <input
                  type="number"
                  placeholder="es. 10"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-16"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                {searchType === "event" ? (
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Data</option>
                    <option value="distance">Distanza</option>
                    <option value="best_selling_event">Evento più venduto</option>
                    <option value="highest_rating">Rating migliore</option>
                  </select>
                ) : (
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="distance">Distanza</option>
                    <option value="best_selling_club">Best selling</option>
                    <option value="highest_rating">Rating migliore</option>
                  </select>
                )}
              </div>
              {searchType === "club" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="onlyWithEvents"
                    checked={onlyWithEvents}
                    onChange={(e) => setOnlyWithEvents(e.target.checked)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="onlyWithEvents" className="text-sm text-gray-700">
                    Mostra solo club con eventi disponibili
                  </label>
                </div>
              )}
            </div>
          )}
          {errorMsg && <div className="text-red-500 mt-2">{errorMsg}</div>}
        </div>

        {!searchPerformed && (
  <>
    <div className="w-full mt-4">
      <h3 className="text-xl font-bold mb-2 text-gray-800 text-left">
        Popular Location
      </h3>
      <PopularLocation 
        onSelect={handlePopularDestinationClick} 
        selectedAddress={locationSearch} 
      />
    </div>

    <div className="w-full mt-4">
      <h3 className="text-xl font-bold mb-2 text-gray-800 text-left">
        Popular Clubs
      </h3>
      <PopularClubs />
    </div>

    <div className="w-full mt-4">
      <h3 className="text-xl font-bold mb-2 text-gray-800 text-left">
        Popular Events
      </h3>
      <PopularEvents />
    </div>
  </>
)}


        <div className="w-full mt-8">
          {searchType === "club" ? renderClubBoxes() : renderEventBoxes()}
        </div>
      </div>
    </CustomerLayout>
  );
}

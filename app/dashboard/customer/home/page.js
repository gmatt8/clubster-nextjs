// app/dashboard/customer/home/page.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import CustomerLayout from "../CustomerLayout";
import DatePicker from "@/components/customer/home/calendar";

// Puoi usare la libreria di icone che preferisci
// Qui come esempio importiamo un'icona generica dal pacchetto Heroicons
import { MapPinIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function CustomerHomePage() {
  const router = useRouter();

  // Stati per i campi di ricerca
  const [locationSearch, setLocationSearch] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [radius, setRadius] = useState("10");
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [errorMsg, setErrorMsg] = useState("");

  // Per mostrare/nascondere il campo Radius (ricerca avanzata)
  const [showAdvanced, setShowAdvanced] = useState(false);

  const locationInputRef = useRef(null);

  // Inizializza l'autocomplete di Google Maps
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

  // Funzione di ricerca
  async function handleSearch() {
    if (!locationSearch || !selectedDate) {
      setErrorMsg("Please fill out location and date!");
      return;
    }
    setErrorMsg("");

    const dateSearch = format(selectedDate, "yyyy-MM-dd");

    try {
      const queryParams = new URLSearchParams({
        location: locationSearch,
        date: dateSearch,
        radius,
        lat: lat ? lat.toString() : "",
        lng: lng ? lng.toString() : "",
      });
      const query = `/api/search?${queryParams.toString()}`;
      const res = await fetch(query);
      if (!res.ok) throw new Error("Error fetching events");
      const { events: filteredData } = await res.json();
      setEvents(filteredData || []);
      setVisibleCount(8);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error fetching events");
    }
  }

  const visibleEvents = events.slice(0, visibleCount);

  function showMore() {
    setVisibleCount((prev) => prev + 8);
  }

  function goToClubDetails(clubId, eventId) {
    router.push(`/dashboard/customer/club-details?club_id=${clubId}&event_id=${eventId}`);
  }

  return (
    <CustomerLayout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Barra di ricerca principale */}
        <div className="w-full max-w-3xl flex flex-col items-center">
          {/* Grande box arrotondato */}
          <div className="w-full flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
            {/* Icona e campo "Where" */}
            <div className="flex items-center gap-2 w-full">
              <MapPinIcon className="h-5 w-5 text-gray-500" />
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Location"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full outline-none"
              />
            </div>

            {/* Divisore verticale */}
            <div className="h-6 w-px bg-gray-200 mx-3" />

            {/* Campo "When" */}
            <div className="flex items-center gap-2">
              <DatePicker
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date)}
              />
            </div>

            {/* Pulsante Search */}
            <button
              onClick={handleSearch}
              className="ml-4 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Pulsante Advanced Search per mostrare il campo Radius */}
          <div className="mt-2">
            <button
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="text-purple-600 hover:underline"
            >
              Advanced Search
            </button>
          </div>

          {/* Campo Radius (solo se showAdvanced è true) */}
          {showAdvanced && (
            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Radius (km):</label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-24"
              />
            </div>
          )}

          {/* Messaggio di errore */}
          {errorMsg && <div className="text-red-500 mt-2">{errorMsg}</div>}
        </div>

        {/* Griglia eventi */}
        <div className="w-full mt-8">
          {events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleEvents.map((evt) => {
                  // Immagine principale (o placeholder)
                  const firstImage =
                    evt.club_images && evt.club_images.length > 0
                      ? evt.club_images[0]
                      : "/placeholder.jpg";

                  // Data evento
                  const eventDate = evt.start_date
                    ? format(new Date(evt.start_date), "d MMM yyyy", { locale: enGB })
                    : "No date";

                  // Dati del club
                  const clubData = evt.clubs;
                  const locationDisplay =
                    clubData && clubData.city && clubData.country
                      ? `${clubData.city}, ${clubData.country}`
                      : clubData && clubData.address
                      ? clubData.address
                      : "Club location";

                  // Prezzo
                  const priceLabel = evt.min_price
                    ? `From ${evt.min_price} CHF`
                    : "Free";

                  return (
                    <div
                      key={evt.id}
                      onClick={() => goToClubDetails(evt.club_id, evt.id)}
                      className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <img
                        src={firstImage}
                        alt={clubData?.club_name || "Club image"}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h2 className="text-lg font-bold text-gray-800">
                          {clubData?.club_name || "Club name"}
                        </h2>
                        <p className="text-md text-gray-800 font-medium">{evt.name}</p>
                        <p className="text-sm text-gray-600">{eventDate}</p>
                        {locationDisplay && (
                          <p className="text-sm text-gray-500">{locationDisplay}</p>
                        )}
                        <p className="mt-1 text-sm text-purple-600 font-medium">{priceLabel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {events.length > visibleCount && (
                <div className="text-center mt-6">
                  <button
                    onClick={showMore}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Show more
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center mt-6 text-gray-500">
              No events found. Please perform a search.
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

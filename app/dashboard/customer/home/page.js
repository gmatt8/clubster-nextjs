"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomerLayout from "../CustomerLayout";

export default function CustomerHomePage() {
  const router = useRouter();

  // Stato per il campo di ricerca
  const [locationSearch, setLocationSearch] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  // Imposta il raggio predefinito a 10 km (modificabile dall'utente)
  const [radius, setRadius] = useState("10");
  const [dateSearch, setDateSearch] = useState("");

  // Stato per eventi e messaggi di errore
  const [events, setEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [errorMsg, setErrorMsg] = useState("");

  // Ref per il campo input della location
  const locationInputRef = useRef(null);

  // Inizializza Autocomplete di Google Maps sul campo location
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps JS non è ancora caricato");
      return;
    }
    const autocomplete = new window.google.maps.places.Autocomplete(
      locationInputRef.current,
      {
        types: ["geocode"],
        // ComponentRestrictions rimosso per indirizzi globali
        // componentRestrictions: { country: "it" },
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const latVal = place.geometry.location.lat();
      const lngVal = place.geometry.location.lng();
      setLat(latVal);
      setLng(lngVal);
      const formattedAddress = place.formatted_address || "";
      setLocationSearch(formattedAddress);
    });
  }, []);

  // Funzione di ricerca: controlla che tutti i campi siano compilati e invia la query
  async function handleSearch() {
    if (!locationSearch || !dateSearch || !radius) {
      setErrorMsg("Please fill out location, radius and date!");
      return;
    }
    setErrorMsg("");

    try {
      // Costruisce i parametri della query, includendo lat, lng e radius
      const queryParams = new URLSearchParams({
        location: locationSearch,
        date: dateSearch,
        radius,
        lat: lat ? lat.toString() : "",
        lng: lng ? lng.toString() : ""
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

  // Per la paginazione "show more"
  const visibleEvents = events.slice(0, visibleCount);
  function showMore() {
    setVisibleCount((prev) => prev + 8);
  }

  // Naviga alla pagina dei dettagli del club/evento, passando anche l'event_id
  function goToClubDetails(clubId, eventId) {
    router.push(`/dashboard/customer/club-details?club_id=${clubId}&event_id=${eventId}`);
  }

  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        {/* Barra di ricerca */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {/* Campo Location con Autocomplete */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Where</label>
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Location"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-64"
            />
          </div>

          {/* Campo Radius (km) con valore predefinito */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Radius (km)
            </label>
            <input
              type="number"
              placeholder="e.g. 10"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-48"
            />
          </div>

          {/* Campo Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">When</label>
            <input
              type="date"
              value={dateSearch}
              onChange={(e) => setDateSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-48"
            />
          </div>

          {/* Pulsante Search */}
          <div className="mt-2 sm:mt-5">
            <button
              onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Search
            </button>
          </div>

          {/* Ordinamento (placeholder) */}
          <div className="ml-auto">
            <label className="text-sm font-medium text-gray-700 mr-2">
              Sort by:
            </label>
            <select className="border border-gray-300 rounded px-3 py-2">
              <option value="date_asc">Date (asc)</option>
              <option value="date_desc">Date (desc)</option>
              <option value="price_asc">Price (asc)</option>
              <option value="price_desc">Price (desc)</option>
            </select>
          </div>
        </div>

        {/* Mostra errore se i campi non sono compilati */}
        {errorMsg && (
          <div className="text-red-500 mb-4">{errorMsg}</div>
        )}

        {/* Griglia eventi */}
        {events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleEvents.map((evt) => {
                // Ottieni la prima immagine oppure usa un placeholder
                const firstImage =
                  evt.club_images && evt.club_images.length > 0
                    ? evt.club_images[0]
                    : "/placeholder.jpg";
                // Esempio di prezzo
                const priceLabel = evt.min_price
                  ? `From €${evt.min_price}`
                  : "Free";

                return (
                  <div
                    key={evt.id}
                    onClick={() => goToClubDetails(evt.club_id, evt.id)}
                    className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <img
                      src={firstImage}
                      alt={evt.club_name || "Club image"}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-gray-500">
                        {evt.club_name || "Club name"} – {evt.club_location || ""}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {evt.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {evt.start_date
                          ? new Date(evt.start_date).toLocaleDateString()
                          : "No date"}
                      </p>
                      <p className="mt-1 text-sm text-purple-600 font-medium">
                        {priceLabel}
                      </p>
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
    </CustomerLayout>
  );
}

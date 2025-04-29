// app/customer/home/page.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import CustomerLayout from "../CustomerLayout";
import DatePicker from "@components/home/calendar";
import { MapPinIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function CustomerHomePage() {
  const router = useRouter();

  // Stato per la modalità di ricerca: "club" oppure "event"
  const [searchType, setSearchType] = useState("club");

  // Stati per il form di ricerca
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [radius, setRadius] = useState("10"); // default 10 km
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  // Stati per i risultati
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);

  // Stato per mostrare un certo numero di risultati alla volta
  const [visibleCount, setVisibleCount] = useState(8);

  // Messaggi di errore e controllo se è stata fatta una ricerca
  const [errorMsg, setErrorMsg] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Stato per advanced search (campo Radius per ricerca club)
  const [showAdvanced, setShowAdvanced] = useState(false);

  const locationInputRef = useRef(null);

  // Inizializza Google Autocomplete sul campo location
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
    setSearchPerformed(true);
    setErrorMsg("");

    if (searchType === "club") {
      if (!locationSearch.trim()) {
        setErrorMsg("Inserisci una location per cercare club.");
        return;
      }
    } else if (searchType === "event") {
      if (!locationSearch.trim() && !selectedDate) {
        setErrorMsg("Per cercare eventi, inserisci almeno una location o una data.");
        return;
      }
    }

    const queryParams = new URLSearchParams({
      type: searchType,
      location: locationSearch.trim(),
      radius,
      lat: lat ? lat.toString() : "",
      lng: lng ? lng.toString() : "",
    });
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
    }
  }

  function showMore() {
    setVisibleCount((prev) => prev + 8);
  }

  // Navigazione verso i dettagli
  function goToDetails(clubId, eventId, type) {
    if (type === "club") {
      router.push(`/club-details?club_id=${clubId}`);
    } else if (type === "event") {
      router.push(`/club-details?club_id=${clubId}&event_id=${eventId}`);
    }
  }

  // Render dei box per i club
  function renderClubBoxes() {
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
                <p className="text-sm text-gray-600">{club.address}</p>
              </div>
            </div>
          ))}
        </div>
        {clubs.length > visibleCount && (
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
    );
  }

  // Render dei box per gli eventi
  function renderEventBoxes() {
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
            const clubData = evt.clubs || {};
            // Se esiste l'immagine dell'evento, usala, altrimenti usa quella del club oppure il fallback
            const finalImage = evt.image
              ? evt.image
              : (clubData.images && clubData.images.length > 0 ? clubData.images[0] : "/images/no-image.jpeg");
            const eventName = evt.name || "Unnamed Event";
            const clubName = clubData.club_name || "Unknown Club";
            const eventDate = evt.start_date
              ? format(new Date(evt.start_date), "d MMM yyyy", { locale: enGB })
              : "No date";
            let locationDisplay = "";
            if (clubData.city && clubData.country) {
              locationDisplay = `${clubData.city}, ${clubData.country}`;
            } else if (clubData.address) {
              locationDisplay = clubData.address;
            } else {
              locationDisplay = "Unknown location";
            }

            return (
              <div
                key={evt.id}
                onClick={() => goToDetails(evt.club_id, evt.id, "event")}
                className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <img
                  src={finalImage}
                  alt={eventName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-800">{eventName}</h2>
                  <p className="text-md text-gray-800 font-medium">{clubName}</p>
                  <p className="text-sm text-gray-600">{eventDate}</p>
                  <p className="text-sm text-gray-500">{locationDisplay}</p>
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
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Selezione del tipo di ricerca */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSearchType("club")}
            className={`px-4 py-2 rounded ${
              searchType === "club" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Search Club
          </button>
          <button
            onClick={() => setSearchType("event")}
            className={`px-4 py-2 rounded ${
              searchType === "event" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Search Events
          </button>
        </div>

        {/* Form di ricerca */}
        <div className="w-full max-w-3xl flex flex-col items-center">
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
                  <DatePicker
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                  />
                </div>
              </>
            )}
            <button
              onClick={handleSearch}
              className="ml-4 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Pulsante Advanced Search (solo per club) */}
          {searchType === "club" && (
            <div className="mt-2">
              <button
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="text-purple-600 hover:underline"
              >
                {showAdvanced ? "Nascondi opzioni avanzate" : "Advanced Search"}
              </button>
            </div>
          )}
          {showAdvanced && searchType === "club" && (
            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Radius (km):</label>
              <input
                type="number"
                placeholder="es. 10"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-24"
              />
            </div>
          )}
          {errorMsg && <div className="text-red-500 mt-2">{errorMsg}</div>}
        </div>

        {/* Visualizzazione dei risultati */}
        <div className="w-full mt-8">
          {searchType === "club" ? renderClubBoxes() : renderEventBoxes()}
        </div>
      </div>
    </CustomerLayout>
  );
}

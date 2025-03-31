"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomerLayout from "../CustomerLayout";

export default function CustomerHomePage() {
  const router = useRouter();

  // Campi di ricerca
  const [locationSearch, setLocationSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");

  // Stato per gli eventi (inizialmente vuoto)
  const [events, setEvents] = useState([]);
  // Numero di eventi da mostrare (per la paginazione semplice)
  const [visibleCount, setVisibleCount] = useState(8);

  // Messaggio di errore se i campi non sono compilati
  const [errorMsg, setErrorMsg] = useState("");

  // Funzione di ricerca
  async function handleSearch() {
    // Verifica che entrambi i campi siano compilati
    if (!locationSearch || !dateSearch) {
      setErrorMsg("Please fill out both the location and the date!");
      return;
    }
    setErrorMsg("");

    try {
      // Chiamata all'endpoint dedicato per la ricerca
      const query = `/api/search?location=${encodeURIComponent(
        locationSearch
      )}&date=${encodeURIComponent(dateSearch)}`;
      const res = await fetch(query);
      if (!res.ok) throw new Error("Errore nel caricamento eventi filtrati");
      const { events: filteredData } = await res.json();
      setEvents(filteredData || []);
      setVisibleCount(8); // reset della visualizzazione
    } catch (err) {
      console.error(err);
    }
  }

  // Subset di eventi da mostrare (paginazione "show more")
  const visibleEvents = events.slice(0, visibleCount);

  // Funzione per caricare altri 8 eventi
  function showMore() {
    setVisibleCount((prev) => prev + 8);
  }

  // Naviga alla pagina dei dettagli del club/evento
  function goToClubDetails(clubId) {
    router.push(`/dashboard/customer/club-details?club_id=${clubId}`);
  }

  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        {/* Barra di ricerca */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {/* Campo Where */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Where
            </label>
            <input
              type="text"
              placeholder="Location"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-64"
            />
          </div>

          {/* Campo When */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              When
            </label>
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

          {/* Sort by (placeholder) */}
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

        {/* Mostra l'errore se i campi non sono compilati */}
        {errorMsg && (
          <div className="text-red-500 mb-4">{errorMsg}</div>
        )}

        {/* Griglia eventi */}
        {events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleEvents.map((evt) => {
                // Ottieni la prima immagine del club, oppure usa una placeholder
                const firstImage =
                  evt.club_images && evt.club_images.length > 0
                    ? evt.club_images[0]
                    : "/placeholder.jpg";

                // Esempio di prezzo (adatta alla tua logica)
                const priceLabel = evt.min_price
                  ? `From €${evt.min_price}`
                  : "Free";

                return (
                  <div
                    key={evt.id}
                    onClick={() => goToClubDetails(evt.club_id)}
                    className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  >
                    {/* Immagine del club */}
                    <img
                      src={firstImage}
                      alt={evt.club_name || "Club image"}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      {/* Nome club e location */}
                      <p className="text-sm text-gray-500">
                        {evt.club_name || "Club name"} –{" "}
                        {evt.club_location || ""}
                      </p>
                      {/* Nome evento */}
                      <h3 className="text-lg font-semibold text-gray-800">
                        {evt.name}
                      </h3>
                      {/* Data evento */}
                      <p className="text-sm text-gray-600">
                        {evt.start_date
                          ? new Date(evt.start_date).toLocaleDateString()
                          : "No date"}
                      </p>
                      {/* Prezzo */}
                      <p className="mt-1 text-sm text-purple-600 font-medium">
                        {priceLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pulsante "Show more" se ci sono più eventi di quelli visibili */}
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
          // Se nessun evento viene mostrato
          <div className="text-center mt-6 text-gray-500">
            No events found. Please perform a search.
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

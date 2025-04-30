// apps/web-manager/app/settings/general/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserSupabase } from "@lib/supabase-browser";
import ManagerLayout from "../../ManagerLayout";
import PhotosManager from "@/components/settings/PhotosManager";
import ManagerSettingsHeader from "@/components/settings/SettingsHeader";
import FAQManager from "@/components/settings/FAQManager";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function ManagerSettingsGeneralPage() {
  const supabase = createBrowserSupabase();

  const [managerId, setManagerId] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [images, setImages] = useState([]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [outdoorArea, setOutdoorArea] = useState("not available");
  const [parking, setParking] = useState("not available");
  const [price, setPrice] = useState("$");
  const [smoking, setSmoking] = useState("not allowed");
  const [coatCheck, setCoatCheck] = useState("not available");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const addressInputRef = useRef(null);

  useEffect(() => {
    async function fetchClubData() {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError("Errore nel recupero utente");
        setLoading(false);
        return;
      }
      if (!user) {
        setError("Nessun utente loggato");
        setLoading(false);
        return;
      }

      setManagerId(user.id);

      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select("*")
        .eq("manager_id", user.id)
        .maybeSingle();

      if (clubError) {
        setError("Errore nel recupero dati del club");
        setLoading(false);
        return;
      }

      if (clubData) {
        setClubId(clubData.id);
        setName(clubData.name || "");
        setAddress(clubData.address || "");
        setPhoneNumber(clubData.phone_number || "");
        setDescription(clubData.description || "");
        setCapacity(clubData.capacity ?? 0);
        setOutdoorArea(clubData.outdoor_area || "not available");
        setParking(clubData.parking || "not available");
        setPrice(clubData.price || "$");
        setSmoking(clubData.smoking || "not allowed");
        setCoatCheck(clubData.coat_check || "not available");
        setImages(clubData.images || []);
        if (clubData.lat) setLat(clubData.lat);
        if (clubData.lng) setLng(clubData.lng);
      }

      setLoading(false);
    }

    fetchClubData();
  }, [supabase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    ) {
      console.warn("Google Maps JS non è ancora caricato");
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        types: ["geocode"],
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
      setAddress(formattedAddress);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    if (!managerId) {
      setError("Impossibile determinare il manager ID");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/club", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        manager_id: managerId,
        name,
        address,
        phone_number: phoneNumber,
        description,
        capacity: Number(capacity),
        outdoor_area: outdoorArea,
        parking,
        price,
        smoking,
        coat_check: coatCheck,
        lat,
        lng,
        images,
      }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || "Errore sconosciuto durante l'aggiornamento del club");
      return;
    }

    setMessage("Dati aggiornati con successo!");
  }

  return (
    <ManagerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <ManagerSettingsHeader title="General" backHref="/settings" />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            {/* Sezione "Informations" */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Informations
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Club Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Address
                  </label>
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Sezione "Details" */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Details
              </h2>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full border border-gray-300 rounded px-3 py-2 text-sm h-24"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Outdoor Area
                  </label>
                  <select
                    value={outdoorArea}
                    onChange={(e) => setOutdoorArea(e.target.value)}
                    className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="not available">Not available</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Parking
                  </label>
                  <select
                    value={parking}
                    onChange={(e) => setParking(e.target.value)}
                    className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="not available">Not available</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Price
                  </label>
                  <select
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="$">$</option>
                    <option value="$$">$$</option>
                    <option value="$$$">$$$</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Smoking
                  </label>
                  <select
                    value={smoking}
                    onChange={(e) => setSmoking(e.target.value)}
                    className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="allowed">Allowed</option>
                    <option value="not allowed">Not allowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Coat Check
                  </label>
                  <select
                    value={coatCheck}
                    onChange={(e) => setCoatCheck(e.target.value)}
                    className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="not available">Not available</option>
                  </select>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Photo
              </h2>
              {clubId && managerId && (
                <PhotosManager
                  clubId={clubId}
                  managerId={managerId}
                  currentImages={images}
                  onUpdate={(newImages) => setImages(newImages)}
                />
              )}
            </div>

            {clubId && <FAQManager clubId={clubId} />}
          </form>
        )}
      </div>
    </ManagerLayout>
  );
}

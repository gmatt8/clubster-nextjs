"use client";

import { useEffect, useState, useRef } from 'react';
import { createBrowserSupabase } from "@/lib/supabase-browser";
import ManagerLayout from '../../ManagerLayout';
import UploadImages from '@/components/manager/settings/UploadImages';

export default function ManagerSettingsGeneralPage() {
  const supabase = createBrowserSupabase();

  const [managerId, setManagerId] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [images, setImages] = useState([]);

  // Campi del club
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [outdoorArea, setOutdoorArea] = useState('not available');
  const [parking, setParking] = useState('not available');
  const [price, setPrice] = useState('$');
  const [smoking, setSmoking] = useState('not allowed');
  const [coatCheck, setCoatCheck] = useState('not available');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Ref per Autocomplete
  const addressInputRef = useRef(null);

  // Al mount, carichiamo i dati del club
  useEffect(() => {
    async function fetchClubData() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setError('Errore nel recupero utente');
        return;
      }
      if (!user) {
        setError('Nessun utente loggato');
        return;
      }

      setManagerId(user.id);

      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('manager_id', user.id)
        .maybeSingle();

      if (clubError) {
        setError('Errore nel recupero dati del club');
        return;
      }

      if (clubData) {
        setClubId(clubData.id);
        setName(clubData.name || '');
        setAddress(clubData.address || '');
        setPhoneNumber(clubData.phone_number || '');
        setDescription(clubData.description || '');
        setCapacity(clubData.capacity ?? 0);
        setOutdoorArea(clubData.outdoor_area || 'not available');
        setParking(clubData.parking || 'not available');
        setPrice(clubData.price || '$');
        setSmoking(clubData.smoking || 'not allowed');
        setCoatCheck(clubData.coat_check || 'not available');
        setImages(clubData.images || []);

        // Se in DB hai già lat/lng
        if (clubData.lat) setLat(clubData.lat);
        if (clubData.lng) setLng(clubData.lng);
      }
    }

    fetchClubData();
  }, [supabase]);

  // Inizializza Autocomplete di Google Maps
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps JS non è ancora caricato");
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      types: ["geocode"],
    });

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

  // Salvataggio dei campi
  async function handleSave(e) {
    e.preventDefault();
    if (!managerId) {
      setError('Impossibile determinare il manager ID');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const response = await fetch('/api/club', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
        lng
      }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || 'Errore sconosciuto durante l\'aggiornamento del club');
      return;
    }

    setMessage('Dati aggiornati con successo!');
  }

  // Funzione di cancellazione immagine
  async function deleteImage(imageUrl) {
    try {
      if (!clubId || !managerId) return;

      // 1) Trova il path nel bucket
      const urlObj = new URL(imageUrl);
      let path = urlObj.pathname.replace('/storage/v1/object/public/club-images/', '');

      // 2) Rimuovi dal bucket
      const { error: removeError } = await supabase
        .storage
        .from('club-images')
        .remove([path]);
      if (removeError) {
        console.error('Errore rimozione file', removeError);
      }

      // 3) Rimuovi l’URL dall’array images
      const updatedImages = images.filter((img) => img !== imageUrl);

      // 4) Aggiorna DB
      const response = await fetch('/api/club', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manager_id: managerId,
          images: updatedImages
        })
      });

      if (!response.ok) {
        const result = await response.json();
        console.error('Errore aggiornando le immagini', result.error);
        return;
      }

      // 5) Aggiorna stato
      setImages(updatedImages);
    } catch (err) {
      console.error('Errore nella cancellazione immagine:', err);
    }
  }

  return (
    <ManagerLayout>
      {/* Header con titolo e pulsante "Save" */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings &gt; General</h1>
        <button
          onClick={handleSave}
          disabled={loading || !managerId}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Sezione "Informations" */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Informations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Club Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Address</label>
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
            <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
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
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Details</h2>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full border border-gray-300 rounded px-3 py-2 text-sm h-24"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Outdoor Area</label>
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
              <label className="block text-sm text-gray-600 mb-1">Parking</label>
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
              <label className="block text-sm text-gray-600 mb-1">Price</label>
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
              <label className="block text-sm text-gray-600 mb-1">Smoking</label>
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
              <label className="block text-sm text-gray-600 mb-1">Coat Check</label>
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

        {/* Errori e messaggi */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}

        {/* Sezione "Photos" */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Photos</h2>

          {/* Mostriamo UploadImages solo se abbiamo clubId e managerId */}
          {clubId && managerId && (
            <UploadImages
              clubId={clubId}
              currentImages={images}
              managerId={managerId}
              onUploadComplete={(newImages) => setImages(newImages)}
            />
          )}

          {images && images.length > 0 && (
            <div className="mt-4">
              {/* Prima immagine grande (cover) */}
              <div className="relative mb-4">
                <img
                  src={images[0]}
                  alt="Cover"
                  className="w-full h-64 object-cover rounded"
                />
                <button
                  onClick={async () => {
                    await deleteImage(images[0]);
                  }}
                  className="absolute top-2 right-2 bg-black bg-opacity-60
                             text-white rounded-full w-7 h-7 flex items-center
                             justify-center text-sm"
                  title="Delete image"
                >
                  &times;
                </button>
              </div>

              {/* Le altre immagini in fila */}
              <div className="flex gap-2">
                {images.slice(1).map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24">
                    <img
                      src={url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      onClick={async () => {
                        await deleteImage(url);
                      }}
                      className="absolute top-1 right-1 bg-black bg-opacity-60
                                 text-white rounded-full w-5 h-5 flex items-center
                                 justify-center text-xs"
                      title="Delete image"
                    >
                      &times;
                    </button>
                  </div>
                ))}

                <div
                  onClick={() => {
                    // Se vuoi aprire l’input file di UploadImages, puoi
                    // gestirlo qui o usare il pulsante "Upload Images" nel componente.
                  }}
                  className="flex items-center justify-center w-24 h-24 border-2 border-dashed
                             border-gray-300 rounded text-gray-400 text-sm cursor-pointer"
                >
                  drag image here
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}

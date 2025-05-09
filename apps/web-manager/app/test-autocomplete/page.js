"use client";

import { useEffect, useRef, useState } from "react";

export default function TestAutocompletePage() {
  const inputRef = useRef(null);
  const [coords, setCoords] = useState({ lat: null, lng: null });

  useEffect(() => {
    if (!window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setCoords({ lat, lng });
    });
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Google Places Autocomplete Test</h1>
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter a location"
        className="border border-gray-300 rounded px-3 py-2 w-full"
      />
      <div className="mt-4 text-sm text-gray-700">
        <p>Latitude: {coords.lat}</p>
        <p>Longitude: {coords.lng}</p>
      </div>
    </div>
  );
}

// apps/web-customer/components/club-details/mapsection.js
"use client";
import { useEffect, useRef, useState } from "react";

export default function MapSection({ club }) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { address = "Unknown location", lat, lng } = club || {};
  const hasCoords = lat && lng;

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.warn("Google Maps API not available");
      setErrorMsg("Map could not be loaded.");
      return;
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center: hasCoords ? { lat, lng } : { lat: 44.2778, lng: 9.3883 },
      zoom: 14,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
    });

    const placeMarker = (location) => {
      new window.google.maps.Marker({
        map,
        position: location,
        title: address,
        icon: {
          url: "/images/pin.png",
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });
    };

    if (hasCoords) {
      placeMarker({ lat, lng });
      setMapLoaded(true);
    } else {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
          placeMarker(location);
          setMapLoaded(true);
        } else {
          console.warn("Geocoding failed:", status);
          setErrorMsg("Location not available on map.");
        }
      });
    }
  }, [address, lat, lng, hasCoords]);

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Find us here</h2>
      <div className="relative w-full h-64 rounded overflow-hidden bg-gray-100">
        <div ref={mapRef} className="absolute inset-0 z-0" />
        {!mapLoaded && !errorMsg && (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            Loading map...
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center justify-center h-full text-sm text-red-500">
            {errorMsg}
          </div>
        )}
      </div>
      {address && (
        <p className="text-sm text-gray-600 mt-2 italic">Address: {address}</p>
      )}
    </section>
  );
}

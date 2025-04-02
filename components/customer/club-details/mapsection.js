"use client";
import { useEffect, useRef } from "react";

export default function MapSection({ club }) {
  const { address = "Unknown location", lat = 44.2778, lng = 9.3883 } = club || {};
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 14,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Prova a usare un'icona personalizzata, se esiste
      let markerOptions = {
        position: { lat, lng },
        map,
        title: address,
      };

      const customIconUrl = "/images/home-icon.png";
      // Controlla se l'immagine esiste caricandola
      const img = new Image();
      img.src = customIconUrl;
      img.onload = () => {
        markerOptions.icon = {
          url: customIconUrl,
          scaledSize: new window.google.maps.Size(40, 40),
        };
        new window.google.maps.Marker(markerOptions);
      };
      img.onerror = () => {
        console.warn("Custom icon not found, using default marker.");
        new window.google.maps.Marker(markerOptions);
      };

      // Se lat e lng non sono definiti, usa geocoder
      if (!lat || !lng) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            map.setCenter(location);
            markerOptions.position = location;
            new window.google.maps.Marker(markerOptions);
          } else {
            console.warn("Geocode was not successful for the following reason:", status);
          }
        });
      }
    } else {
      console.warn("Google Maps JavaScript API is not loaded yet.");
    }
  }, [address, lat, lng]);

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Find us here</h2>
      <div ref={mapRef} className="w-full h-64 bg-gray-200 rounded" />
    </section>
  );
}

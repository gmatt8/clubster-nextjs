// apps/web-customer/components/home/popularLocation.js
"use client";

import React from "react";

const popularDestinations = [
  {
    name: "Barcelona",
    country: "Spain",
    lat: 41.3879,
    lng: 2.16992,
    address: "Barcelona, Spain",
    image: "/images/barcelona.jpg",
  },
  {
    name: "Milan",
    country: "Italy",
    lat: 45.4642,
    lng: 9.19,
    address: "Milan, Italy",
    image: "/images/milan.jpg",
  },
  {
    name: "Munich",
    country: "Germany",
    lat: 48.1351,
    lng: 11.582,
    address: "Munich, Germany",
    image: "/images/munich.jpg",
  },
  {
    name: "Zurich",
    country: "Switzerland",
    lat: 47.3769,
    lng: 8.5417,
    address: "Zurich, Switzerland",
    image: "/images/zurich.jpg",
  },
  {
    name: "London",
    country: "United Kingdom",
    lat: 51.5074,
    lng: -0.1278,
    address: "London, United Kingdom",
    image: "/images/london.jpg",
  },
];

export default function PopularLocation({ onSelect, selectedAddress }) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4">
        {popularDestinations.map((dest) => (
          <div
            key={dest.name}
            onClick={() => onSelect(dest)}
            className={`relative min-w-[180px] h-40 rounded-xl overflow-hidden shadow-md cursor-pointer transform hover:scale-[1.03] transition ${
              selectedAddress === dest.address ? "ring-2 ring-purple-600" : ""
            }`}
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-3 text-white">
              <p className="font-semibold text-sm">{dest.name}</p>
              <p className="text-xs text-gray-200">{dest.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

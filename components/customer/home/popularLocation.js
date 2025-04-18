// /components/customer/home/popularLocation.js

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
    lng: 9.1900,
    address: "Milan, Italy",
    image: "/images/milan.jpg",
  },
  {
    name: "Munich",
    country: "Germany",
    lat: 48.1351,
    lng: 11.5820,
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
      <div className="flex space-x-4">
        {popularDestinations.map((dest) => (
          <div
            key={dest.name}
            onClick={() => onSelect(dest)}
            className={`min-w-[180px] bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
              selectedAddress === dest.address
                ? "border-2 border-purple-600"
                : ""
            }`}
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-32 object-cover rounded-t-lg"
            />
            <div className="p-3 text-center">
              <p className="font-semibold text-sm text-gray-800">{dest.name}</p>
              <p className="text-xs text-gray-500">{dest.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

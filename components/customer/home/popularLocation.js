// components/customer/home/popularLocation.js

import React from "react";

const popularDestinations = [
  {
    name: "Barcelona",
    country: "Spain",
    lat: 41.3879,
    lng: 2.16992,
    address: "Barcellona, Spain",
    image: "/images/city.jpg",
  },
  {
    name: "Lisbona",
    country: "Portugal",
    lat: 38.7223,
    lng: -9.1393,
    address: "Lisbona, Portugal",
    image: "/images/city.jpg",
  },
  {
    name: "Madrid",
    country: "Spain",
    lat: 40.4168,
    lng: -3.7038,
    address: "Madrid, Spain",
    image: "/images/city.jpg",
  },
  {
    name: "Torino",
    country: "Italy",
    lat: 45.0703,
    lng: 7.6869,
    address: "Torino, Italy",
    image: "/images/city.jpg",
  },
  {
    name: "Valencia",
    country: "Spain",
    lat: 39.4699,
    lng: -0.3763,
    address: "Valencia, Spain",
    image: "/images/city.jpg",
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

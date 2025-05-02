// apps/web-customer/components/home/popularClubs.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../common/LoadingSpinner";

const CLUB_IDS = [
  "be8dbea9-83b8-4e91-968f-2feb465ca7de",
  "55af6673-520e-4b24-b552-dfed62874c2b",
];

export default function PopularClubs() {
  const router = useRouter();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClubDetails() {
      try {
        const results = await Promise.all(
          CLUB_IDS.map(async (id) => {
            const res = await fetch(`/api/club?club_id=${id}`);
            const data = await res.json();
            if (res.ok && data?.id) return data;
            return null;
          })
        );
        setClubs(results.filter(Boolean));
      } catch (error) {
        console.error("Error loading clubs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClubDetails();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (clubs.length === 0) return <div className="text-center">No clubs available</div>;

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4">
        {clubs.map((club) => (
          <div
            key={club.id}
            onClick={() => router.push(`/club-details?club_id=${club.id}`)}
            className="relative w-[220px] h-40 rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg hover:scale-[1.03] transition-transform duration-200 cursor-pointer"
          >
            <img
              src={club.images?.[0] || "/images/no-image.jpeg"}
              alt={club.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex flex-col justify-end text-white">
              <p className="font-semibold text-sm truncate">{club.name}</p>
              <p className="text-xs text-gray-300 truncate">{club.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

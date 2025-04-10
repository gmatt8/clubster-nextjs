// components/customer/home/popularClubs.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PopularClubs() {
  const router = useRouter();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPopularClubs() {
      try {
        const res = await fetch("/api/popular");
        if (!res.ok) {
          throw new Error("Errore nel recupero dei dati");
        }
        const data = await res.json();
        setClubs(data.popularClubs || []);
      } catch (err) {
        console.error("Errore nel recuperare i club popolari:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPopularClubs();
  }, []);

  if (loading) {
    return <div className="text-center">Loading popular clubs...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Errore nel caricamento dei club popolari.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex space-x-4">
        {clubs.map((club) => (
          <div
            key={club.id}
            onClick={() =>
              router.push(`/dashboard/customer/club-details?club_id=${club.id}`)
            }
            className="w-[237px] bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          >
            <img
              src={
                club.images && club.images.length > 0
                  ? club.images[0]
                  : "/images/no-image.jpeg"
              }
              alt={club.name}
              className="w-full h-32 object-cover rounded-t-lg"
            />
            <div className="p-3 text-center">
              <p className="font-semibold text-sm text-gray-800">{club.name}</p>
              <p className="text-xs text-gray-500">{club.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

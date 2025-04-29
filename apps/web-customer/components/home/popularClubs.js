// apps/web-customer/components/home/popularClubs.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
            console.log("➡️ Fetch Club:", { id, status: res.status, ok: res.ok, data });
            if (res.ok && data?.id) {
              return data;
            } else {
              console.warn("⚠️ Club NON valido o errore:", { id, data });
              return null;
            }
          })
        );
        console.log("✅ Results di tutti i club:", results);

        const validClubs = results.filter(Boolean);
        console.log("✅ Clubs filtrati e validi:", validClubs);

        setClubs(validClubs);
      } catch (error) {
        console.error("Errore caricando club statici:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClubDetails();
  }, []);

  if (loading) {
    return <div className="text-center">Loading popular clubs...</div>;
  }

  if (clubs.length === 0) {
    return <div className="text-center">Nessun club disponibile</div>;
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex space-x-4">
        {clubs.map((club) => (
          <div
            key={club.id}
            onClick={() => router.push(`/club-details?club_id=${club.id}`)}
            className="w-[220px] bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          >
            <img
              src={club.images?.[0] || "/images/no-image.jpeg"}
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

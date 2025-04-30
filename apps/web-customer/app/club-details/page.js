// apps/web-customer/app/club-details/page.js
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import CustomerLayout from "../CustomerLayout";

// Import dei componenti delle varie sezioni
import ClubInfo from "@components/club-details/clubinfo";
import NextEvents from "@components/club-details/nextevents";
import Reviews from "@components/club-details/reviews";
import MapSection from "@components/club-details/mapsection";
import FAQ from "@components/club-details/faq";

export default function ClubDetailsPage() {
  const searchParams = useSearchParams();
  const clubId = searchParams.get("club_id");
  const selectedEventId = searchParams.get("event_id"); // evento selezionato dalla ricerca

  const [clubData, setClubData] = useState(null);

  useEffect(() => {
    if (!clubId) return;

    async function fetchClub() {
      try {
        const res = await fetch(`/api/club?club_id=${clubId}`);
        if (!res.ok) throw new Error("Errore nel caricamento del club");
        const data = await res.json();
        setClubData(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchClub();
  }, [clubId]);

  if (!clubData) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-[300px]">
          <svg
            className="animate-spin h-8 w-8 text-purple-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        </div>
      </CustomerLayout>
    );
  }
  

  if (!clubData) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-xl mx-auto">
          <p>Loading club details...</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        {/* Sezione 1: Club Info */}
        <ClubInfo club={clubData} />

        <hr className="border-t border-gray-300 my-8" />

        {/* Sezione 2: Next Events */}
        <NextEvents clubId={clubId} selectedEventId={selectedEventId} />

        <hr className="border-t border-gray-300 my-8" />

        {/* Sezione 3: Reviews */}
        <Reviews clubId={clubId} />

        <hr className="border-t border-gray-300 my-8" />

        {/* Sezione 4: Map Section */}
        <MapSection club={clubData} />

        <hr className="border-t border-gray-300 my-8" />

        {/* Sezione 5: FAQ */}
<FAQ clubId={clubId} />

      </div>
    </CustomerLayout>
  );
}

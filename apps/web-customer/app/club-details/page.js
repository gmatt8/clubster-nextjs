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

  if (!clubId) {
    return (
      <CustomerLayout>
        <div className="px-6 py-8 max-w-screen-xl mx-auto">
          <p>Nessun club selezionato.</p>
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

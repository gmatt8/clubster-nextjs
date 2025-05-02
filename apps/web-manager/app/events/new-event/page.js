// apps/web-manager/app/events/new-event/page.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabase } from "@lib/supabase-browser";
import { useRouter } from "next/navigation";
import ManagerLayout from "../../ManagerLayout";
import EventStepper from "@/components/events/EventStepper";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { AlertMessage } from "@/components/common/AlertMessage";
import EventHeader from "@/components/events/EventHeader";

import StepDescription from "@/components/events/StepDescription";
import StepDate from "@/components/events/StepDate";
import StepTickets from "@/components/events/StepTickets";

export default function NewEventPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [managerId, setManagerId] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [clubStripeStatus, setClubStripeStatus] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [musicGenres, setMusicGenres] = useState([]);
  const [ageRestriction, setAgeRestriction] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [eventImage, setEventImage] = useState("");
  const [ticketCategories, setTicketCategories] = useState([
    { name: "Normal", price: 0, available_tickets: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchManager() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          setError("Error fetching user");
          return;
        }
        setManagerId(user.id);

        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select("id, stripe_account_id, stripe_status")
          .eq("manager_id", user.id)
          .single();

        if (clubError || !clubData) {
          setError("Unable to retrieve your club");
          return;
        }
        setClubId(clubData.id);
        setClubStripeStatus(clubData.stripe_status);
      } catch (err) {
        console.error(err);
        setError("Unexpected error fetching manager or club");
      }
    }
    fetchManager();
  }, [supabase]);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setMessage("");

    const startDateTimeStr = `${startDate}T${startTime}:00`;
    const endDateTimeStr = `${endDate}T${endTime}:00`;
    const startDateISO = new Date(startDateTimeStr).toISOString();
    const endDateISO = new Date(endDateTimeStr).toISOString();

    try {
      const eventRes = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          club_id: clubId,
          name,
          description,
          start_date: startDateISO,
          end_date: endDateISO,
          music_genres: musicGenres,
          age_restriction: ageRestriction,
          dress_code: dressCode,
          image: eventImage,
        }),
      });

      if (!eventRes.ok) {
        const errData = await eventRes.json();
        throw new Error(errData.error || "Error creating event");
      }

      const newEvent = await eventRes.json();
      const eventId = newEvent[0].id;

      for (let cat of ticketCategories) {
        const ticketRes = await fetch("/api/ticket-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            event_id: eventId,
            name: cat.name,
            price: cat.price,
            available_tickets: cat.available_tickets,
          }),
        });

        if (!ticketRes.ok) {
          const errTicket = await ticketRes.json();
          throw new Error(errTicket.error || "Error creating ticket category");
        }
      }

      setMessage("Event created successfully!");
      setTimeout(() => router.push("/events"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (clubStripeStatus === null) {
    return (
      <ManagerLayout>
        <LoadingSpinner />
      </ManagerLayout>
    );
  }

  if (clubStripeStatus !== "active") {
    return (
      <ManagerLayout>
        <div className="px-6 py-8 max-w-screen-md mx-auto text-center">
          <h1 className="text-xl font-bold mb-4">Create New Event</h1>
          <p className="text-gray-700">
            To create a new event, you must first connect your Stripe account.
          </p>
          <button
            onClick={() => router.push("/payments")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Connect Stripe
          </button>
        </div>
      </ManagerLayout>
    );
  }

  const stepProps = {
    name, setName,
    description, setDescription,
    startDate, setStartDate,
    startTime, setStartTime,
    endDate, setEndDate,
    endTime, setEndTime,
    musicGenres, setMusicGenres,
    ageRestriction, setAgeRestriction,
    dressCode, setDressCode,
    eventImage, setEventImage,
    predefinedGenres: ["Techno", "Pop", "Rock", "Jazz", "Hip-Hop", "EDM", "Classical", "Reggae"],
    ticketCategories, setTicketCategories,
    managerId
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepDescription {...stepProps} />;
      case 2: return <StepDate {...stepProps} />;
      case 3: return <StepTickets {...stepProps} />;
    }
  };

  function canProceedToNextStep() {
    if (currentStep === 1) {
      return name.trim() && musicGenres.length > 0;
    }
    if (currentStep === 2) {
      return startDate && startTime && endDate && endTime;
    }
    return true;
  }

  return (
    <ManagerLayout>
      {loading && <LoadingOverlay />}
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <EventHeader title="Create New Event" />
        <EventStepper currentStep={currentStep} />

        {error && <AlertMessage type="error">{error}</AlertMessage>}
        {message && <AlertMessage type="success">{message}</AlertMessage>}

        {renderStep()}

        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 text-sm bg-gray-200 rounded"
            >Back</button>
          )}
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (canProceedToNextStep()) {
                  setError("");
                  setCurrentStep(currentStep + 1);
                } else {
                  setError("Please complete all required fields to continue.");
                }
              }}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >Next</button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >Create Event</button>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}
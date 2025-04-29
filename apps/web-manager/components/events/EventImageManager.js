// apps/web-manager/components/events/EventImageManager.js
"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import UploadEventImage from "./UploadEventImage";

export default function EventImageManager({ eventId, managerId, currentImage, onUpdate }) {
  const supabase = createClientComponentClient();
  const [image, setImage] = useState(currentImage || null);
  const [savingError, setSavingError] = useState("");

  const deleteImage = async () => {
    if (!image) return;
    try {
      const urlObj = new URL(image);
      let path = urlObj.pathname.replace('/storage/v1/object/public/event-images/', '');
      
      const { error: removeError } = await supabase
        .storage
        .from('event-images')
        .remove([path]);
      if (removeError) {
        console.error("Errore nella rimozione del file", removeError);
      }
      setImage(null);
      onUpdate(null);
    } catch (err) {
      console.error("Errore nella cancellazione dell'immagine:", err);
    }
  };

  const handleSave = async () => {
    try {
      setSavingError("");
      // Aggiorna la foto dell'evento nel database tramite API
      const response = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          image,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Errore aggiornamento immagine evento");
      }
      alert("Immagine aggiornata con successo!");
      onUpdate(image);
    } catch (err) {
      setSavingError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {image ? (
        <div className="relative group w-64 h-64">
          <img src={image} alt="Event image" className="w-full h-full object-cover rounded" />
          <button
            onClick={deleteImage}
            className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
            title="Delete image"
          >
            &times;
          </button>
        </div>
      ) : (
        <UploadEventImage
          eventId={eventId}
          currentImage={image}
          managerId={managerId}
          onUploadComplete={(uploadedUrl) => {
            setImage(uploadedUrl);
            onUpdate(uploadedUrl);
          }}
        />
      )}
      <button onClick={handleSave} className="bg-purple-600 text-white px-4 py-2 rounded">
        Save Changes
      </button>
      {savingError && <p className="text-red-500">{savingError}</p>}
    </div>
  );
}

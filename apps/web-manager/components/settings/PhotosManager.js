// components/settings/PhotosManager.js
"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import UploadImages from "./UploadImages";

export default function PhotosManager({ clubId, managerId, currentImages, onUpdate }) {
  // Per la limitazione a 1 foto, usiamo solo il primo elemento
  const [image, setImage] = useState(
    currentImages && currentImages.length > 0 ? currentImages[0] : null
  );
  const supabase = createClientComponentClient();
  const [savingError, setSavingError] = useState("");

  // Funzione per cancellare l'immagine
  const deleteImage = async () => {
    if (!image) return;
    try {
      const urlObj = new URL(image);
      let path = urlObj.pathname.replace('/storage/v1/object/public/club-images/', '');
      
      const { error: removeError } = await supabase
        .storage
        .from('club-images')
        .remove([path]);
      if (removeError) {
        console.error("Errore nella rimozione del file", removeError);
      }
      setImage(null);
      onUpdate([]);
    } catch (err) {
      console.error("Errore nella cancellazione dell'immagine:", err);
    }
  };

  // Funzione per salvare (aggiornare) l'immagine nel DB
  const handleSave = async () => {
    try {
      setSavingError("");
      const updatedImages = image ? [image] : [];
      const response = await fetch("/api/club", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manager_id: managerId,
          images: updatedImages,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Errore aggiornamento immagine");
      }
      alert("Immagine aggiornata con successo!");
      onUpdate(updatedImages);
    } catch (err) {
      setSavingError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {image ? (
        <div className="relative group w-64 h-64">
          <img
            src={image}
            alt="Club image"
            className="w-full h-full object-cover rounded"
          />
          <button
            onClick={deleteImage}
            className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
            title="Delete image"
          >
            &times;
          </button>
        </div>
      ) : (
        <UploadImages
          clubId={clubId}
          currentImage={image}
          managerId={managerId}
          onUploadComplete={(uploaded) => {
            // uploaded è un array con il nuovo URL, prendiamo solo il primo
            if (uploaded && uploaded.length > 0) {
              setImage(uploaded[0]);
              onUpdate([uploaded[0]]);
            }
          }}
        />
      )}
      <button
        onClick={handleSave}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
      {savingError && <p className="text-red-500">{savingError}</p>}
    </div>
  );
}

// components/manager/settings/PhotosManager.js
"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import SortablePhoto from "./SortablePhoto";
import UploadImages from "./UploadImages";

export default function PhotosManager({ clubId, managerId, currentImages, onUpdate }) {
  const supabase = createClientComponentClient();
  const [images, setImages] = useState(currentImages || []);
  const [savingError, setSavingError] = useState("");

  // Gestione del drag & drop per il riordino delle immagini
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prevImages) => {
      const oldIndex = prevImages.indexOf(active.id);
      const newIndex = prevImages.indexOf(over.id);
      return arrayMove(prevImages, oldIndex, newIndex);
    });
  };

  // Funzione per la cancellazione di una immagine
  const deleteImage = async (imageUrl) => {
    try {
      // Costruiamo il path relativo per Supabase Storage
      const urlObj = new URL(imageUrl);
      let path = urlObj.pathname.replace('/storage/v1/object/public/club-images/', '');
      
      // Rimuoviamo il file dal bucket
      const { error: removeError } = await supabase
        .storage
        .from('club-images')
        .remove([path]);
      if (removeError) {
        console.error("Errore rimozione file", removeError);
      }
      
      // Aggiorniamo l'array localmente
      const updatedImages = images.filter((img) => img !== imageUrl);
      setImages(updatedImages);
      // Comunichiamo il cambiamento al parent
      onUpdate(updatedImages);
    } catch (err) {
      console.error("Errore nella cancellazione immagine:", err);
    }
  };

  // Funzione per il salvataggio dell'ordine delle immagini nel DB
  const handleSaveOrder = async () => {
    try {
      setSavingError("");
      const response = await fetch("/api/club", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manager_id: managerId,
          images
        })
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error updating images");
      }
      alert("Immagini aggiornate con successo!");
      onUpdate(images);
    } catch (err) {
      setSavingError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Photos</h2>
      
      {/* Componente per l'upload delle immagini */}
      <UploadImages
        clubId={clubId}
        currentImages={images}
        managerId={managerId}
        onUploadComplete={(newImages) => setImages(newImages)}
      />
      
      {/* Drag & Drop per il riordino delle immagini */}
      {images && images.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4 mt-4">
              {images.map((url) => (
                <SortablePhoto key={url} id={url} url={url} onRemove={() => deleteImage(url)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <button
        onClick={handleSaveOrder}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Save Order
      </button>

      {savingError && <p className="text-red-500">{savingError}</p>}
    </div>
  );
}

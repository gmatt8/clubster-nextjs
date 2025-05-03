// components/settings/PhotosManager.js
"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import UploadImages from "./UploadImages";
import SortablePhoto from "./SortablePhoto";

export default function PhotosManager({ clubId, managerId, currentImages, onUpdate }) {
  const supabase = createClientComponentClient();
  const [images, setImages] = useState(currentImages || []);
  const [savingError, setSavingError] = useState("");
  const [saving, setSaving] = useState(false);

  const deleteImage = async (index) => {
    try {
      const url = images[index];
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace('/storage/v1/object/public/club-images/', '');
      await supabase.storage.from("club-images").remove([path]);

      const updated = [...images];
      updated.splice(index, 1);
      setImages(updated);
      onUpdate(updated);
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  const handleUploadComplete = (uploaded) => {
    const updated = [...images, ...uploaded];
    setImages(updated);
    onUpdate(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavingError("");
    try {
      const response = await fetch("/api/club", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manager_id: managerId,
          images,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save images");
      }
      alert("Images saved successfully!");
    } catch (err) {
      setSavingError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <UploadImages
        clubId={clubId}
        managerId={managerId}
        onUploadComplete={handleUploadComplete}
      />

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <SortablePhoto
            key={img}
            id={img}
            url={img}
            onRemove={() => deleteImage(i)}
          />
        ))}
      </div>

      <button
        onClick={handleSave}
        className="bg-purple-600 text-white px-4 py-2 rounded"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
      {savingError && <p className="text-red-500 text-sm">{savingError}</p>}
    </div>
  );
}

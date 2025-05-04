// apps/web-manager/components/settings/ClubImageManager.js
"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  KeyboardSensor,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import SortablePhoto from "./SortablePhoto";

export default function ClubImageManager({ clubId, managerId, currentImages, onUpdate }) {
  const supabase = createClientComponentClient();
  const [images, setImages] = useState(currentImages || []);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      setError("");

      const fileName = `${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from("club-images")
        .upload(`clubs/${clubId}/${fileName}`, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase
        .storage
        .from("club-images")
        .getPublicUrl(`clubs/${clubId}/${fileName}`);

      if (data?.publicUrl) {
        const updated = [...images, data.publicUrl];
        setImages(updated);
        onUpdate(updated);
      }
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleRemove = async (index) => {
    try {
      const url = images[index];
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace("/storage/v1/object/public/club-images/", "");

      await supabase.storage.from("club-images").remove([path]);

      const updated = images.filter((_, i) => i !== index);
      setImages(updated);
      onUpdate(updated);
    } catch (err) {
      console.error("Image delete error:", err.message || err);
      setError("Failed to delete image.");
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = images.findIndex((img) => img === active.id);
    const newIndex = images.findIndex((img) => img === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      setActiveId(null);
      return;
    }

    const updated = arrayMove(images, oldIndex, newIndex);
    setImages(updated);
    onUpdate(updated);
    setActiveId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <label
          htmlFor="file-input"
          className="border-2 border-dashed border-gray-300 rounded p-4 w-full sm:w-auto text-center text-gray-500 cursor-pointer"
        >
          Drag image here or click to upload
        </label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={(e) => setActiveId(e.active.id)}
      >
        <SortableContext items={images} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {images.map((url, i) => (
              <SortablePhoto
                key={url}
                id={url}
                url={url}
                onRemove={() => handleRemove(i)}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <img
              src={activeId}
              alt="dragging"
              className="w-full h-32 object-cover rounded"
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

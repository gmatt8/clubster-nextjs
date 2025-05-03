// apps/web-manager/components/settings/UploadImages.js
"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function UploadImages({ clubId, currentImage, managerId, onUploadComplete }) {
  const supabase = createClientComponentClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      setUploadError("");
      const fileName = `${Date.now()}-${selectedFile.name}`;
      // Carica il file nel bucket "club-images" nella cartella del club
      const { error } = await supabase
        .storage
        .from("club-images")
        .upload(`clubs/${clubId}/${fileName}`, selectedFile, { upsert: true });
      
      if (error) {
        throw error;
      }

      // Ottieni l'URL pubblico per il file caricato
      const { data: publicUrlData } = supabase
        .storage
        .from("club-images")
        .getPublicUrl(`clubs/${clubId}/${fileName}`);

      if (publicUrlData?.publicUrl) {
        onUploadComplete([...(Array.isArray(currentImage) ? currentImage : []), publicUrlData.publicUrl]);
      } else {
        setUploadError("Impossibile ottenere l'URL pubblico del file");
      }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
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
          onChange={handleFileChange}
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
    </div>
  );
}

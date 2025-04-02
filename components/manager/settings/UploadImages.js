"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function UploadImages({
  clubId,
  currentImages,
  managerId,
  onUploadComplete,
}) {
  const supabase = createClientComponentClient();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Gestisce la selezione dei file
  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Carica i file su Supabase Storage
  const handleUpload = async () => {
    try {
      setUploading(true);
      setUploadError("");

      const uploadedUrls = [];
      for (const file of selectedFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        // Upload su bucket "club-images" nella cartella specifica per il club
        const { error } = await supabase
          .storage
          .from("club-images")
          .upload(`clubs/${clubId}/${fileName}`, file);

        if (error) {
          throw error;
        }

        // Otteniamo la URL pubblica per il file caricato
        const { data: publicUrlData } = supabase
          .storage
          .from("club-images")
          .getPublicUrl(`clubs/${clubId}/${fileName}`);

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      // Combiniamo le nuove immagini con quelle già presenti
      const newImages = [...(currentImages || []), ...uploadedUrls];

      // Aggiorniamo la colonna images del club nel database
      const response = await fetch("/api/club", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manager_id: managerId,
          images: newImages,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error updating images");
      }

      // Comunichiamo al parent le nuove immagini
      onUploadComplete(newImages);
      setSelectedFiles([]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Etichetta per l'input file */}
        <label
          htmlFor="file-input"
          className="border-2 border-dashed border-gray-300 rounded p-4 w-full sm:w-auto text-center text-gray-500 cursor-pointer"
        >
          Drag image here or click to upload
        </label>
        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
      </div>

      {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

      {/* Mostra i nomi dei file selezionati */}
      {selectedFiles.length > 0 && (
        <p className="text-sm text-gray-500">
          Selected files: {selectedFiles.map((f) => f.name).join(", ")}
        </p>
      )}
    </div>
  );
}

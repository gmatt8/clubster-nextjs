// apps/web-manager/components/events/StepDescription.js
"use client";

import UploadEventImage from "@components/events/UploadEventImage";

export default function StepDescription({
  name, setName,
  description, setDescription,
  musicGenres, setMusicGenres,
  ageRestriction, setAgeRestriction,
  dressCode, setDressCode,
  eventImage, setEventImage,
  predefinedGenres,
  managerId
}) {
  function handleGenreChange(genre, isChecked) {
    if (isChecked) {
      if (musicGenres.length >= 3) return;
      setMusicGenres([...musicGenres, genre]);
    } else {
      setMusicGenres(musicGenres.filter((g) => g !== genre));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium">Nome Evento*</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Descrizione*</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Generi Musicali*</label>
        <div className="flex flex-wrap gap-4">
          {predefinedGenres.map((genre) => (
            <label key={genre} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={musicGenres.includes(genre)}
                onChange={(e) => handleGenreChange(genre, e.target.checked)}
              />
              <span>{genre}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Età minima</label>
          <input
            value={ageRestriction}
            onChange={(e) => setAgeRestriction(e.target.value)}
            placeholder="+18"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Dress Code</label>
          <input
            value={dressCode}
            onChange={(e) => setDressCode(e.target.value)}
            placeholder="Casual, Elegante..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <UploadEventImage
          eventId="new"
          currentImage={eventImage}
          managerId={managerId}
          onUploadComplete={(url) => setEventImage(url)}
        />

        {eventImage && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Anteprima immagine:</label>
            <img src={eventImage} alt="Event preview" className="w-full max-w-xs rounded border" />
          </div>
        )}
      </div>
    </div>
  );
}

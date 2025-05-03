// apps/web-manager/components/settings/SortablePhoto.js
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortablePhoto({ id, url, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group"
    >
      <img
        src={url}
        alt="Club image"
        className="w-full h-32 object-cover rounded"
      />
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
        title="Delete image"
      >
        &times;
      </button>
    </div>
  );
}
